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
  /** Separadores e contornos subtis (listas, cartões, barra de categorias). */
  '--color-border': string;
  /** Contornos de botões secundários (alergénios, fechar). */
  '--color-border-strong': string;
  /** Texto na cor do acento sobre fundo claro (contraste AA). */
  '--color-accent-text': string;
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
  /** Ornamento entre o título da categoria e os pratos (`none` no visual moderno). */
  ornament: 'azulejo' | 'rule' | 'none';
  cssVars: MenuThemeCssVars;
  preview: MenuThemePreviewPalette;
}

const DISPLAY = 'var(--font-serif), Georgia, serif';
const BODY = 'var(--font-sans), system-ui, sans-serif';

export const MENU_THEMES: Record<RestaurantStyle, MenuThemeTokens> = {
  // O id mantém-se `classico` (valor por omissão na BD); o visual é o moderno e limpo do piloto.
  classico: {
    id: 'classico',
    label: 'Essencial',
    description:
      'Moderno e limpo: fundo claro, tipografia Inter, fotografias em destaque e categorias numa só linha.',
    availableInMvp: true,
    ornament: 'none',
    cssVars: {
      '--color-bg': '#F6F6F3',
      '--color-text': '#18181B',
      '--color-azulejo': '#1F3A5F',
      '--color-accent': '#B5452B',
      '--color-on-accent': '#FFFFFF',
      '--color-card': '#FFFFFF',
      '--color-muted': '#5F5F67',
      '--color-line': 'rgba(24, 24, 27, 0.3)',
      '--color-border': 'rgba(24, 24, 27, 0.08)',
      '--color-border-strong': 'rgba(24, 24, 27, 0.18)',
      '--color-accent-text': '#9E3A24',
      '--radius-card': '16px',
      '--radius-pill': '999px',
      '--radius-thumb': '12px',
      '--font-display': BODY,
      '--font-body': BODY,
    },
    preview: {
      surfaceBg: 'bg-[#F6F6F3]',
      cardBg: 'bg-white',
      cardBorder: 'border-[#E7E7E4]',
      headingText: 'text-[#18181B]',
      bodyText: 'text-[#5F5F67]',
      accentBg: 'bg-[#18181B]',
      accentText: 'text-[#18181B]',
      fontClass: 'font-sans',
    },
  },
  moderno: {
    id: 'moderno',
    label: 'Minimal Café',
    description: 'Papel quente, tipografia sóbria e muito ar. Sem ornamento, só um filete.',
    // Escondido do dono durante o piloto (só «Clássico»). O código fica para mais tarde.
    availableInMvp: false,
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
      '--color-border': 'rgba(28, 28, 28, 0.08)',
      '--color-border-strong': 'rgba(28, 28, 28, 0.18)',
      '--color-accent-text': '#1C1C1C',
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
    // Escondido do dono durante o piloto (só «Clássico»). O código fica para mais tarde.
    availableInMvp: false,
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
      '--color-border': 'rgba(244, 239, 232, 0.12)',
      '--color-border-strong': 'rgba(244, 239, 232, 0.28)',
      '--color-accent-text': '#C6A57A',
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

/** Estilos que o dono pode escolher no admin (no piloto, só «classico»). */
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
