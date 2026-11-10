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
  // «Areia»: fundo areia quente com detalhes em terracota.
  classico: {
    id: 'classico',
    label: 'Areia',
    description: 'Areia quente com detalhes em terracota.',
    availableInMvp: true,
    ornament: 'none',
    swatch: { header: '#B9461F', background: '#F3E6D6', accent: '#B9461F' },
    cssVars: {
      '--color-bg': '#F3E6D6',
      '--color-text': '#1E1611',
      '--color-azulejo': '#1F3A5F',
      '--color-accent': '#B9461F',
      '--color-on-accent': '#FFFFFF',
      '--color-card': '#FFFCF8',
      '--color-muted': '#6B5D52',
      '--color-line': 'rgba(30, 22, 17, 0.3)',
      '--color-border': 'rgba(30, 22, 17, 0.08)',
      '--color-border-strong': 'rgba(185, 70, 31, 0.32)',
      '--color-accent-text': '#A63C18',
      '--nav-bg': 'rgba(243, 230, 214, 0.94)',
      '--pill-bg': '#FFFCF8',
      '--pill-fg': '#3A2A20',
      '--pill-active-bg': '#B9461F',
      '--pill-active-fg': '#FFFFFF',
      '--section-fg': '#1E1611',
      '--section-muted': '#6B5D52',
      '--price-bg': 'transparent',
      '--price-fg': '#A63C18',
      '--card-shadow': '0 1px 2px rgba(120, 60, 25, 0.06), 0 10px 28px rgba(120, 60, 25, 0.1)',
      '--radius-card': '20px',
      '--radius-pill': '999px',
      '--radius-thumb': '14px',
      '--font-display': SERIF,
      '--font-body': SANS,
    },
  },
  // «Claro»: creme claro com detalhes escuros.
  moderno: {
    id: 'moderno',
    label: 'Claro',
    description: 'Creme claro, limpo e elegante.',
    availableInMvp: true,
    ornament: 'none',
    swatch: { header: '#1A1714', background: '#F4F1EC', accent: '#1A1714' },
    cssVars: {
      '--color-bg': '#F4F1EC',
      '--color-text': '#1A1714',
      '--color-azulejo': '#1A1714',
      '--color-accent': '#B9461F',
      '--color-on-accent': '#FFFFFF',
      '--color-card': '#FFFFFF',
      '--color-muted': '#6E655C',
      '--color-line': 'rgba(26, 23, 20, 0.3)',
      '--color-border': 'rgba(26, 23, 20, 0.07)',
      '--color-border-strong': 'rgba(26, 23, 20, 0.18)',
      '--color-accent-text': '#A63C18',
      '--nav-bg': 'rgba(244, 241, 236, 0.94)',
      '--pill-bg': 'transparent',
      '--pill-fg': '#5E564E',
      '--pill-active-bg': '#1A1714',
      '--pill-active-fg': '#FFFFFF',
      '--section-fg': '#1A1714',
      '--section-muted': '#6E655C',
      '--price-bg': 'transparent',
      '--price-fg': '#A63C18',
      '--card-shadow': '0 14px 34px rgba(26, 23, 20, 0.12)',
      '--radius-card': '24px',
      '--radius-pill': '999px',
      '--radius-thumb': '0px',
      '--font-display': SERIF,
      '--font-body': SANS,
    },
  },
  // «Noite»: fundo escuro com detalhes dourados.
  escuro: {
    id: 'escuro',
    label: 'Noite',
    description: 'Fundo escuro com detalhes dourados.',
    availableInMvp: true,
    ornament: 'none',
    swatch: { header: '#0F0E0C', background: '#0F0E0C', accent: '#D9A65A' },
    cssVars: {
      '--color-bg': '#0F0E0C',
      '--color-text': '#F2ECE3',
      '--color-azulejo': '#D9A65A',
      '--color-accent': '#D9A65A',
      '--color-on-accent': '#0F0E0C',
      '--color-card': '#191714',
      '--color-muted': '#A89F93',
      '--color-line': 'rgba(242, 236, 227, 0.35)',
      '--color-border': 'rgba(255, 255, 255, 0.08)',
      '--color-border-strong': 'rgba(255, 255, 255, 0.22)',
      '--color-accent-text': '#E5B76B',
      '--nav-bg': 'rgba(15, 14, 12, 0.92)',
      '--pill-bg': 'transparent',
      '--pill-fg': '#A89F93',
      '--pill-active-bg': '#F2ECE3',
      '--pill-active-fg': '#0F0E0C',
      '--section-fg': '#F2ECE3',
      '--section-muted': '#A89F93',
      '--price-bg': 'transparent',
      '--price-fg': '#E5B76B',
      '--card-shadow': 'none',
      '--radius-card': '6px',
      '--radius-pill': '999px',
      '--radius-thumb': '6px',
      '--font-display': SERIF,
      '--font-body': SANS,
    },
  },
};

/** Cores que o dono pode escolher no painel («Cor»). */
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
