import type { MetadataRoute } from 'next';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — Carta digital para restaurantes`,
    short_name: SITE_NAME,
    description: SITE_DESCRIPTION,
    lang: 'pt-PT',
    start_url: '/',
    display: 'browser',
    background_color: '#FBF6EC',
    theme_color: '#B4412A',
    icons: [
      { src: '/icon.svg', type: 'image/svg+xml', sizes: 'any' },
      { src: '/apple-icon.png', type: 'image/png', sizes: '180x180' },
    ],
  };
}
