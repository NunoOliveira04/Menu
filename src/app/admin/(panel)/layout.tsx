import Link from 'next/link';
import { BookOpen, ExternalLink, LogOut, Settings, UtensilsCrossed } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import { getPrimaryUserRestaurant, requireAuthenticatedUser } from '@/lib/auth/session';

export default async function AdminPanelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await requireAuthenticatedUser();
  const context = await getPrimaryUserRestaurant(user.userId);

  if (!context) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-stone-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-sm sm:p-8">
          <p className="text-sm leading-relaxed text-stone-700">
            Conta sem restaurante associado. Contacte o suporte.
          </p>
          <form action={logoutAction} className="mt-6">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
            >
              <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
              Terminar sessão
            </button>
          </form>
        </div>
      </div>
    );
  }

  const { restaurant } = context;

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#8C3B2B] text-white">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
              </span>
              <div>
                <span className="block font-serif text-lg font-semibold leading-none text-stone-900">
                  {restaurant.name}
                </span>
                <span className="mt-0.5 block text-[11px] text-stone-500">
                  Painel do Restaurante
                </span>
              </div>
            </Link>

            <nav aria-label="Secções do painel" className="flex items-center gap-1">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-100 hover:text-stone-950"
              >
                <UtensilsCrossed className="h-3.5 w-3.5" aria-hidden="true" />
                Ementa
              </Link>
              <Link
                href="/admin/restaurante"
                className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-stone-700 transition hover:bg-stone-100 hover:text-stone-950"
              >
                <Settings className="h-3.5 w-3.5" aria-hidden="true" />
                Restaurante
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/r/${restaurant.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 bg-[#FAF6F0] px-3 py-1.5 text-xs font-semibold text-[#8C3B2B] transition hover:bg-[#F3ECE1]"
            >
              <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              Ver menu
            </Link>

            <span className="hidden text-xs text-stone-500 md:inline">{user.email}</span>

            <form action={logoutAction}>
              <button
                type="submit"
                title="Terminar sessão"
                className="inline-flex items-center gap-1.5 rounded-xl border border-stone-200 px-3 py-1.5 text-xs font-medium text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
