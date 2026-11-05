'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { buildDishPhotoStoragePath } from '@/lib/auth/access';
import { getAuthenticatedUser, verifyUserRestaurantAccess } from '@/lib/auth/session';
import { buildEnglishTranslationsJson } from '@/lib/modules/i18n';
import { DISH_PHOTOS_BUCKET, resolveDishPhotoObjectPath } from '@/lib/storage/dish-photos';
import { createClient } from '@/lib/supabase/server';
import { moveItemInList } from '@/lib/utils/reorder';
import {
  MAX_DISH_PHOTO_BYTES,
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

async function uploadValidatedPhoto(
  restaurantId: string,
  fileEntry: FormDataEntryValue | null,
): Promise<{ ok: true; objectPath: string | null } | { ok: false; error: string }> {
  if (!(fileEntry instanceof File) || fileEntry.size === 0) {
    return { ok: true, objectPath: null };
  }

  if (fileEntry.size > MAX_DISH_PHOTO_BYTES) {
    return {
      ok: false,
      error: 'A fotografia excede o tamanho máximo permitido de 5 MB.',
    };
  }

  const arrayBuffer = await fileEntry.arrayBuffer();
  const validation = validateDishPhotoFile({
    size: fileEntry.size,
    type: fileEntry.type,
    name: fileEntry.name,
    bytes: arrayBuffer,
  });

  if (!validation.valid) {
    return { ok: false, error: validation.error };
  }

  const uniqueName = `${Date.now()}-${crypto.randomUUID()}.${validation.extension}`;
  const storagePath = buildDishPhotoStoragePath(restaurantId, uniqueName);

  const supabase = await createClient();
  const { error: uploadError } = await supabase.storage
    .from(DISH_PHOTOS_BUCKET)
    .upload(storagePath, arrayBuffer, {
      contentType: validation.mimeType,
      upsert: false,
    });

  if (uploadError) {
    return {
      ok: false,
      error: 'Não foi possível carregar a fotografia para o armazenamento.',
    };
  }

  return { ok: true, objectPath: storagePath };
}

export async function createDishAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { status: 'error', message: 'Sessão expirada. Inicia sessão novamente.' };
  }

  const rawAllergens = formData.getAll('allergens').map((v) => String(v));
  const rawHighlight = formData.get('highlight');

  const parsed = createDishSchema.safeParse({
    restaurantId: formData.get('restaurantId'),
    categoryId: formData.get('categoryId'),
    name: formData.get('name'),
    description: formData.get('description') ?? '',
    nameEn: formData.get('nameEn') ?? '',
    descriptionEn: formData.get('descriptionEn') ?? '',
    priceCents: formData.get('price'),
    available: formData.get('available') === 'on' || formData.get('available') === 'true',
    allergens: rawAllergens,
    highlight: typeof rawHighlight === 'string' ? rawHighlight : null,
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

  const translationsPayload = buildEnglishTranslationsJson(null, {
    nameEn: parsed.data.nameEn,
    descriptionEn: parsed.data.descriptionEn,
  });

  const { error } = await supabase.from('dishes').insert({
    restaurant_id: parsed.data.restaurantId,
    category_id: parsed.data.categoryId,
    name: parsed.data.name,
    description: parsed.data.description || null,
    price_cents: parsed.data.priceCents,
    photo_url: photoUpload.objectPath,
    available: parsed.data.available,
    position: nextPosition,
    translations: translationsPayload,
    allergens: parsed.data.allergens,
    highlight: parsed.data.highlight,
  });

  if (error) {
    if (photoUpload.objectPath) {
      await supabase.storage.from(DISH_PHOTOS_BUCKET).remove([photoUpload.objectPath]);
    }
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

  const rawAllergens = formData.getAll('allergens').map((v) => String(v));
  const rawHighlight = formData.get('highlight');

  const parsed = updateDishSchema.safeParse({
    restaurantId: formData.get('restaurantId'),
    dishId: formData.get('dishId'),
    categoryId: formData.get('categoryId'),
    name: formData.get('name'),
    description: formData.get('description') ?? '',
    nameEn: formData.get('nameEn') ?? '',
    descriptionEn: formData.get('descriptionEn') ?? '',
    priceCents: formData.get('price'),
    available: formData.get('available') === 'on' || formData.get('available') === 'true',
    removePhoto: formData.get('removePhoto') === 'on' || formData.get('removePhoto') === 'true',
    allergens: rawAllergens,
    highlight: typeof rawHighlight === 'string' ? rawHighlight : null,
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
    .select('photo_url, translations, allergens, highlight')
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

  let nextPhotoRef = currentDish.photo_url;
  const oldStoragePath = resolveDishPhotoObjectPath(currentDish.photo_url);

  if (photoUpload.objectPath) {
    nextPhotoRef = photoUpload.objectPath;
  } else if (parsed.data.removePhoto) {
    nextPhotoRef = null;
  }

  const hasTranslationsInputs = formData.has('nameEn') || formData.has('descriptionEn');
  const nextTranslations = hasTranslationsInputs
    ? buildEnglishTranslationsJson(currentDish.translations, {
        nameEn: parsed.data.nameEn,
        descriptionEn: parsed.data.descriptionEn,
      })
    : currentDish.translations;

  const hasAllergensModuleActive = formData.get('allergens_module_active') === 'true';
  const nextAllergens = hasAllergensModuleActive ? parsed.data.allergens : currentDish.allergens;

  const hasHighlightsModuleActive = formData.get('highlights_module_active') === 'true';
  const nextHighlight = hasHighlightsModuleActive ? parsed.data.highlight : currentDish.highlight;

  const { error } = await supabase
    .from('dishes')
    .update({
      category_id: parsed.data.categoryId,
      name: parsed.data.name,
      description: parsed.data.description || null,
      price_cents: parsed.data.priceCents,
      photo_url: nextPhotoRef,
      available: parsed.data.available,
      translations: nextTranslations,
      allergens: nextAllergens,
      highlight: nextHighlight,
    })
    .eq('id', parsed.data.dishId)
    .eq('restaurant_id', parsed.data.restaurantId);

  if (error) {
    if (photoUpload.objectPath) {
      await supabase.storage.from(DISH_PHOTOS_BUCKET).remove([photoUpload.objectPath]);
    }
    return { status: 'error', message: 'Não foi possível guardar as alterações ao prato.' };
  }

  if (oldStoragePath && (photoUpload.objectPath || parsed.data.removePhoto)) {
    await supabase.storage.from(DISH_PHOTOS_BUCKET).remove([oldStoragePath]);
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

  const oldPath = resolveDishPhotoObjectPath(currentDish?.photo_url);
  if (oldPath) {
    await supabase.storage.from(DISH_PHOTOS_BUCKET).remove([oldPath]);
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

  const { error: rpcError } = await supabase.rpc('reorder_dishes', {
    p_restaurant_id: parsed.data.restaurantId,
    p_category_id: parsed.data.categoryId,
    p_ordered_ids: reordered.map((item) => item.id),
  });

  if (rpcError) {
    return { status: 'error', message: 'Não foi possível atualizar a ordem dos pratos.' };
  }

  await revalidateRestaurantMenu(parsed.data.restaurantId);
  return { status: 'success', message: 'Ordem dos pratos atualizada.' };
}
