import type { RestaurantStyle } from '@/types/database';

/**
 * Tokens CSS de cada paleta (aplicados em `.menu-theme`). Os ids mantêm os valores aceites
 * pela BD (`classico`, `moderno`, `escuro`); o nome mostrado ao dono é o `label`.
 */
export interface MenuThemeCssVars {
  '--color-bg': string;
  '--color-text': string;
  '--color-azulejo': string;
  '--color-accent': string;
  '--color-on-accent': string;
  '--color-card': string;
  '--color-muted': string;
  '--color-line': string;
  /** Separadores e contornos subtis. */
  '--color-border': string;
  /** Contornos de botões secundários (alergénios, fechar). */
  '--color-border-strong': string;
  /** Texto na cor do acento sobre o cartão (contraste AA). */
  '--color-accent-text': string;
  /** Barra de categorias. */
  '--nav-bg': string;
  '--pill-bg': string;
  '--pill-fg': string;
  '--pill-active-bg': string;
  '--pill-active-fg': string;
  /** Títulos e descrições das secções (sobre o fundo da página). */
  '--section-fg': string;
  '--section-muted': string;
  /** Preço em etiqueta. */
  '--price-bg': string;
  '--price-fg': string;
  '--card-shadow': string;
  '--radius-card': string;
  '--radius-pill': string;
  '--radius-thumb': string;
  '--font-display': string;
  '--font-body': string;
}

export interface MenuThemeTokens {
  id: RestaurantStyle;
  label: string;
  description: string;
  availableInMvp: boolean;
  /** Ornamento entre o título da categoria e os pratos (`none` no visual atual). */
  ornament: 'azulejo' | 'rule' | 'none';
  /** Cores para a amostra no painel (topo, fundo, acento). */
  swatch: { header: string; background: string; accent: string };
  cssVars: MenuThemeCssVars;
}

const SERIF = 'var(--font-serif), Georgia, serif';
const SANS = 'var(--font-sans), system-ui, sans-serif';

export const MENU_THEMES: Record<RestaurantStyle, MenuThemeTokens> = {
  classico: {
    id: 'classico',
    label: 'Quente',
    description: 'Terracota e areia, títulos elegantes.',
    availableInMvp: true,
    ornament: 'none',
    swatch: { header: '#B9461F', background: '#F6E7D7', accent: '#B9461F' },
    cssVars: {
      '--color-bg': '#F6E7D7',
      '--color-text': '#2B1A12',
      '--color-azulejo': '#1F3A5F',
      '--color-accent': '#B9461F',
      '--color-on-accent': '#FFF6EE',
      '--color-card': '#FFFBF6',
      '--color-muted': '#6E5446',
      '--color-line': 'rgba(43, 26, 18, 0.3)',
      '--color-border': 'rgba(43, 26, 18, 0.08)',
      '--color-border-strong': 'rgba(185, 70, 31, 0.35)',
      '--color-accent-text': '#A63C18',
      '--nav-bg': 'rgba(246, 231, 215, 0.92)',
      '--pill-bg': 'transparent',
      '--pill-fg': '#6B4434',
      '--pill-active-bg': '#B9461F',
      '--pill-active-fg': '#FFF6EE',
      '--section-fg': '#8F3214',
      '--section-muted': '#6E5446',
      '--price-bg': '#B9461F',
      '--price-fg': '#FFF6EE',
      '--card-shadow': '0 2px 4px rgba(120, 50, 20, 0.06), 0 16px 36px rgba(120, 50, 20, 0.12)',
      '--radius-card': '22px',
      '--radius-pill': '999px',
      '--radius-thumb': '0px',
      '--font-display': SERIF,
      '--font-body': SANS,
    },
  },
  moderno: {
    id: 'moderno',
    label: 'Viva',
    description: 'Verde-garrafa e laranja, moderno e fresco.',
    availableInMvp: true,
    ornament: 'none',
    swatch: { header: '#1E4D3A', background: '#FFF3EA', accent: '#FF6A3D' },
    cssVars: {
      '--color-bg': '#FFF3EA',
      '--color-text': '#14231C',
      '--color-azulejo': '#1E4D3A',
      '--color-accent': '#FF6A3D',
      '--color-on-accent': '#FFFFFF',
      '--color-card': '#FFFFFF',
      '--color-muted': '#55645C',
      '--color-line': 'rgba(20, 35, 28, 0.3)',
      '--color-border': 'rgba(20, 35, 28, 0.07)',
      '--color-border-strong': 'rgba(20, 35, 28, 0.18)',
      '--color-accent-text': '#C2410C',
      '--nav-bg': 'rgba(255, 243, 234, 0.92)',
      '--pill-bg': '#FFFFFF',
      '--pill-fg': '#1E4D3A',
      '--pill-active-bg': '#1E4D3A',
      '--pill-active-fg': '#FFFFFF',
      '--section-fg': '#1E4D3A',
      '--section-muted': '#55645C',
      '--price-bg': '#C2410C',
      '--price-fg': '#FFFFFF',
      '--card-shadow': '0 2px 6px rgba(20, 35, 28, 0.05), 0 16px 36px rgba(20, 35, 28, 0.1)',
      '--radius-card': '22px',
      '--radius-pill': '999px',
      '--radius-thumb': '0px',
      '--font-display': SANS,
      '--font-body': SANS,
    },
  },
  escuro: {
    id: 'escuro',
    label: 'Noite',
    description: 'Fundo escuro com detalhes dourados.',
    availableInMvp: true,
    ornament: 'none',
    swatch: { header: '#12100E', background: '#1C1916', accent: '#D9A65A' },
    cssVars: {
      '--color-bg': '#12100E',
      '--color-text': '#F4EEE6',
      '--color-azulejo': '#D9A65A',
      '--color-accent': '#D9A65A',
      '--color-on-accent': '#12100E',
      '--color-card': '#1C1916',
      '--color-muted': '#B9AE9F',
      '--color-line': 'rgba(244, 238, 230, 0.35)',
      '--color-border': 'rgba(255, 255, 255, 0.08)',
      '--color-border-strong': 'rgba(255, 255, 255, 0.22)',
      '--color-accent-text': '#E5B76B',
      '--nav-bg': 'rgba(18, 16, 14, 0.88)',
      '--pill-bg': 'transparent',
      '--pill-fg': '#B9AE9F',
      '--pill-active-bg': '#D9A65A',
      '--pill-active-fg': '#12100E',
      '--section-fg': '#F4EEE6',
      '--section-muted': '#B9AE9F',
      '--price-bg': 'rgba(217, 166, 90, 0.16)',
      '--price-fg': '#E5B76B',
      '--card-shadow': '0 0 0 1px rgba(255, 255, 255, 0.05), 0 18px 40px rgba(0, 0, 0, 0.45)',
      '--radius-card': '22px',
      '--radius-pill': '999px',
      '--radius-thumb': '0px',
      '--font-display': SERIF,
      '--font-body': SANS,
    },
  },
};

/** Paletas que o dono pode escolher no painel («Cores»). */
export const SELECTABLE_STYLES: readonly RestaurantStyle[] = (
  Object.values(MENU_THEMES) as MenuThemeTokens[]
)
  .filter((theme) => theme.availableInMvp)
  .map((theme) => theme.id);

export function resolveMenuTheme(style: string | null | undefined): MenuThemeTokens {
  if (style === 'moderno' || style === 'escuro' || style === 'classico') {
    return MENU_THEMES[style];
  }
  return MENU_THEMES.classico;
}
