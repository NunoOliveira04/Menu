'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import {
  MENU_BACKGROUND_IDS,
  MENU_BACKGROUNDS,
  MENU_LAYOUT_IDS,
  MENU_LAYOUTS,
  type MenuBackgroundId,
  type MenuLayoutId,
} from '@/lib/themes/backgrounds';
import { MENU_THEMES, SELECTABLE_STYLES } from '@/lib/themes/registry';
import type { RestaurantStyle } from '@/types/database';

/** Desenho simples de cada disposição (para o painel). */
function LayoutIcon({ layout }: { layout: MenuLayoutId }) {
  const block = 'rounded-[3px] bg-stone-300';
  const line = 'h-1 rounded-full bg-stone-300';
  return (
    <span
      aria-hidden="true"
      className="flex h-16 flex-col justify-center gap-1.5 rounded-lg bg-stone-100 px-2.5"
    >
      {layout === 'lista' &&
        [0, 1].map((i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span className="flex flex-1 flex-col gap-1">
              <span className={`${line} w-full`} />
              <span className={`${line} w-2/3`} />
            </span>
            <span className={`${block} h-5 w-5`} />
          </span>
        ))}
      {layout === 'grelha' && (
        <span className="grid grid-cols-2 gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className={`${block} h-5`} />
          ))}
        </span>
      )}
      {layout === 'foto' && (
        <>
          <span className={`${block} h-7 w-full`} />
          <span className={`${line} w-2/3`} />
          <span className={`${line} w-1/2`} />
        </>
      )}
    </span>
  );
}

/**
 * Escolha de «Cor», «Disposição dos pratos» e «Fundo» da carta.
 * Envia `style`, `layout` e `background` no formulário.
 */
export function AppearancePicker({
  initialStyle,
  initialBackground,
  initialLayout,
}: {
  initialStyle: RestaurantStyle;
  initialBackground: MenuBackgroundId;
  initialLayout: MenuLayoutId;
}) {
  const [style, setStyle] = useState<RestaurantStyle>(
    SELECTABLE_STYLES.includes(initialStyle) ? initialStyle : 'classico',
  );
  const [background, setBackground] = useState<MenuBackgroundId>(initialBackground);
  const [layout, setLayout] = useState<MenuLayoutId>(initialLayout);
  const theme = MENU_THEMES[style];

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-sm font-medium text-stone-800">Cor</legend>
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

      <fieldset>
        <legend className="text-sm font-medium text-stone-800">Disposição dos pratos</legend>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {MENU_LAYOUT_IDS.map((id) => {
            const option = MENU_LAYOUTS[id];
            const selected = layout === id;
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
                  name="layout"
                  value={id}
                  checked={selected}
                  onChange={() => setLayout(id)}
                  className="sr-only"
                />
                <LayoutIcon layout={id} />
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
        <p className="mt-1.5 text-xs text-stone-500">{MENU_LAYOUTS[layout].description}</p>
      </fieldset>

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
          «Liso» usa a cor de fundo escolhida. As texturas ficam por trás dos pratos.
        </p>
      </fieldset>
    </div>
  );
}
