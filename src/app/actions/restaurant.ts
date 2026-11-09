'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { canMemberApplyRestaurantUpdate } from '@/lib/auth/access';
import { getAuthenticatedUser, verifyUserRestaurantAccess } from '@/lib/auth/session';
import { buildEnglishTranslationsJson } from '@/lib/modules/i18n';
import { DISH_PHOTOS_BUCKET, resolveDishPhotoObjectPath } from '@/lib/storage/dish-photos';
import { uploadValidatedPhoto } from '@/lib/storage/upload-photo';
import { createClient } from '@/lib/supabase/server';
import { parseMenuBackgroundId, resolveMenuBackground } from '@/lib/themes/backgrounds';
import { updateRestaurantSchema, weeklyHoursUpdateSchema } from '@/lib/validations/schemas';
import type { Json, TimeSlot } from '@/types/database';
import type { ActionState } from './types';

/** Imagens do restaurante guardadas no bucket dish-photos (capa e logotipo). */
const RESTAURANT_IMAGE_SLOTS = [
  {
    field: 'coverPhoto',
    removeField: 'removeCoverPhoto',
    column: 'cover_photo_path',
    prefix: 'cover-',
    label: 'a foto de capa',
  },
  {
    field: 'logoPhoto',
    removeField: 'removeLogo',
    column: 'logo_path',
    prefix: 'logo-',
    label: 'o logotipo',
  },
] as const;

type RestaurantImageColumn = (typeof RESTAURANT_IMAGE_SLOTS)[number]['column'];

function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const flattened = z.flattenError(error);
  return flattened.fieldErrors as Record<string, string[]>;
}

