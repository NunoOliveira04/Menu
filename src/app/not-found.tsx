import type { Metadata } from 'next';
import Link from 'next/link';
import { BRAND_BUTTON_PRIMARY, BrandMessage } from '@/components/marketing/brand-message';

export const metadata: Metadata = {
  title: 'Página não encontrada',
  robots: { index: false, follow: false },
};

/** Página 404 geral do site (em vez da página padrão do Next.js, em inglês). */
export default function NotFound() {
  return (
    <BrandMessage
      eyebrow="Erro 404"
      title="Esta página não existe"
      actions={
        <Link href="/" className={BRAND_BUTTON_PRIMARY}>
          Ir para a página inicial
        </Link>
      }
    >
      <p>O endereço pode estar mal escrito ou a página pode ter mudado de sítio.</p>
    </BrandMessage>
  );
}
