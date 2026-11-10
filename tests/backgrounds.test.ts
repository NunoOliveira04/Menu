import { describe, expect, it } from 'vitest';
import {
  MENU_ACCENT_IDS,
  MENU_ACCENTS,
  MENU_BACKGROUND_IDS,
  MENU_BACKGROUNDS,
  MENU_LAYOUT_IDS,
  menuCssVars,
  parseMenuAppearance,
  resolveMenuAccent,
  resolveMenuBackground,
  resolveMenuLayout,
} from '@/lib/themes/backgrounds';

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}

describe('Aspeto da carta: Fundo, Cor e Disposição', () => {
  it('Fundo: claro, areia, escuro e texturas; Cor: cinco destaques; Disposição: três', () => {
    expect(MENU_BACKGROUND_IDS).toEqual([
      'claro',
      'areia',
      'escuro',
      'madeira-clara',
      'madeira-escura',
      'linho',
      'pedra',
    ]);
    expect(MENU_ACCENT_IDS).toEqual(['terracota', 'dourado', 'verde', 'azul', 'grafite']);
    expect(MENU_LAYOUT_IDS).toEqual(['lista', 'grelha', 'foto']);
  });

  it('as texturas são SVG embutidos (sem pedidos a sites externos)', () => {
    for (const id of MENU_BACKGROUND_IDS) {
      expect(MENU_BACKGROUNDS[id].css).not.toMatch(/https?:\/\//);
    }
    expect(MENU_BACKGROUNDS['madeira-clara'].css).toContain('data:image/svg+xml');
  });

  it('a Cor só muda os destaques: o fundo da página e dos cartões vem do Fundo', () => {
    const a = menuCssVars('areia', 'terracota');
    const b = menuCssVars('areia', 'azul');
    for (const token of ['--page-bg', '--color-bg', '--color-card', '--color-text'] as const) {
      expect(a[token]).toBe(b[token]);
    }
    expect(a['--price-fg']).not.toBe(b['--price-fg']);
    expect(a['--pill-active-bg']).not.toBe(b['--pill-active-bg']);
  });

  it('os destaques têm contraste AA sobre os cartões e a categoria ativa lê-se bem', () => {
    for (const bgId of MENU_BACKGROUND_IDS) {
      for (const accentId of MENU_ACCENT_IDS) {
        const vars = menuCssVars(bgId, accentId);
        const label = `${bgId} + ${accentId}`;
        expect(contrast(vars['--price-fg'], vars['--color-card']), label).toBeGreaterThanOrEqual(
          4.5,
        );
        expect(
          contrast(vars['--pill-active-fg'], vars['--pill-active-bg']),
          label,
        ).toBeGreaterThanOrEqual(4.5);
        // Títulos das secções são texto grande (≥ 24 px): mínimo AA de 3:1 sobre o fundo base.
        expect(contrast(vars['--section-fg'], vars['--color-bg']), label).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('em fundos escuros o texto de destaque fica claro', () => {
    expect(menuCssVars('escuro', 'grafite')['--section-fg']).toBe(MENU_ACCENTS.grafite.onDark.text);
    expect(menuCssVars('claro', 'grafite')['--section-fg']).toBe(MENU_ACCENTS.grafite.onLight.text);
  });

  it('lê as escolhas guardadas e converte as antigas', () => {
    expect(
      parseMenuAppearance({ appearance: { background: 'linho', accent: 'verde', layout: 'foto' } }),
    ).toEqual({ background: 'linho', accent: 'verde', layout: 'foto' });
    // Estilo antigo sem escolhas novas → fundo e cor equivalentes
    expect(parseMenuAppearance({}, 'escuro')).toEqual({
      background: 'escuro',
      accent: 'dourado',
      layout: 'lista',
    });
    expect(parseMenuAppearance({ appearance: { background: 'nenhum' } }, 'moderno')).toMatchObject({
      background: 'claro',
      accent: 'grafite',
    });
    expect(parseMenuAppearance({ appearance: { columns: true } }).layout).toBe('grelha');
    expect(parseMenuAppearance(null)).toEqual({
      background: 'areia',
      accent: 'terracota',
      layout: 'lista',
    });
  });

  it('valores inválidos caem para opções seguras', () => {
    expect(resolveMenuBackground('http://evil.example/x.png').id).toBe('areia');
    expect(resolveMenuAccent('rosa-choque').id).toBe('terracota');
    expect(resolveMenuLayout('carrossel')).toBe('lista');
  });
});
