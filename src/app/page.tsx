import type { Metadata } from 'next';
import { Atkinson_Hyperlegible_Next, Young_Serif } from 'next/font/google';
import { LANDING_TAGLINE, LandingPage } from '@/components/marketing/landing-page';
import { getPublicAppOrigin } from '@/lib/utils/url';

// Página estática: gerada no build, sem consultas ao Supabase.
export const dynamic = 'force-static';

// Letras só desta página (as cartas e o painel não as carregam).
const displayFont = Young_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-landing-display',
  display: 'swap',
});

const bodyFont = Atkinson_Hyperlegible_Next({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-landing-body',
  display: 'swap',
  // O Next ainda não tem as medidas desta letra para a letra de recurso; evita o aviso no build.
  adjustFontFallback: false,
});

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
  return <LandingPage fontClassName={`${displayFont.variable} ${bodyFont.variable}`} />;
}
