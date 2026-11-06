const RESERVED_SLUGS = new Set([
  'admin',
  'api',
  'app',
  'auth',
  'dashboard',
  'login',
  'logout',
  'onboarding',
  'r',
  'registar',
  'settings',
  'static',
  'www',
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.trim().toLowerCase());
}

export function isValidSlug(slug: string): boolean {
  if (slug.length < 2 || slug.length > 63) {
    return false;
  }
  if (isReservedSlug(slug)) {
    return false;
  }
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
