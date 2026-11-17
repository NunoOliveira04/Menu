'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, UtensilsCrossed } from 'lucide-react';

const TABS = [
  { href: '/admin', label: 'Carta', icon: UtensilsCrossed },
  { href: '/admin/restaurante', label: 'Definições', icon: Settings },
] as const;

/** Separadores do painel, com o separador atual assinalado. */
export function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secções do painel"
      className="grid grid-cols-2 gap-1 rounded-full bg-stone-100 p-1"
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-full px-3 text-[15px] font-semibold transition ${
              active
                ? 'bg-stone-900 text-stone-50 shadow-[0_6px_16px_-8px_rgba(43,29,22,0.7)]'
                : 'text-stone-600 hover:bg-white/70 hover:text-stone-900'
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
