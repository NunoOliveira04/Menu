'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { canMemberApplyRestaurantUpdate } from '@/lib/auth/access';
import { getAuthenticatedUser, verifyUserRestaurantAccess } from '@/lib/auth/session';
import { createClient } from '@/lib/supabase/server';
import { createRestaurantSchema, updateRestaurantSchema } from '@/lib/validations/schemas';
import type { Json } from '@/types/database';
import type { ActionState } from './types';

function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const flattened = z.flattenError(error);
  return flattened.fieldErrors as Record<string, string[]>;
}

export async function createFirstRestaurantAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      status: 'error',
      message: 'A tua sessão expirou. Inicia sessão novamente.',
    };
  }

  const parsed = createRestaurantSchema.safeParse({
    name: formData.get('name'),
    slug: formData.get('slug'),
    description: formData.get('description') ?? '',
    location: formData.get('location') ?? '',
    style: formData.get('style') ?? 'classico',
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Revê os dados do restaurante antes de continuar.',
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc('create_owner_restaurant', {
    p_name: parsed.data.name,
    p_slug: parsed.data.slug,
    p_style: parsed.data.style,
    p_description: parsed.data.description || null,
    p_location: parsed.data.location || null,
  });

  if (error) {
    if (error.code === '23505') {
      return {
        status: 'error',
        message: 'Esse endereço (slug) já está em uso por outro restaurante.',
        fieldErrors: {
          slug: ['Escolhe outro identificador único para o link do teu menu.'],
        },
      };
    }

    if (error.code === 'P0001') {
      return {
        status: 'error',
        message:
          'Esta conta já pertence a um restaurante. No MVP apenas é permitida a criação inicial do primeiro restaurante.',
      };
    }

    return {
      status: 'error',
      message: 'Não foi possível criar o restaurante. Tenta novamente.',
    };
  }

  revalidatePath('/dashboard');
  redirect('/dashboard');
}

export async function updateRestaurantAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      status: 'error',
      message: 'Sessão inválida. Inicia sessão novamente.',
    };
  }

  const role = await verifyUserRestaurantAccess(
    user.userId,
    String(formData.get('restaurantId') ?? ''),
  );
  if (!role) {
    return {
      status: 'error',
      message: 'Não tens permissão para editar este restaurante.',
    };
  }

  const supabase = await createClient();
  const restaurantIdInput = String(formData.get('restaurantId') ?? '');

  const { data: currentRestaurant, error: currentError } = await supabase
    .from('restaurants')
    .select('id, slug, published')
    .eq('id', restaurantIdInput)
    .maybeSingle();

  if (currentError || !currentRestaurant) {
    return {
      status: 'error',
      message: 'Restaurante não encontrado.',
    };
  }

  // Se os campos slug/published estiverem disabled na UI de não-owners, faz fallback ao valor atual;
  // se um não-owner enviar valores diferentes no POST, rejeita explicitamente.
  const rawSlugEntry = formData.get('slug');
  const rawPublishedPresent = formData.has('published');

  const submittedSlug =
    typeof rawSlugEntry === 'string' && rawSlugEntry.trim().length > 0
      ? rawSlugEntry
      : currentRestaurant.slug;

  const submittedPublished =
    role === 'owner'
      ? formData.get('published') === 'on' || formData.get('published') === 'true'
      : rawPublishedPresent
        ? formData.get('published') === 'on' || formData.get('published') === 'true'
        : currentRestaurant.published;

  const parsed = updateRestaurantSchema.safeParse({
    restaurantId: restaurantIdInput,
    name: formData.get('name'),
    slug: submittedSlug,
    description: formData.get('description') ?? '',
    location: formData.get('location') ?? '',
    style: formData.get('style') ?? 'classico',
    published: submittedPublished,
    modules: {
      languages: formData.get('module_languages') === 'on',
      allergens: formData.get('module_allergens') === 'on',
      highlights: formData.get('module_highlights') === 'on',
      hours: formData.get('module_hours') === 'on',
    },
  });

  if (!parsed.success) {
    return {
      status: 'error',
      message: 'Verifica os campos assinalados.',
      fieldErrors: formatZodErrors(parsed.error),
    };
  }

  if (
    !canMemberApplyRestaurantUpdate({
      role,
      currentSlug: currentRestaurant.slug,
      nextSlug: parsed.data.slug,
      currentPublished: currentRestaurant.published,
      nextPublished: parsed.data.published,
    })
  ) {
    return {
      status: 'error',
      message:
        'Apenas o proprietário (owner) pode publicar/despublicar o menu ou alterar o identificador (slug).',
    };
  }

  const settingsPayload: Json = {
    modules: {
      languages: parsed.data.modules.languages,
      allergens: parsed.data.modules.allergens,
      highlights: parsed.data.modules.highlights,
      hours: parsed.data.modules.hours,
    },
  };

  const { error } = await supabase
    .from('restaurants')
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      location: parsed.data.location || null,
      style: parsed.data.style,
      published: parsed.data.published,
      settings: settingsPayload,
    })
    .eq('id', parsed.data.restaurantId);

  if (error) {
    if (error.code === '23505') {
      return {
        status: 'error',
        message: 'Esse identificador (slug) já está ocupado por outro restaurante.',
        fieldErrors: {
          slug: ['Escolhe outro identificador único.'],
        },
      };
    }

    if (error.code === '42501') {
      return {
        status: 'error',
        message:
          'Apenas o proprietário (owner) tem permissão para alterar o slug ou o estado de publicação.',
      };
    }

    return {
      status: 'error',
      message: 'Ocorreu um erro ao guardar as alterações do restaurante.',
    };
  }

  revalidatePath('/dashboard');
  revalidatePath('/dashboard/restaurante');
  if (currentRestaurant.slug !== parsed.data.slug) {
    revalidatePath(`/r/${currentRestaurant.slug}`);
  }
  revalidatePath(`/r/${parsed.data.slug}`);

  return {
    status: 'success',
    message: 'Definições do restaurante guardadas com sucesso.',
  };
}
