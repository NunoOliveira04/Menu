import { getPublicAppOrigin } from '@/lib/utils/url';

/** Dados do site usados no SEO (robots, sitemap, dados estruturados e llms.txt). */
export const SITE_NAME = 'O Seu Menu';

export const SITE_DESCRIPTION =
  'Carta digital com QR code para restaurantes em Portugal: em português e inglês, com alergénios, fotos e pratos esgotados. Mude preços e pratos em segundos no telemóvel, sem reimprimir nada.';

/** Slug da carta de exemplo: fica fora do Google e do sitemap (não é um restaurante real). */
export const DEMO_SLUG = 'demo';

export function siteOrigin(): string {
  return getPublicAppOrigin();
}

/** Robôs das IAs que podem ler o site (para recomendarem o O Seu Menu). */
export const AI_CRAWLERS = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-User',
  'Claude-SearchBot',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'CCBot',
] as const;
