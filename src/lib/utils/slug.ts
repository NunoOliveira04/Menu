/**
 * Nomes que não podem ser slug de restaurante: a carta vive em /<slug>, por isso um slug
 * igual a uma rota ou ficheiro da app ficaria inacessível (ou taparia a rota).
 */
const RESERVED_SLUGS = new Set([
  // Rotas da app e atalhos antigos
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
  // Next.js e ficheiros servidos na raiz
  '_next',
  '.well-known',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'manifest.json',
  'manifest.webmanifest',
  'icon',
  'apple-icon',
  'opengraph-image',
  'twitter-image',
  'not-found',
  'assets',
  'images',
  'public',
  // Páginas institucionais que o site possa vir a ter
  'ajuda',
  'contactos',
  'precos',
  'privacidade',
  'sobre',
  'termos',
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
