import type { Metadata } from 'next';
import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { RegisterForm } from '@/components/auth/auth-forms';

export const metadata: Metadata = {
  title: 'Criar conta',
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col justify-center bg-[#FAF6F0] px-4 py-12 sm:px-6">
      <div className="mx-auto w-full max-w-md">
        <Link href="/" className="mx-auto flex w-fit items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8C3B2B] text-white">
            <BookOpen className="h-4 w-4" aria-hidden="true" />
          </span>
          <span className="font-serif text-2xl font-semibold text-[#1C1613]">Ementa Digital</span>
        </Link>

        <div className="mt-8 rounded-2xl border border-[#E6DDD0] bg-white p-6 shadow-sm sm:p-8">
          <h1 className="font-serif text-2xl font-semibold text-stone-900">
            Cria a tua conta de proprietário
          </h1>
          <p className="mt-1 text-sm text-stone-600">
            Configura o teu primeiro restaurante e começa a organizar a ementa.
          </p>

          <div className="mt-6">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}
