import type { Metadata } from 'next';
import { LANDING_FAQS, LandingPage } from '@/components/marketing/landing-page';
import { BRAND_FONT_CLASSES } from '@/lib/fonts/brand';
import { jsonLdScript, landingJsonLd } from '@/lib/seo/json-ld';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo/site';
import { getPublicAppOrigin } from '@/lib/utils/url';

// Página estática: gerada no build, sem consultas ao Supabase.
export const dynamic = 'force-static';

const TITLE = 'O Seu Menu — Carta digital com QR code para restaurantes';

export const metadata: Metadata = {
  metadataBase: new URL(getPublicAppOrigin()),
  // `absolute` ignora o template do layout raiz ("%s · O Seu Menu").
  title: { absolute: TITLE },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  category: 'Restauração',
  alternates: { canonical: '/' },
  // A imagem de partilha vem de src/app/opengraph-image.jpg.
  openGraph: {
    type: 'website',
    url: '/',
    siteName: SITE_NAME,
    title: TITLE,
    description: SITE_DESCRIPTION,
    locale: 'pt_PT',
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: SITE_DESCRIPTION },
  robots: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
};

export default function HomePage() {
  return (
    <>
      {/* Dados estruturados para o Google e as IAs (organização, serviço e perguntas). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(landingJsonLd(getPublicAppOrigin(), LANDING_FAQS)),
        }}
      />
      <LandingPage fontClassName={BRAND_FONT_CLASSES} />
    </>
  );
}
