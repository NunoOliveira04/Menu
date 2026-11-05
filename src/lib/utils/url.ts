export function getPublicAppOrigin(fallbackOrigin?: string): string {
  const configured = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const base =
    configured && configured.length > 0 ? configured : (fallbackOrigin ?? 'http://localhost:3000');
  return base.replace(/\/+$/, '');
}

export function buildPublicMenuUrl(slug: string, fallbackOrigin?: string): string {
  const origin = getPublicAppOrigin(fallbackOrigin);
  return `${origin}/r/${encodeURIComponent(slug)}`;
}
