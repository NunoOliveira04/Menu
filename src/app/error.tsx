'use client';

import Link from 'next/link';
import {
  BRAND_BUTTON_OUTLINE,
  BRAND_BUTTON_PRIMARY,
  BrandMessage,
} from '@/components/marketing/brand-message';

/** Ecrã de erro do site (em vez do ecrã padrão do Next.js, em inglês). */
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <BrandMessage
      eyebrow="Algo correu mal"
      title="Não foi possível abrir esta página"
      actions={
        <>
          <button type="button" onClick={() => reset()} className={BRAND_BUTTON_PRIMARY}>
            Tentar outra vez
          </button>
          <Link href="/" className={BRAND_BUTTON_OUTLINE}>
            Página inicial
          </Link>
        </>
      }
    >
      <p>Pode ser uma falha momentânea de ligação. Tente outra vez daqui a uns segundos.</p>
    </BrandMessage>
  );
}
