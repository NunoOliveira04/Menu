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
