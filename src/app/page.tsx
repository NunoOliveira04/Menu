import { LandingPage } from '@/components/marketing/landing-page';

// Página estática: gerada no build, sem consultas ao Supabase.
export const dynamic = 'force-static';

export default function HomePage() {
  return <LandingPage />;
}
