'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { buildDishPhotoStoragePath } from '@/lib/auth/access';
import { getAuthenticatedUser, verifyUserRestaurantAccess } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { moveItemInList } from '@/lib/utils/reorder';
import {
  createDishSchema,
  deleteDishSchema,
  reorderDishSchema,
  toggleDishAvailabilitySchema,
  updateDishSchema,
  validateDishPhotoFile,
} from '@/lib/validations/schemas';
import type { ActionState } from './types';

function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const flattened = z.flattenError(error);
  return flattened.fieldErrors as Record<string, string[]>;
}

async function revalidateRestaurantMenu(restaurantId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('restaurants')
    .select('slug')
    .eq('id', restaurantId)
    .maybeSingle();

  revalidatePath('/dashboard');
  if (data?.slug) {
    revalidatePath(`/r/${data.slug}`);
  }
}

function extractStoragePathFromPublicUrl(photoUrl: string | null): string | null {
  if (!photoUrl) {
    return null;
  }
  const marker = '/storage/v1/object/public/dish-photos/';
  const index = photoUrl.indexOf(marker);
  if (index === -1) {
    return null;
  }
  return decodeURIComponent(photoUrl.slice(index + marker.length));
}

async function uploadValidatedPhoto(
  restaurantId: string,
  fileEntry: FormDataEntryValue | null,
): Promise<{ ok: true; publicUrl: string | null } | { ok: false; error: string }> {
  if (!(fileEntry instanceof File) || fileEntry.size === 0) {
    return { ok: true, publicUrl: null };
  }

  const validation = validateDishPhotoFile({
    size: fileEntry.size,
    type: fileEntry.type,
    name: fileEntry.name,
  });

  if (!validation.valid) {
    return { ok: false, error: validation.error };
  }

  const uniqueName = `${Date.now()}-${crypto.randomUUID()}.${validation.extension}`;
  const storagePath = buildDishPhotoStoragePath(restaurantId, uniqueName);

  const supabase = await createClient();
  const arrayBuffer = await fileEntry.arrayBuffer();

  const { error: uploadError } = await supabase.storage
    .from('dish-photos')
    .upload(storagePath, arrayBuffer, {
      contentType: fileEntry.type,
      upsert: false,
    });

  if (uploadError) {
    return {
      ok: false,
      error: 'Não foi possível carregar a fotografia para o armazenamento.',
    };
  }

  const { data: urlData } = supabase.storage.from('dish-photos').getPublicUrl(storagePath);
  return { ok: true, publicUrl: urlData.publicUrl };
}

export async function createDishAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { status: 'error', message: 'Sessão expirada. Inicia sessão novamente.' };
  }

  const parsed = createDishSchema.safeParse({
    restaurantId: formData.get('restaurantId'),
    categoryId: formData.get('categoryId'),
    name: formData.get('name'),
    description: formData.get('description') ?? '',
    priceCents: formData.get('price'),
    available: formData.get('available') === 'on' || formData.get('available') === 'true',
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Verifica os dados do prato.',
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  const role = await verifyUserRestaurantAccess(user.userId, parsed.data.restaurantId);
  if (!role) {
    return { status: 'error', message: 'Sem permissão para adicionar pratos a este restaurante.' };
  }

  const photoUpload = await uploadValidatedPhoto(parsed.data.restaurantId, formData.get('photo'));

  if (!photoUpload.ok) {
    return {
      status: 'error',
      message: photoUpload.error,
      fieldErrors: { photo: [photoUpload.error] },
    };
  }

  const supabase = await createClient();
  const { data: existingDishes } = await supabase
    .from('dishes')
    .select('position')
    .eq('restaurant_id', parsed.data.restaurantId)
    .eq('category_id', parsed.data.categoryId)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition = existingDishes && existingDishes[0] ? existingDishes[0].position + 1 : 0;

  const { error } = await supabase.from('dishes').insert({
    restaurant_id: parsed.data.restaurantId,
    category_id: parsed.data.categoryId,
    name: parsed.data.name,
    description: parsed.data.description || null,
    price_cents: parsed.data.priceCents,
    photo_url: photoUpload.publicUrl,
    available: parsed.data.available,
    position: nextPosition,
    translations: {},
  });

  if (error) {
    return { status: 'error', message: 'Não foi possível criar o prato.' };
  }

  await revalidateRestaurantMenu(parsed.data.restaurantId);
  return { status: 'success', message: 'Prato adicionado com sucesso.' };
}

export async function updateDishAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { status: 'error', message: 'Sessão expirada. Inicia sessão novamente.' };
  }

  const parsed = updateDishSchema.safeParse({
    restaurantId: formData.get('restaurantId'),
    dishId: formData.get('dishId'),
    categoryId: formData.get('categoryId'),
    name: formData.get('name'),
    description: formData.get('description') ?? '',
    priceCents: formData.get('price'),
    available: formData.get('available') === 'on' || formData.get('available') === 'true',
    removePhoto: formData.get('removePhoto') === 'on' || formData.get('removePhoto') === 'true',
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Verifica os dados do prato.',
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  const role = await verifyUserRestaurantAccess(user.userId, parsed.data.restaurantId);
  if (!role) {
    return { status: 'error', message: 'Sem permissão para editar este prato.' };
  }

  const supabase = await createClient();
  const { data: currentDish, error: fetchError } = await supabase
    .from('dishes')
    .select('photo_url')
    .eq('id', parsed.data.dishId)
    .eq('restaurant_id', parsed.data.restaurantId)
    .maybeSingle();

  if (fetchError || !currentDish) {
    return { status: 'error', message: 'Prato não encontrado.' };
  }

  const photoUpload = await uploadValidatedPhoto(parsed.data.restaurantId, formData.get('photo'));

  if (!photoUpload.ok) {
    return {
      status: 'error',
      message: photoUpload.error,
      fieldErrors: { photo: [photoUpload.error] },
    };
  }

  let nextPhotoUrl = currentDish.photo_url;
  const oldStoragePath = extractStoragePathFromPublicUrl(currentDish.photo_url);

  if (photoUpload.publicUrl) {
    nextPhotoUrl = photoUpload.publicUrl;
    if (oldStoragePath) {
      await supabase.storage.from('dish-photos').remove([oldStoragePath]);
    }
  } else if (parsed.data.removePhoto) {
    nextPhotoUrl = null;
    if (oldStoragePath) {
      await supabase.storage.from('dish-photos').remove([oldStoragePath]);
    }
  }

  const { error } = await supabase
    .from('dishes')
    .update({
      category_id: parsed.data.categoryId,
      name: parsed.data.name,
      description: parsed.data.description || null,
      price_cents: parsed.data.priceCents,
      photo_url: nextPhotoUrl,
      available: parsed.data.available,
    })
    .eq('id', parsed.data.dishId)
    .eq('restaurant_id', parsed.data.restaurantId);

  if (error) {
    return { status: 'error', message: 'Não foi possível guardar as alterações ao prato.' };
  }

  await revalidateRestaurantMenu(parsed.data.restaurantId);
  return { status: 'success', message: 'Prato atualizado com sucesso.' };
}

export async function deleteDishAction(formData: FormData): Promise<ActionState> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { status: 'error', message: 'Sessão expirada.' };
  }

  const parsed = deleteDishSchema.safeParse({
    restaurantId: formData.get('restaurantId'),
    dishId: formData.get('dishId'),
  });

  if (!parsed.success) {
    return { status: 'error', message: 'Pedido inválido.' };
  }

  const role = await verifyUserRestaurantAccess(user.userId, parsed.data.restaurantId);
  if (!role) {
    return { status: 'error', message: 'Sem permissão para eliminar pratos.' };
  }

  const supabase = await createClient();
  const { data: currentDish } = await supabase
    .from('dishes')
    .select('photo_url')
    .eq('id', parsed.data.dishId)
    .eq('restaurant_id', parsed.data.restaurantId)
    .maybeSingle();

  const { error } = await supabase
    .from('dishes')
    .delete()
    .eq('id', parsed.data.dishId)
    .eq('restaurant_id', parsed.data.restaurantId);

  if (error) {
    return { status: 'error', message: 'Não foi possível eliminar o prato.' };
  }

  const oldPath = extractStoragePathFromPublicUrl(currentDish?.photo_url ?? null);
  if (oldPath) {
    await supabase.storage.from('dish-photos').remove([oldPath]);
  }

  await revalidateRestaurantMenu(parsed.data.restaurantId);
  return { status: 'success', message: 'Prato eliminado.' };
}

