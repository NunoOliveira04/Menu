import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import { LoginForm } from '@/components/auth/auth-forms';
import { BRAND_FONT_CLASSES, BRAND_FONT_STYLE } from '@/lib/fonts/brand';

export const metadata: Metadata = {
  title: 'Iniciar sessão',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const rawNext = params.next;
  const next = typeof rawNext === 'string' ? rawNext : '';

  return (
    <div
      className={`${BRAND_FONT_CLASSES} flex min-h-screen flex-col justify-center bg-[radial-gradient(60%_40%_at_50%_0%,rgba(242,180,65,0.18),transparent_70%)] bg-stone-50 px-4 py-12 font-sans sm:px-6`}
      style={BRAND_FONT_STYLE}
    >
      <div className="mx-auto w-full max-w-md">
        <div className="mx-auto flex w-fit items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#B4412A] text-[#FBF6EC] shadow-[0_6px_16px_-8px_rgba(180,65,42,0.8)]">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-serif text-[26px] text-[#2B1D16]">
            O Seu <span className="text-[#B4412A]">Menu</span>
          </span>
        </div>

        <div className="mt-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-[0_24px_60px_-30px_rgba(43,29,22,0.35)] sm:p-8">
          <h1 className="font-serif text-[28px] leading-tight text-stone-900">
            Área do restaurante
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Entre na sua conta para gerir a carta do seu restaurante.
          </p>

          <div className="mt-6">
            <LoginForm next={next} />
          </div>

          <p className="mt-5 border-t border-stone-100 pt-4 text-sm text-stone-600">
            <strong className="font-semibold text-stone-800">Esqueceu-se da palavra-passe?</strong>{' '}
            Fale connosco e nós ajudamos a recuperar o acesso.
          </p>
        </div>
      </div>
    </div>
  );
}
