import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import { OnboardingRestaurantForm } from '@/components/auth/onboarding-form';
import { getPrimaryUserRestaurant, requireAuthenticatedUser } from '@/lib/auth/session';

export const metadata: Metadata = {
  title: 'Configurar 1.º Restaurante',
};

export default async function OnboardingPage() {
  const user = await requireAuthenticatedUser();
  const existing = await getPrimaryUserRestaurant(user.userId);

  if (existing) {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#8C3B2B] text-white">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-serif text-xl font-semibold text-[#1C1613]">Ementa Digital</span>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-xs font-medium text-stone-600 hover:text-stone-900"
            >
              Terminar sessão
            </button>
          </form>
        </div>

        <div className="mt-8 rounded-2xl border border-[#E6DDD0] bg-white p-6 shadow-sm sm:p-8">
          <span className="inline-block rounded-full bg-[#F3ECE1] px-3 py-1 text-xs font-medium text-[#8C3B2B]">
            Passo 1 de 1
          </span>
          <h1 className="mt-3 font-serif text-2xl font-semibold text-stone-900 sm:text-3xl">
            Cria o teu primeiro restaurante
          </h1>
          <p className="mt-1.5 text-sm text-stone-600">
            Escolhe o nome e o endereço público onde os clientes vão consultar o menu. Podes alterar
            tudo mais tarde.
          </p>

          <div className="mt-6">
            <OnboardingRestaurantForm />
          </div>
        </div>
      </div>
    </div>
  );
}
