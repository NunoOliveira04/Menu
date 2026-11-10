'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import {
  MENU_ACCENT_IDS,
  MENU_ACCENTS,
  MENU_BACKGROUND_IDS,
  MENU_BACKGROUNDS,
  MENU_LAYOUT_IDS,
  MENU_LAYOUTS,
  type MenuAccentId,
  type MenuAppearance,
  type MenuBackgroundId,
  type MenuLayoutId,
} from '@/lib/themes/backgrounds';

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

const OPTION_BASE = 'relative cursor-pointer rounded-xl border p-2 transition';
const OPTION_ON = 'border-[#8C3B2B] ring-2 ring-[#8C3B2B]/30';
const OPTION_OFF = 'border-stone-200 hover:border-stone-300';

function SelectedMark() {
  return (
    <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#8C3B2B] text-white">
      <Check className="h-3 w-3" aria-hidden="true" />
    </span>
  );
}

/**
 * Aspeto da carta: «Fundo» (página e cartões), «Cor» (só os destaques do texto) e
 * «Disposição dos pratos». Envia `background`, `accent` e `layout` no formulário.
 */
export function AppearancePicker({ initial }: { initial: MenuAppearance }) {
  const [background, setBackground] = useState<MenuBackgroundId>(initial.background);
  const [accent, setAccent] = useState<MenuAccentId>(initial.accent);
  const [layout, setLayout] = useState<MenuLayoutId>(initial.layout);

  const bg = MENU_BACKGROUNDS[background];
  const accentShade = bg.pageDark ? MENU_ACCENTS[accent].onDark : MENU_ACCENTS[accent].onLight;

  return (
    <div className="space-y-6">
      <fieldset>
        <legend className="text-sm font-medium text-stone-800">Fundo</legend>
        <div className="mt-2 grid grid-cols-4 gap-2.5 sm:grid-cols-7">
          {MENU_BACKGROUND_IDS.map((id) => {
            const option = MENU_BACKGROUNDS[id];
            const selected = background === id;
            return (
              <label
                key={id}
                className={`${OPTION_BASE} p-1.5 ${selected ? OPTION_ON : OPTION_OFF}`}
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
                  className="block h-11 rounded-lg border border-black/5"
                  style={{ background: option.preview }}
                />
                <span className="mt-1 block text-center text-[11px] font-semibold leading-tight text-stone-800">
                  {option.label}
                </span>
                {selected && <SelectedMark />}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-stone-800">Cor</legend>
        <p className="mt-0.5 text-xs text-stone-500">
          Cor dos destaques: preços, títulos das categorias e categoria escolhida.
        </p>
        <div className="mt-2 flex flex-wrap gap-2.5">
          {MENU_ACCENT_IDS.map((id) => {
            const option = MENU_ACCENTS[id];
            const selected = accent === id;
            return (
              <label
                key={id}
                className={`relative inline-flex cursor-pointer items-center gap-2 rounded-full border py-1.5 pl-1.5 pr-3 transition ${
                  selected ? OPTION_ON : OPTION_OFF
                }`}
              >
                <input
                  type="radio"
                  name="accent"
                  value={id}
                  checked={selected}
                  onChange={() => setAccent(id)}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className="flex h-6 w-6 items-center justify-center rounded-full"
                  style={{ background: option.swatch }}
                >
                  {selected && <Check className="h-3.5 w-3.5 text-white" />}
                </span>
                <span className="text-xs font-semibold text-stone-800">{option.label}</span>
              </label>
            );
          })}
        </div>

        {/* Pré-visualização rápida: como fica a cor sobre o fundo escolhido. */}
        <div
          aria-hidden="true"
          className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-black/5 px-4 py-3"
          style={{ background: bg.preview }}
        >
          <span className="font-serif text-lg font-semibold" style={{ color: accentShade.text }}>
            Entradas
          </span>
          <span
            className="rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: accentShade.pillBg, color: accentShade.pillFg }}
          >
            Categoria
          </span>
          <span
            className="rounded-lg px-2.5 py-1 text-sm font-bold"
            style={{
              background: bg.card,
              color: bg.cardDark
                ? MENU_ACCENTS[accent].onDark.text
                : MENU_ACCENTS[accent].onLight.text,
            }}
          >
            12,50 €
          </span>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-stone-800">Disposição dos pratos</legend>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {MENU_LAYOUT_IDS.map((id) => {
            const option = MENU_LAYOUTS[id];
            const selected = layout === id;
            return (
              <label key={id} className={`${OPTION_BASE} ${selected ? OPTION_ON : OPTION_OFF}`}>
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
                {selected && <SelectedMark />}
              </label>
            );
          })}
        </div>
        <p className="mt-1.5 text-xs text-stone-500">{MENU_LAYOUTS[layout].description}</p>
      </fieldset>
    </div>
  );
}
