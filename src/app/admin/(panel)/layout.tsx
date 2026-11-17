import Link from 'next/link';
import { BookOpen, ExternalLink, LogOut } from 'lucide-react';
import { logoutAction } from '@/app/actions/auth';
import { AdminTabs } from '@/components/dashboard/admin-tabs';
import { BRAND_FONT_CLASSES, BRAND_FONT_STYLE } from '@/lib/fonts/brand';
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
        <div className="w-full max-w-md rounded-2xl border border-stone-200 bg-white p-6 text-center shadow-[0_10px_30px_-18px_rgba(43,29,22,0.35)] sm:p-8">
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
    <div
      className={`${BRAND_FONT_CLASSES} min-h-screen bg-stone-50 font-sans text-stone-900`}
      style={BRAND_FONT_STYLE}
    >
      <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-5xl space-y-3 px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            <Link href="/admin" className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#B4412A] text-[#FBF6EC] shadow-[0_6px_16px_-8px_rgba(180,65,42,0.8)]">
                <BookOpen className="h-4 w-4" aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-base font-semibold leading-tight text-stone-900">
                  {restaurant.name}
                </span>
                <span className="block truncate text-xs text-stone-500">{user.email}</span>
              </span>
            </Link>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/${restaurant.slug}`}
                target="_blank"
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-[#B4412A]/25 bg-[#FBF6EC] px-3 text-[13px] font-semibold sm:px-4 sm:text-sm text-[#B4412A] transition hover:bg-[#F2E6D0]"
              >
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                Ver a carta
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  title="Terminar sessão"
                  aria-label="Terminar sessão"
                  className="inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-stone-200 px-3 text-[13px] font-medium sm:px-4 sm:text-sm text-stone-600 transition hover:bg-stone-100 hover:text-stone-900"
                >
                  <LogOut className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Sair</span>
                </button>
              </form>
            </div>
          </div>

          <AdminTabs />
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
