import { describe, expect, it } from 'vitest';
import {
  MENU_BACKGROUND_IDS,
  MENU_BACKGROUNDS,
  backgroundCssVars,
  parseMenuBackgroundId,
  MENU_LAYOUT_IDS,
  parseMenuLayout,
  resolveMenuBackground,
} from '@/lib/themes/backgrounds';

describe('Fundos da carta («Fundo» nas definições)', () => {
  it('tem liso, madeira clara, madeira escura, linho e pedra', () => {
    expect(MENU_BACKGROUND_IDS).toEqual([
      'nenhum',
      'madeira-clara',
      'madeira-escura',
      'linho',
      'pedra',
    ]);
    expect(MENU_BACKGROUNDS['madeira-clara'].label).toBe('Madeira clara');
  });

  it('as texturas são SVG embutidos (sem pedidos a sites externos)', () => {
    for (const id of MENU_BACKGROUND_IDS) {
      const bg = MENU_BACKGROUNDS[id];
      if (bg.css === null) {
        continue;
      }
      expect(bg.css).toContain('data:image/svg+xml');
      expect(bg.css).not.toMatch(/https?:\/\//);
      // Fundos com textura definem cores de título legíveis por cima.
      expect(bg.sectionFg).toBeTruthy();
      expect(bg.sectionMuted).toBeTruthy();
    }
  });

  it('«Liso» não muda as variáveis da paleta; as texturas definem fundo e títulos', () => {
    expect(backgroundCssVars(MENU_BACKGROUNDS.nenhum)).toEqual({});
    const vars = backgroundCssVars(MENU_BACKGROUNDS['madeira-escura']);
    expect(vars['--page-bg']).toContain('data:image/svg+xml');
    expect(vars['--section-fg']).toBe('#FFF7EE');
  });

  it('lê o fundo guardado nas definições e ignora valores inválidos', () => {
    expect(parseMenuBackgroundId({ appearance: { background: 'linho' } })).toBe('linho');
    expect(parseMenuBackgroundId({ appearance: { background: 'marmore-falso' } })).toBe('nenhum');
    expect(parseMenuBackgroundId({ modules: {} })).toBe('nenhum');
    expect(parseMenuBackgroundId(null)).toBe('nenhum');
    expect(parseMenuBackgroundId([])).toBe('nenhum');
    expect(resolveMenuBackground(undefined).id).toBe('nenhum');
  });

  it('tem três disposições e lê a escolhida (compatível com a opção antiga de colunas)', () => {
    expect(MENU_LAYOUT_IDS).toEqual(['lista', 'grelha', 'foto']);
    expect(parseMenuLayout({ appearance: { layout: 'foto' } })).toBe('foto');
    expect(parseMenuLayout({ appearance: { layout: 'grelha' } })).toBe('grelha');
    expect(parseMenuLayout({ appearance: { layout: 'carrossel' } })).toBe('lista');
    expect(parseMenuLayout({ appearance: { columns: true } })).toBe('grelha');
    expect(parseMenuLayout({ appearance: {} })).toBe('lista');
    expect(parseMenuLayout(null)).toBe('lista');
  });
});
