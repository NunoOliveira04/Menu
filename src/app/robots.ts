import type { MetadataRoute } from 'next';
import { AI_CRAWLERS, siteOrigin } from '@/lib/seo/site';

/** robots.txt: motores de busca e IAs podem ler o site; o painel fica fechado. */
export default function robots(): MetadataRoute.Robots {
  const disallow = ['/admin', '/api/'];
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow },
      // Explícito para as IAs: queremos que leiam e recomendem o O Seu Menu.
      { userAgent: [...AI_CRAWLERS], allow: '/', disallow },
    ],
    sitemap: `${siteOrigin()}/sitemap.xml`,
    host: siteOrigin(),
  };
}
