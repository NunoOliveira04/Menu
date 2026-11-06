import { extractRestaurantIdFromStoragePath } from '@/lib/auth/access';

export const DISH_PHOTOS_BUCKET = 'dish-photos';

/** Prefixo dos URLs públicos e estáveis do bucket `dish-photos` (bucket público para leitura). */
export const DISH_PHOTOS_PUBLIC_PATH_PREFIX = `/storage/v1/object/public/${DISH_PHOTOS_BUCKET}/`;

/** Formatos de URL do Supabase Storage que podem existir em `photo_url` antigos. */
const STORAGE_URL_MARKERS = [
  DISH_PHOTOS_PUBLIC_PATH_PREFIX,
  `/storage/v1/object/sign/${DISH_PHOTOS_BUCKET}/`,
  `/storage/v1/object/authenticated/${DISH_PHOTOS_BUCKET}/`,
] as const;

export function isExternalHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

/**
 * Extrai o caminho interno do objeto (`<restaurant_id>/<ficheiro>`) no bucket `dish-photos`.
 * Suporta caminhos guardados diretamente na BD (formato atual) e URLs antigos do Supabase Storage
 * (signed, authenticated ou public). Devolve `null` para URLs externos (ex.: Unsplash/Pexels da seed).
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
      const withoutQuery = afterMarker.split(/[?#]/)[0] ?? '';
      let decoded: string;
      try {
        decoded = decodeURIComponent(withoutQuery);
      } catch {
        return null;
      }
      return extractRestaurantIdFromStoragePath(decoded) ? decoded : null;
    }
  }

  return null;
}

/** Constrói o URL público estável de um objeto do bucket `dish-photos`. */
export function buildDishPhotoPublicUrl(objectPath: string, supabaseUrl: string): string {
  const base = supabaseUrl.trim().replace(/\/+$/, '');
  const encodedPath = objectPath
    .replace(/^\/+/, '')
    .split('/')
    .map((segment) => encodeURIComponent(segment))
    .join('/');
  return `${base}${DISH_PHOTOS_PUBLIC_PATH_PREFIX}${encodedPath}`;
}

/**
 * Converte o valor guardado em `photo_url` (ou `cover_photo_path`) no URL a mostrar:
 * - caminho do objeto ou URL antigo do Supabase (incl. signed URLs expirados) → URL público estável;
 * - URL externo (seed demo) → mantido tal como está;
 * - vazio ou inválido → `null`.
 */
export function resolvePhotoDisplayUrl(
  storedPhotoRef: string | null | undefined,
  supabaseUrl: string,
): string | null {
  const objectPath = resolveDishPhotoObjectPath(storedPhotoRef);
  if (objectPath) {
    return buildDishPhotoPublicUrl(objectPath, supabaseUrl);
  }

  const trimmed = storedPhotoRef?.trim() ?? '';
  if (isExternalHttpUrl(trimmed) && !trimmed.includes(`/${DISH_PHOTOS_BUCKET}/`)) {
    return trimmed;
  }

  return null;
}

/** Aplica `resolvePhotoDisplayUrl` ao `photo_url` de cada prato (sem chamadas de rede). */
export function withPublicDishPhotoUrls<T extends { photo_url: string | null }>(
  dishes: readonly T[],
  supabaseUrl: string,
): T[] {
  return dishes.map((dish) => ({
    ...dish,
    photo_url: resolvePhotoDisplayUrl(dish.photo_url, supabaseUrl),
  }));
}
