export const ADMIN_HOME_PATH = '/admin';
export const ADMIN_LOGIN_PATH = '/admin/login';
export const ADMIN_RESTAURANT_PATH = '/admin/restaurante';

/** Rotas /admin retiradas (registo/onboarding). Devem 404 sem redirect para login. */
const RETIRED_ADMIN_PATHS = ['/admin/registar', '/admin/onboarding'] as const;

const PUBLIC_ADMIN_PATHS = new Set<string>([ADMIN_LOGIN_PATH]);

const BLOCKED_POST_LOGIN_PATHS = ['/admin/login', '/admin/registar', '/admin/onboarding'] as const;

/**
 * Corrige endereços do admin escritos com maiúsculas ou com espaço/ponto no fim
 * (ex.: `/Admin`, `/ADMIN/Restaurante`, `/admin%20` — comum no teclado do telemóvel).
 * Devolve o caminho correto em minúsculas, ou null se já estiver certo ou não for do admin.
 */
export function normalizeMistypedAdminPath(pathname: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }

  const cleaned = decoded
    .toLowerCase()
    .replace(/[\s.]+$/, '')
    .replace(/\/+$/, '');

  if (cleaned !== ADMIN_HOME_PATH && !cleaned.startsWith(`${ADMIN_HOME_PATH}/`)) {
    return null;
  }
  // Só caracteres seguros num caminho do admin (evita redirecionar lixo).
  if (!/^\/admin(\/[a-z0-9-]+)*$/.test(cleaned)) {
    return null;
  }
  return cleaned === pathname ? null : cleaned;
}

/**
 * Rotas antigas do Grupo 1/2 que passam a viver em /admin.
 * Devolve o caminho de destino (sem query) ou null.
 * /registar e /onboarding deixam de redirecionar (404) para não revelar o admin.
 */
export function resolveLegacyAdminRedirect(pathname: string): string | null {
  // Atalho a partir do link da carta: /r/<slug>/admin[/...] -> /admin[/...]
  const fromMenu = pathname.match(/^\/r\/[^/]+(\/admin(?:\/.*)?)$/i);
  if (fromMenu?.[1]) {
    const target = fromMenu[1];
    return normalizeMistypedAdminPath(target) ?? target;
  }

  const normalizedAdmin = normalizeMistypedAdminPath(pathname);
  if (normalizedAdmin) {
    return normalizedAdmin;
  }

  if (pathname === '/dashboard' || pathname.startsWith('/dashboard/')) {
    const suffix = pathname.slice('/dashboard'.length);
    return `${ADMIN_HOME_PATH}${suffix}`;
  }

  if (pathname === '/login') {
    return ADMIN_LOGIN_PATH;
  }

  return null;
}

export function isRetiredAdminPath(pathname: string): boolean {
  return RETIRED_ADMIN_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

/** Tudo em /admin exige sessão, excepto login. Rotas retiradas não são protegidas (ficam 404). */
export function isProtectedAdminPath(pathname: string): boolean {
  const inAdmin = pathname === ADMIN_HOME_PATH || pathname.startsWith(`${ADMIN_HOME_PATH}/`);
  if (!inAdmin) {
    return false;
  }
  if (isRetiredAdminPath(pathname)) {
    return false;
  }
  return !PUBLIC_ADMIN_PATHS.has(pathname);
}

export function isPublicAdminAuthPath(pathname: string): boolean {
  return PUBLIC_ADMIN_PATHS.has(pathname);
}

/**
 * Valida o destino pós-login (`?next=`). Fallback: /admin.
 *
 * Aceita só `next === '/admin'` ou `next.startsWith('/admin/')`. Rejeita:
 * - prefixos parecidos (`/adminfoo`, `/admin?x`, `/admin#x`);
 * - `//` e `\` em qualquer posição (URLs relativos ao protocolo / open-redirect);
 * - qualquer esquema (`https:`, `javascript:`, …), espaços e caracteres de controlo
 *   (os browsers removem tabs/newlines, o que podia transformar `/\t/x` em `//x`);
 * - segmentos `.` / `..` (sair de /admin);
 * - login/registar/onboarding (e subpaths).
 */
export function resolveSafeAdminNextPath(raw: unknown): string {
  if (typeof raw !== 'string') {
    return ADMIN_HOME_PATH;
  }

  const next = raw.trim();
  if (next !== ADMIN_HOME_PATH && !next.startsWith(`${ADMIN_HOME_PATH}/`)) {
    return ADMIN_HOME_PATH;
  }
  if (/[\s\u0000-\u001f\u007f\\]/.test(next) || next.includes('//') || next.includes(':')) {
    return ADMIN_HOME_PATH;
  }
  // O parser de URLs trata `%2e` como `.`, por isso `/admin/%2e%2e/x` também sai de /admin.
  const pathOnly = next.split(/[?#]/)[0] ?? '';
  const hasDotSegment = pathOnly
    .split('/')
    .map((segment) => segment.toLowerCase().replace(/%2e/g, '.'))
    .some((segment) => segment === '.' || segment === '..');
  if (hasDotSegment) {
    return ADMIN_HOME_PATH;
  }

  for (const blocked of BLOCKED_POST_LOGIN_PATHS) {
    if (next === blocked || next.startsWith(`${blocked}/`)) {
      return ADMIN_HOME_PATH;
    }
  }

  return next;
}
