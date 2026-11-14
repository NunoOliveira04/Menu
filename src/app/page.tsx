import type { Metadata } from 'next';
import { LANDING_TAGLINE, LandingPage } from '@/components/marketing/landing-page';
import { getPublicAppOrigin } from '@/lib/utils/url';

// Página estática: gerada no build, sem consultas ao Supabase.
export const dynamic = 'force-static';

const TITLE = 'O Seu Menu — Carta digital para restaurantes';

export const metadata: Metadata = {
  metadataBase: new URL(getPublicAppOrigin()),
  // `absolute` ignora o template do layout raiz ("%s · O Seu Menu").
  title: { absolute: TITLE },
  description: LANDING_TAGLINE,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'O Seu Menu',
    title: TITLE,
    description: LANDING_TAGLINE,
    locale: 'pt_PT',
  },
  robots: { index: true, follow: true },
};

export default function HomePage() {
  return <LandingPage />;
}