function parseHoursFromFormData(formData: FormData) {
  return Array.from({ length: 7 }, (_, dayIdx) => {
    const closed =
      formData.get(`day_${dayIdx}_closed`) === 'on' ||
      formData.get(`day_${dayIdx}_closed`) === 'true';

    const slots: TimeSlot[] = [];
    if (!closed) {
      const open1 = String(formData.get(`day_${dayIdx}_slot1_open`) ?? '').trim();
      const close1 = String(formData.get(`day_${dayIdx}_slot1_close`) ?? '').trim();
      if (open1 || close1) {
        slots.push({ open: open1, close: close1 });
      }

      const slot2Enabled =
        formData.get(`day_${dayIdx}_slot2_enabled`) === 'on' ||
        formData.get(`day_${dayIdx}_slot2_enabled`) === 'true';
      const open2 = String(formData.get(`day_${dayIdx}_slot2_open`) ?? '').trim();
      const close2 = String(formData.get(`day_${dayIdx}_slot2_close`) ?? '').trim();
      if (slot2Enabled || open2 || close2) {
        slots.push({ open: open2, close: close2 });
      }
    }

    return {
      dayOfWeek: dayIdx,
      closed,
      slots,
    };
  });
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

  const restaurantIdInput = String(formData.get('restaurantId') ?? '');
  const role = await verifyUserRestaurantAccess(user.userId, restaurantIdInput);
  if (!role) {
    return {
      status: 'error',
      message: 'Não tens permissão para editar este restaurante.',
    };
  }

  const supabase = await createClient();

  const { data: currentRestaurant, error: currentError } = await supabase
    .from('restaurants')
    .select('id, slug, published, translations, settings')
    .eq('id', restaurantIdInput)
    .maybeSingle();

  if (currentError || !currentRestaurant) {
    return {
      status: 'error',
      message: 'Restaurante não encontrado.',
    };
  }

  const rawSlugEntry = formData.get('slug');
  const rawPublishedPresent = formData.has('published');

  const submittedSlug =
    typeof rawSlugEntry === 'string' && rawSlugEntry.trim().length > 0
      ? rawSlugEntry
      : currentRestaurant.slug;

  // A carta está sempre pública: o formulário já não tem a opção «Publicar».
  // Se o campo vier no pedido (clientes antigos), respeita-o; senão o owner publica sempre
  // e os outros membros mantêm o estado atual.
  const submittedPublished = rawPublishedPresent
    ? formData.get('published') === 'on' || formData.get('published') === 'true'
    : role === 'owner'
      ? true
      : currentRestaurant.published;

  const languagesEnabled = formData.get('module_languages') === 'on';
  const hoursEnabled = formData.get('module_hours') === 'on';

  const parsed = updateRestaurantSchema.safeParse({
    restaurantId: restaurantIdInput,
    name: formData.get('name'),
    slug: submittedSlug,
    description: formData.get('description') ?? '',
    descriptionEn: formData.get('descriptionEn') ?? '',
    location: formData.get('location') ?? '',
    style: formData.get('style') ?? 'classico',
    published: submittedPublished,
    modules: {
      languages: languagesEnabled,
      allergens: formData.get('module_allergens') === 'on',
      highlights: formData.get('module_highlights') === 'on',
      hours: hoursEnabled,
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

  // Se o módulo de horários está ativo e o formulário enviou os campos de horário, valida-os já
  const hasHoursFields = formData.get('hours_submitted') === 'true';
  let validatedHoursPayload: Json | null = null;

  if (hoursEnabled && hasHoursFields) {
    const hoursValidation = weeklyHoursUpdateSchema.safeParse({
      restaurantId: parsed.data.restaurantId,
      days: parseHoursFromFormData(formData),
    });

    if (!hoursValidation.success) {
      const firstIssue = hoursValidation.error.issues[0]?.message;
      return {
        status: 'error',
        message: firstIssue ?? 'Verifica os horários semanais introduzidos.',
      };
    }

    validatedHoursPayload = hoursValidation.data.days.map((day) => ({
      day_of_week: day.dayOfWeek,
      closed: day.closed,
      slots: day.closed
        ? []
        : day.slots.map((slot) => ({
            open: slot.open,
            close: slot.close,
          })),
    }));
  }

  // Capa e logotipo: só se lê/escreve a coluna quando o dono altera ou remove a imagem.
  const imagePayload: Partial<Record<RestaurantImageColumn, string | null>> = {};
  const uploadedImagePaths: string[] = [];
  const previousImagePaths: string[] = [];

  const removeUploadedImages = async () => {
    if (uploadedImagePaths.length > 0) {
      await supabase.storage.from(DISH_PHOTOS_BUCKET).remove(uploadedImagePaths);
    }
  };

  for (const slot of RESTAURANT_IMAGE_SLOTS) {
    const entry = formData.get(slot.field);
    const hasNewImage = entry instanceof File && entry.size > 0;
    const removeImage =
      formData.get(slot.removeField) === 'on' || formData.get(slot.removeField) === 'true';
    if (!hasNewImage && !removeImage) {
      continue;
    }

    const { data: imageRow, error: imageReadError } = await supabase
      .from('restaurants')
      .select(slot.column)
      .eq('id', parsed.data.restaurantId)
      .maybeSingle();

    if (imageReadError) {
      await removeUploadedImages();
      return {
        status: 'error',
        message: `Não foi possível atualizar ${slot.label}. Tenta novamente.`,
      };
    }

    const previousPath = resolveDishPhotoObjectPath(
      (imageRow as Record<string, string | null> | null)?.[slot.column] ?? null,
    );
    if (previousPath) {
      previousImagePaths.push(previousPath);
    }

    let nextPath: string | null = null;
    if (hasNewImage) {
      const upload = await uploadValidatedPhoto(parsed.data.restaurantId, entry, slot.prefix);
      if (!upload.ok) {
        await removeUploadedImages();
        return {
          status: 'error',
          message: upload.error,
          fieldErrors: { [slot.field]: [upload.error] },
        };
      }
      nextPath = upload.objectPath;
      if (nextPath) {
        uploadedImagePaths.push(nextPath);
      }
    }
    imagePayload[slot.column] = nextPath;
  }

  // Fundo da carta («Fundo» nas definições). Sem o campo, mantém o fundo atual.
  const rawBackground = formData.get('background');
  const background =
    typeof rawBackground === 'string'
      ? resolveMenuBackground(rawBackground).id
      : parseMenuBackgroundId(currentRestaurant.settings);

  const settingsPayload: Json = {
    modules: {
      languages: parsed.data.modules.languages,
      allergens: parsed.data.modules.allergens,
      highlights: parsed.data.modules.highlights,
      hours: parsed.data.modules.hours,
    },
    appearance: { background },
  };

  const nextTranslations = languagesEnabled
    ? buildEnglishTranslationsJson(currentRestaurant.translations, {
        descriptionEn: parsed.data.descriptionEn,
      })
    : (currentRestaurant.translations ?? {});

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
      translations: nextTranslations,
      ...imagePayload,
    })
    .eq('id', parsed.data.restaurantId);

  if (error) {
    await removeUploadedImages();
  }

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

  const stalePaths = previousImagePaths.filter((path) => !uploadedImagePaths.includes(path));
  if (stalePaths.length > 0) {
    await supabase.storage.from(DISH_PHOTOS_BUCKET).remove(stalePaths);
  }

  if (validatedHoursPayload) {
    const { error: hoursRpcError } = await supabase.rpc('upsert_restaurant_hours', {
      p_restaurant_id: parsed.data.restaurantId,
      p_days: validatedHoursPayload,
    });

    if (hoursRpcError) {
      return {
        status: 'error',
        message:
          'As definições foram guardadas, mas ocorreu um erro ao atualizar o horário semanal.',
      };
    }
  }

  revalidatePath('/admin');
  revalidatePath('/admin/restaurante');
  if (currentRestaurant.slug !== parsed.data.slug) {
    revalidatePath(`/r/${currentRestaurant.slug}`);
  }
  revalidatePath(`/r/${parsed.data.slug}`);

  return {
    status: 'success',
    message: 'Definições do restaurante guardadas com sucesso.',
  };
}
