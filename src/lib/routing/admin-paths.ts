export const ADMIN_HOME_PATH = '/admin';
export const ADMIN_LOGIN_PATH = '/admin/login';
export const ADMIN_REGISTER_PATH = '/admin/registar';
export const ADMIN_ONBOARDING_PATH = '/admin/onboarding';
export const ADMIN_RESTAURANT_PATH = '/admin/restaurante';

const PUBLIC_ADMIN_PATHS = new Set<string>([ADMIN_LOGIN_PATH, ADMIN_REGISTER_PATH]);

/**
 * Rotas antigas do Grupo 1/2 que passam a viver em /admin.
 * Devolve o caminho de destino (sem query) ou null.
 */
export function resolveLegacyAdminRedirect(pathname: string): string | null {
  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const suffix = pathname.slice('/dashboard'.length);
    return `${ADMIN_HOME_PATH}${suffix}`;
  }

  if (pathname === '/login') {
    return ADMIN_LOGIN_PATH;
  }

  if (pathname === '/registar') {
    return ADMIN_REGISTER_PATH;
  }

  if (pathname === '/onboarding' || pathname.startsWith('/onboarding/')) {
    return `/admin${pathname}`;
  }

  return null;
}

/** Tudo em /admin exige sessão, excepto login e registo. */
export function isProtectedAdminPath(pathname: string): boolean {
  const inAdmin = pathname === ADMIN_HOME_PATH || pathname.startsWith(`${ADMIN_HOME_PATH}/`);
  if (!inAdmin) {
    return false;
  }
  return !PUBLIC_ADMIN_PATHS.has(pathname);
}

export function isPublicAdminAuthPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.has(pathname);
}
