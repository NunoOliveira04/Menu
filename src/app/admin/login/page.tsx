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
          <span className="font-serif text-2xl font-semibold text-[#1C1613]">Ementa Digital</span>
        </div>

        <div className="mt-8 rounded-2xl border border-[#E6DDD0] bg-white p-6 shadow-sm sm:p-8">
          <h1 className="font-serif text-2xl font-semibold text-stone-900">Bem-vindo de volta</h1>
          <p className="mt-1 text-sm text-stone-600">
            Entra na tua conta para gerir a carta do restaurante.
          </p>

          <div className="mt-6">
            <LoginForm next={next} />
          </div>
        </div>
      </div>
    </div>
  );
}
