'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import {
  MENU_BACKGROUND_IDS,
  MENU_BACKGROUNDS,
  type MenuBackgroundId,
} from '@/lib/themes/backgrounds';
import { MENU_THEMES, SELECTABLE_STYLES } from '@/lib/themes/registry';
import type { RestaurantStyle } from '@/types/database';

/**
 * Escolha de «Estilo», «2 colunas» e «Fundo» da carta.
 * Envia `style`, `columns` e `background` no formulário.
 */
export function AppearancePicker({
  initialStyle,
  initialBackground,
  initialColumns,
}: {
  initialStyle: RestaurantStyle;
  initialBackground: MenuBackgroundId;
  initialColumns: boolean;
}) {
  const [style, setStyle] = useState<RestaurantStyle>(
    SELECTABLE_STYLES.includes(initialStyle) ? initialStyle : 'classico',
  );
  const [background, setBackground] = useState<MenuBackgroundId>(initialBackground);
  const theme = MENU_THEMES[style];

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-sm font-medium text-stone-800">Estilo</legend>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {SELECTABLE_STYLES.map((id) => {
            const option = MENU_THEMES[id];
            const selected = style === id;
            return (
              <label
                key={id}
                className={`relative cursor-pointer rounded-xl border p-2 transition ${
                  selected
                    ? 'border-[#8C3B2B] ring-2 ring-[#8C3B2B]/30'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="style"
                  value={id}
                  checked={selected}
                  onChange={() => setStyle(id)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className="block h-16 overflow-hidden rounded-lg"
                  style={{ background: option.swatch.background }}
                >
                  <span className="mx-auto mt-2 block h-5 w-5 rounded-full bg-white shadow-sm" />
                  <span className="mx-2 mt-2 flex items-center justify-between rounded bg-white/90 px-1.5 py-1">
                    <span className="h-1.5 w-8 rounded-full bg-stone-300" />
                    <span
                      className="h-2.5 w-5 rounded-full"
                      style={{ background: option.swatch.accent }}
                    />
                  </span>
                </span>
                <span className="mt-1.5 block text-center text-xs font-semibold text-stone-800">
                  {option.label}
                </span>
                {selected && (
                  <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#8C3B2B] text-white">
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </span>
                )}
              </label>
            );
          })}
        </div>
        <p className="mt-1.5 text-xs text-stone-500">{theme.description}</p>
      </fieldset>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-stone-200 p-3.5">
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-stone-900">Pratos em 2 colunas</span>
          <span className="mt-0.5 block text-xs text-stone-500">
            Mostra dois pratos por linha, em grelha. Funciona com qualquer estilo.
          </span>
        </span>
        <input
          type="checkbox"
          role="switch"
          name="columns"
          defaultChecked={initialColumns}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="relative mt-1 h-6 w-11 shrink-0 rounded-full bg-stone-300 transition peer-checked:bg-[#8C3B2B] peer-focus-visible:ring-2 peer-focus-visible:ring-[#8C3B2B]/40 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-5"
        />
      </label>

      <fieldset>
        <legend className="text-sm font-medium text-stone-800">Fundo</legend>
        <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {MENU_BACKGROUND_IDS.map((id) => {
            const option = MENU_BACKGROUNDS[id];
            const selected = background === id;
            return (
              <label
                key={id}
                className={`relative cursor-pointer rounded-xl border p-1.5 transition ${
                  selected
                    ? 'border-[#8C3B2B] ring-2 ring-[#8C3B2B]/30'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="background"
                  value={id}
                  checked={selected}
                  onChange={() => setBackground(id)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className="block h-12 rounded-lg border border-black/5"
                  style={{
                    background: option.css === null ? theme.swatch.background : option.preview,
                  }}
                />
                <span className="mt-1 block text-center text-[11px] font-semibold text-stone-800">
                  {option.label}
                </span>
                {selected && (
                  <span className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#8C3B2B] text-white">
                    <Check className="h-3 w-3" aria-hidden="true" />
                  </span>
                )}
              </label>
            );
          })}
        </div>
        <p className="mt-1.5 text-xs text-stone-500">
          «Liso» usa a cor de fundo da paleta. As texturas ficam por trás dos pratos.
        </p>
      </fieldset>
    </div>
  );
}
