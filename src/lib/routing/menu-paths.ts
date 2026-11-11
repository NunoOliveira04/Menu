import { isValidSlug } from '@/lib/utils/slug';

/**
 * Slug da carta pública a partir do caminho `/<slug>` (um único segmento).
 * Devolve null para a raiz, rotas da app (/admin, /api, …), ficheiros e slugs reservados.
 */
export function extractMenuSlugFromPathname(pathname: string): string | null {
  const match = pathname.match(/^\/([^/]+)\/?$/);
  if (!match?.[1]) {
    return null;
  }
  let slug: string;
  try {
    slug = decodeURIComponent(match[1]).trim().toLowerCase();
  } catch {
    return null;
  }
  return isValidSlug(slug) ? slug : null;
}

/**
 * Endereços antigos da carta: /r/<slug> -> /<slug> (a query, ex. ?lang=en, é mantida por quem redireciona).
 * Só o segmento do slug; /r/<slug>/admin é tratado em resolveLegacyAdminRedirect.
 */
export function resolveLegacyMenuRedirect(pathname: string): string | null {
  const match = pathname.match(/^\/r\/([^/]+)\/?$/);
  if (!match?.[1]) {
    return null;
  }
  return `/${match[1]}`;
}
