export const ADMIN_HOME_PATH = '/admin';
export const ADMIN_LOGIN_PATH = '/admin/login';
export const ADMIN_RESTAURANT_PATH = '/admin/restaurante';

/** Rotas /admin retiradas (registo/onboarding). Devem 404 sem redirect para login. */
const RETIRED_ADMIN_PATHS = new Set<string>(['/admin/registar', '/admin/onboarding']);

const PUBLIC_ADMIN_PATHS = new Set<string>([ADMIN_LOGIN_PATH]);

/**
 * Rotas antigas do Grupo 1/2 que passam a viver em /admin.
 * Devolve o caminho de destino (sem query) ou null.
 * /registar e /onboarding deixam de redirecionar (404) para não revelar o admin.
 */
export function resolveLegacyAdminRedirect(pathname: string): string | null {
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const suffix = pathname.slice('/dashboard'.length);
    return `${ADMIN_HOME_PATH}${suffix}`;
  }

  if (pathname === '/login') {
    return ADMIN_LOGIN_PATH;
  }

  return null;
}

/** Tudo em /admin exige sessão, excepto login. Rotas retiradas não são protegidas (ficam 404). */
export function isProtectedAdminPath(pathname: string): boolean {
  const inAdmin = pathname === ADMIN_HOME_PATH || pathname.startsWith(`${ADMIN_HOME_PATH}/`);
  if (!inAdmin) {
    return false;
  }
  if (RETIRED_ADMIN_PATHS.has(pathname)) {
    return false;
  }
  return !PUBLIC_ADMIN_PATHS.has(pathname);
}

export function isPublicAdminAuthPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.has(pathname);
}
