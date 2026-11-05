'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getAuthenticatedUser, verifyUserRestaurantAccess } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { moveItemInList } from '@/lib/utils/reorder';
import {
  createCategorySchema,
  deleteCategorySchema,
  reorderCategorySchema,
  updateCategorySchema,
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

export async function createCategoryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { status: 'error', message: 'Sessão expirada. Inicia sessão novamente.' };
  }

  const parsed = createCategorySchema.safeParse({
    restaurantId: formData.get('restaurantId'),
    name: formData.get('name'),
    description: formData.get('description') ?? '',
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Verifica os dados da categoria.',
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  const role = await verifyUserRestaurantAccess(user.userId, parsed.data.restaurantId);
  if (!role) {
    return { status: 'error', message: 'Sem permissão para gerir categorias deste restaurante.' };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from('categories')
    .select('position')
    .eq('restaurant_id', parsed.data.restaurantId)
    .order('position', { ascending: false })
    .limit(1);

  const nextPosition = existing && existing[0] ? existing[0].position + 1 : 0;

  const { error } = await supabase.from('categories').insert({
    restaurant_id: parsed.data.restaurantId,
    name: parsed.data.name,
    description: parsed.data.description || null,
    position: nextPosition,
  });

  if (error) {
    return { status: 'error', message: 'Não foi possível criar a categoria.' };
  }

  await revalidateRestaurantMenu(parsed.data.restaurantId);
  return { status: 'success', message: 'Categoria adicionada ao menu.' };
}

export async function updateCategoryAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { status: 'error', message: 'Sessão expirada. Inicia sessão novamente.' };
  }

  const parsed = updateCategorySchema.safeParse({
    restaurantId: formData.get('restaurantId'),
    categoryId: formData.get('categoryId'),
    name: formData.get('name'),
    description: formData.get('description') ?? '',
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Verifica os dados da categoria.',
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  const role = await verifyUserRestaurantAccess(user.userId, parsed.data.restaurantId);
  if (!role) {
    return { status: 'error', message: 'Sem permissão para editar esta categoria.' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('categories')
    .update({
      name: parsed.data.name,
      description: parsed.data.description || null,
    })
    .eq('id', parsed.data.categoryId)
    .eq('restaurant_id', parsed.data.restaurantId);

  if (error) {
    return { status: 'error', message: 'Erro ao atualizar a categoria.' };
  }

  await revalidateRestaurantMenu(parsed.data.restaurantId);
  return { status: 'success', message: 'Categoria atualizada.' };
}

export async function deleteCategoryAction(formData: FormData): Promise<ActionState> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { status: 'error', message: 'Sessão expirada.' };
  }

  const parsed = deleteCategorySchema.safeParse({
    restaurantId: formData.get('restaurantId'),
    categoryId: formData.get('categoryId'),
  });

  if (!parsed.success) {
    return { status: 'error', message: 'Pedido inválido.' };
  }

  const role = await verifyUserRestaurantAccess(user.userId, parsed.data.restaurantId);
  if (!role) {
    return { status: 'error', message: 'Sem permissão para eliminar categorias.' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', parsed.data.categoryId)
    .eq('restaurant_id', parsed.data.restaurantId);

  if (error) {
    return { status: 'error', message: 'Não foi possível eliminar a categoria.' };
  }

  await revalidateRestaurantMenu(parsed.data.restaurantId);
  return { status: 'success', message: 'Categoria eliminada.' };
}

export async function reorderCategoryAction(formData: FormData): Promise<ActionState> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return { status: 'error', message: 'Sessão expirada.' };
  }

  const parsed = reorderCategorySchema.safeParse({
    restaurantId: formData.get('restaurantId'),
    categoryId: formData.get('categoryId'),
    direction: formData.get('direction'),
  });

  if (!parsed.success) {
    return { status: 'error', message: 'Parâmetros de ordenação inválidos.' };
  }

  const role = await verifyUserRestaurantAccess(user.userId, parsed.data.restaurantId);
  if (!role) {
    return { status: 'error', message: 'Sem permissão para reordenar categorias.' };
  }

  const supabase = await createClient();
  const { data: categories, error: fetchError } = await supabase
    .from('categories')
    .select('id, position')
    .eq('restaurant_id', parsed.data.restaurantId)
    .order('position', { ascending: true })
    .order('created_at', { ascending: true });

  if (fetchError || !categories) {
    return { status: 'error', message: 'Erro ao ler categorias para reordenação.' };
  }

  const normalized = categories.map((cat, idx) => ({ id: cat.id, position: idx }));
  const reordered = moveItemInList(normalized, parsed.data.categoryId, parsed.data.direction);

  const { error: rpcError } = await supabase.rpc('reorder_categories', {
    p_restaurant_id: parsed.data.restaurantId,
    p_ordered_ids: reordered.map((item) => item.id),
  });

  if (rpcError) {
    return { status: 'error', message: 'Não foi possível atualizar a ordem das categorias.' };
  }

  await revalidateRestaurantMenu(parsed.data.restaurantId);
  return { status: 'success', message: 'Ordem das categorias atualizada.' };
}
