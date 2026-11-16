import type { Metadata } from 'next';
import { BookOpen } from 'lucide-react';
import { LoginForm } from '@/components/auth/auth-forms';

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
    <div className="flex min-h-screen flex-col justify-center bg-[#FAF6F0] px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <div className="mx-auto flex w-fit items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8C3B2B] text-white">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-serif text-2xl font-semibold text-[#1C1613]">O Seu Menu</span>
        </div>

        <div className="mt-8 rounded-2xl border border-[#E6DDD0] bg-white p-6 shadow-sm sm:p-8">
          <h1 className="font-serif text-2xl font-semibold text-stone-900">Área do restaurante</h1>
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
