'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings, UtensilsCrossed } from 'lucide-react';

const TABS = [
  { href: '/admin', label: 'Ementa', icon: UtensilsCrossed },
  { href: '/admin/restaurante', label: 'Definições', icon: Settings },
] as const;

/** Separadores do painel, com o separador atual assinalado. */
export function AdminTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Secções do painel"
      className="grid grid-cols-2 gap-1 rounded-xl bg-stone-100 p-1"
    >
      {TABS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition ${
              active
                ? 'bg-white text-stone-900 shadow-sm'
                : 'text-stone-600 hover:bg-white/60 hover:text-stone-900'
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
