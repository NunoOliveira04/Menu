import { buildDishPhotoStoragePath } from '@/lib/auth/access';
import { DISH_PHOTOS_BUCKET } from '@/lib/storage/dish-photos';
import { createClient } from '@/lib/supabase/server';
import { MAX_DISH_PHOTO_BYTES, validateDishPhotoFile } from '@/lib/validations/schemas';

export type PhotoUploadResult =
  { ok: true; objectPath: string | null } | { ok: false; error: string };

/**
 * Valida (tamanho, MIME e magic bytes) e envia uma fotografia para `dish-photos/<restaurant_id>/`.
 * Devolve `objectPath: null` quando o campo vem vazio (nenhuma foto escolhida).
 */
export async function uploadValidatedPhoto(
  restaurantId: string,
  fileEntry: FormDataEntryValue | null,
  filePrefix = '',
): Promise<PhotoUploadResult> {
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

  const uniqueName = `${filePrefix}${Date.now()}-${crypto.randomUUID()}.${validation.extension}`;
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
