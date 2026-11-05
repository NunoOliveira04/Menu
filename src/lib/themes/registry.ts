import type { RestaurantStyle } from '@/types/database';

export interface MenuThemePreviewPalette {
  surfaceBg: string;
  cardBg: string;
  cardBorder: string;
  headingText: string;
  bodyText: string;
  accentBg: string;
  accentText: string;
  fontClass: 'font-serif' | 'font-sans';
}

export interface MenuThemeCssVars {
  '--color-bg': string;
  '--color-text': string;
  '--color-azulejo': string;
  '--color-accent': string;
  '--color-on-accent': string;
  '--color-card': string;
  '--color-muted': string;
  '--color-line': string;
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
  /** Azulejo só no tema clássico. Os outros usam um filete. */
  ornament: 'azulejo' | 'rule';
  cssVars: MenuThemeCssVars;
  preview: MenuThemePreviewPalette;
}

const DISPLAY = 'var(--font-serif), Georgia, serif';
const BODY = 'var(--font-sans), system-ui, sans-serif';

export const MENU_THEMES: Record<RestaurantStyle, MenuThemeTokens> = {
  classico: {
    id: 'classico',
    label: 'Clássico',
    description:
      'Marfim, Fraunces e tijolo. Um ornamento de azulejo só nos separadores de categoria.',
    availableInMvp: true,
    ornament: 'azulejo',
    cssVars: {
      '--color-bg': '#F5EFE6',
      '--color-text': '#2B2B2B',
      '--color-azulejo': '#1F3A5F',
      '--color-accent': '#B5452B',
      '--color-on-accent': '#FFFFFF',
      '--color-card': '#FFFFFF',
      '--color-muted': '#6B6B6B',
      '--color-line': 'rgba(43, 43, 43, 0.38)',
      '--radius-card': '18px',
      '--radius-pill': '999px',
      '--radius-thumb': '12px',
      '--font-display': DISPLAY,
      '--font-body': BODY,
    },
    preview: {
      surfaceBg: 'bg-[#F5EFE6]',
      cardBg: 'bg-white',
      cardBorder: 'border-[#E4D8C8]',
      headingText: 'text-[#2B2B2B]',
      bodyText: 'text-[#6B6B6B]',
      accentBg: 'bg-[#B5452B]',
      accentText: 'text-[#B5452B]',
      fontClass: 'font-serif',
    },
  },
  moderno: {
    id: 'moderno',
    label: 'Minimal Café',
    description: 'Papel quente, tipografia sóbria e muito ar. Sem ornamento, só um filete.',
    availableInMvp: true,
    ornament: 'rule',
    cssVars: {
      '--color-bg': '#F6F4F1',
      '--color-text': '#1C1C1C',
      '--color-azulejo': '#1C1C1C',
      '--color-accent': '#1C1C1C',
      '--color-on-accent': '#FFFFFF',
      '--color-card': '#FFFFFF',
      '--color-muted': '#5E5E5E',
      '--color-line': 'rgba(28, 28, 28, 0.32)',
      '--radius-card': '12px',
      '--radius-pill': '999px',
      '--radius-thumb': '8px',
      '--font-display': BODY,
      '--font-body': BODY,
    },
    preview: {
      surfaceBg: 'bg-[#F6F4F1]',
      cardBg: 'bg-white',
      cardBorder: 'border-[#E6E2DC]',
      headingText: 'text-[#1C1C1C]',
      bodyText: 'text-[#5E5E5E]',
      accentBg: 'bg-[#1C1C1C]',
      accentText: 'text-[#1C1C1C]',
      fontClass: 'font-sans',
    },
  },
  escuro: {
    id: 'escuro',
    label: 'Noir Gastronómico',
    description: 'Carvão profundo, Fraunces e um acento dourado quente com contraste AA.',
    availableInMvp: true,
    ornament: 'rule',
    cssVars: {
      '--color-bg': '#0E0D0C',
      '--color-text': '#F4EFE8',
      '--color-azulejo': '#C6A57A',
      '--color-accent': '#C6A57A',
      '--color-on-accent': '#1A120C',
      '--color-card': '#1A1816',
      '--color-muted': '#CDBFB0',
      '--color-line': 'rgba(244, 239, 232, 0.4)',
      '--radius-card': '16px',
      '--radius-pill': '999px',
      '--radius-thumb': '12px',
      '--font-display': DISPLAY,
      '--font-body': BODY,
    },
    preview: {
      surfaceBg: 'bg-[#0E0D0C]',
      cardBg: 'bg-[#1A1816]',
      cardBorder: 'border-[#3A342C]',
      headingText: 'text-[#F4EFE8]',
      bodyText: 'text-[#CDBFB0]',
      accentBg: 'bg-[#C6A57A]',
      accentText: 'text-[#C6A57A]',
      fontClass: 'font-serif',
    },
  },
};

export function resolveMenuTheme(style: string | null | undefined): MenuThemeTokens {
  if (style === 'moderno' || style === 'escuro' || style === 'classico') {
    return MENU_THEMES[style];
  }
  return MENU_THEMES.classico;
}
