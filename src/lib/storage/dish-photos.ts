import type { SupabaseClient } from '@supabase/supabase-js';
import { extractRestaurantIdFromStoragePath } from '@/lib/auth/access';
import type { Database, DishRow } from '@/types/database';

export const DISH_PHOTOS_BUCKET = 'dish-photos';

/**
 * TTL alargado para URLs assinados de fotografias servidas em SSR (24 horas = 86 400 s),
 * evitando que imagens expirem quando um separador de menu permanece aberto durante o serviço.
 */
export const DISH_PHOTO_SIGNED_URL_TTL_SECONDS = 24 * 60 * 60;

/**
 * Intervalo de revalidação automática no cliente (a cada 6 horas) para renovar signed URLs
 * antes de atingirem o TTL de 24 horas.
 */
export const DISH_PHOTO_REFRESH_INTERVAL_MS = 6 * 60 * 60 * 1000;

const STORAGE_URL_MARKERS = [
  `/storage/v1/object/public/${DISH_PHOTOS_BUCKET}/`,
  `/storage/v1/object/sign/${DISH_PHOTOS_BUCKET}/`,
  `/storage/v1/object/authenticated/${DISH_PHOTOS_BUCKET}/`,
] as const;

export function isExternalHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

/**
 * Extrai o caminho interno do objeto (`<restaurant_id>/<ficheiro>`) no bucket `dish-photos`.
 * Suporta tanto caminhos internos guardados diretamente na BD como URLs antigos do Supabase Storage.
 * Devolve `null` para URLs externos (ex.: fotografias de pratos na seed, Unsplash/Pexels).
 */
export function resolveDishPhotoObjectPath(
  storedPhotoRef: string | null | undefined,
): string | null {
  if (!storedPhotoRef) {
    return null;
  }

  const trimmed = storedPhotoRef.trim();
  if (!trimmed) {
    return null;
  }

  if (!isExternalHttpUrl(trimmed)) {
    const cleanPath = trimmed.replace(/^\/+/, '');
    return extractRestaurantIdFromStoragePath(cleanPath) ? cleanPath : null;
  }

  for (const marker of STORAGE_URL_MARKERS) {
    const idx = trimmed.indexOf(marker);
    if (idx !== -1) {
      const afterMarker = trimmed.slice(idx + marker.length);
      const withoutQuery = afterMarker.split('?')[0] ?? '';
      const decoded = decodeURIComponent(withoutQuery);
      return extractRestaurantIdFromStoragePath(decoded) ? decoded : null;
    }
  }

  return null;
}

/**
 * Resolve as referências `photo_url` de uma lista de pratos no servidor:
 * - Objetos no bucket privado `dish-photos` recebem signed URLs gerados em lote (`createSignedUrls`)
 *   com TTL de 24 horas respeitando as políticas SELECT (restaurante publicado ou membro autenticado).
 * - URLs externos (ex.: seed demo) são preservados tal como estão.
 */
export async function attachSignedDishPhotoUrls(
  supabase: SupabaseClient<Database>,
  dishes: readonly DishRow[],
  ttlSeconds: number = DISH_PHOTO_SIGNED_URL_TTL_SECONDS,
): Promise<DishRow[]> {
  if (dishes.length === 0) {
    return [];
  }

  const pathsToSign = Array.from(
    new Set(
      dishes
        .map((dish) => resolveDishPhotoObjectPath(dish.photo_url))
        .filter((path): path is string => path !== null),
    ),
  );

  if (pathsToSign.length === 0) {
    return [...dishes];
  }

  const { data: signedItems, error } = await supabase.storage
    .from(DISH_PHOTOS_BUCKET)
    .createSignedUrls(pathsToSign, ttlSeconds);

  const signedMap = new Map<string, string>();
  if (!error && signedItems) {
    for (const entry of signedItems) {
      if (entry.path && entry.signedUrl && !entry.error) {
        signedMap.set(entry.path, entry.signedUrl);
      }
    }
  }

  return dishes.map((dish) => {
    const objectPath = resolveDishPhotoObjectPath(dish.photo_url);
    if (!objectPath) {
      return dish;
    }

    return {
      ...dish,
      photo_url: signedMap.get(objectPath) ?? null,
    };
  });
}