export async function toggleDishAvailabilityAction(formData: FormData): Promise<ActionState> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { status: 'error', message: 'Sessão expirada.' };
  }

  const parsed = toggleDishAvailabilitySchema.safeParse({
    restaurantId: formData.get('restaurantId'),
    dishId: formData.get('dishId'),
    available: formData.get('available') === 'true',
  });

  if (!parsed.success) {
    return { status: 'error', message: 'Pedido inválido.' };
  }

  const role = await verifyUserRestaurantAccess(user.userId, parsed.data.restaurantId);
  if (!role) {
    return { status: 'error', message: 'Sem permissão.' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('dishes')
    .update({ available: parsed.data.available })
    .eq('id', parsed.data.dishId)
    .eq('restaurant_id', parsed.data.restaurantId);

  if (error) {
    return { status: 'error', message: 'Não foi possível alterar a disponibilidade.' };
  }

  await revalidateRestaurantMenu(parsed.data.restaurantId);
  return { status: 'success', message: 'Disponibilidade atualizada.' };
}

export async function reorderDishAction(formData: FormData): Promise<ActionState> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { status: 'error', message: 'Sessão expirada.' };
  }

  const parsed = reorderDishSchema.safeParse({
    restaurantId: formData.get('restaurantId'),
    categoryId: formData.get('categoryId'),
    dishId: formData.get('dishId'),
    direction: formData.get('direction'),
  });

  if (!parsed.success) {
    return { status: 'error', message: 'Parâmetros inválidos.' };
  }

  const role = await verifyUserRestaurantAccess(user.userId, parsed.data.restaurantId);
  if (!role) {
    return { status: 'error', message: 'Sem permissão para reordenar pratos.' };
  }

  const supabase = await createClient();
  const { data: dishes, error: fetchError } = await supabase
    .from('dishes')
    .select('id, position')
    .eq('restaurant_id', parsed.data.restaurantId)
    .eq('category_id', parsed.data.categoryId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (fetchError || !dishes) {
    return { status: 'error', message: 'Erro ao obter pratos da categoria.' };
  }

  const normalized = dishes.map((d, idx) => ({ id: d.id, position: idx }));
  const reordered = moveItemInList(normalized, parsed.data.dishId, parsed.data.direction);

  await Promise.all(
    reordered.map((item) =>
      supabase
        .from('dishes')
        .update({ position: item.position })
        .eq('id', item.id)
        .eq('restaurant_id', parsed.data.restaurantId),
    ),
  );

  await revalidateRestaurantMenu(parsed.data.restaurantId);
  return { status: 'success', message: 'Ordem dos pratos atualizada.' };
}
