import type { RestaurantStyle } from '@/types/database';

export interface MenuThemeTokens {
  id: RestaurantStyle;
  label: string;
  description: string;
  availableInMvp: boolean;
  classes: {
    pageWrapper: string;
    headerSurface: string;
    headerOrnament: string;
    restaurantTitle: string;
    restaurantSubtitle: string;
    locationBadge: string;
    navStickyBar: string;
    navPill: string;
    navPillActive: string;
    sectionHeading: string;
    sectionDescription: string;
    sectionDivider: string;
    dishCard: string;
    dishCardUnavailable: string;
    dishTitle: string;
    dishDescription: string;
    dishPrice: string;
    unavailableBadge: string;
    photoFrame: string;
    footer: string;
  };
}

export const MENU_THEMES: Record<RestaurantStyle, MenuThemeTokens> = {
  classico: {
    id: 'classico',
    label: 'Clássico Editorial',
    description: 'Papel marfim quente, tipografia serifada elegante e apontamentos terracota.',
    availableInMvp: true,
    classes: {
      pageWrapper: 'min-h-screen bg-[#FAF6F0] text-[#1F1A17] antialiased selection:bg-[#8C3B2B]/15',
      headerSurface: 'border-b border-[#E6DDD0] bg-gradient-to-b from-[#F5EFE6] to-[#FAF6F0]',
      headerOrnament: 'text-[#8C3B2B]',
      restaurantTitle:
        'font-serif text-3xl font-semibold tracking-tight text-[#1C1613] sm:text-4xl',
      restaurantSubtitle: 'text-sm leading-relaxed text-[#5C5149] sm:text-base',
      locationBadge:
        'inline-flex items-center gap-1.5 rounded-full border border-[#DFD3C3] bg-[#F3ECE1] px-3 py-1 text-xs font-medium text-[#5A4638]',
      navStickyBar:
        'sticky top-0 z-20 border-b border-[#E6DDD0] bg-[#FAF6F0]/95 backdrop-blur supports-[backdrop-filter]:bg-[#FAF6F0]/85',
      navPill:
        'whitespace-nowrap rounded-full border border-[#DFD3C3] bg-white/80 px-3.5 py-1.5 text-xs font-medium text-[#4A3F37] transition hover:border-[#8C3B2B] hover:text-[#8C3B2B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C3B2B]',
      navPillActive: 'border-[#8C3B2B] bg-[#8C3B2B] text-white hover:bg-[#773123] hover:text-white',
      sectionHeading:
        'font-serif text-2xl font-semibold tracking-tight text-[#1C1613] sm:text-[1.65rem]',
      sectionDescription: 'mt-1 text-sm text-[#6B5E54]',
      sectionDivider: 'mt-3 h-px w-16 bg-[#8C3B2B]/40',
      dishCard:
        'group flex gap-4 rounded-2xl border border-[#EAE0D3] bg-white/90 p-4 shadow-[0_1px_3px_rgba(28,22,19,0.04)] transition hover:border-[#D6C5B1]',
      dishCardUnavailable: 'opacity-65',
      dishTitle: 'font-serif text-lg font-medium leading-snug text-[#1F1A17]',
      dishDescription: 'mt-1.5 text-sm leading-relaxed text-[#655950]',
      dishPrice: 'font-sans text-base font-semibold tabular-nums text-[#8C3B2B]',
      unavailableBadge:
        'inline-flex items-center rounded-full border border-[#D8CFC4] bg-[#F3EFEA] px-2.5 py-0.5 text-[11px] font-medium text-[#6E6258]',
      photoFrame:
        'relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[#EAE0D3] bg-[#F3ECE1] sm:h-28 sm:w-28',
      footer: 'border-t border-[#E6DDD0] bg-[#F5EFE6]/70 text-xs text-[#6B5E54]',
    },
  },
  moderno: {
    id: 'moderno',
    label: 'Moderno Minimal',
    description: 'Fundo branco puro, alto contraste geométrico e cartões limpos.',
    availableInMvp: true,
    classes: {
      pageWrapper: 'min-h-screen bg-zinc-50 text-zinc-900 antialiased selection:bg-emerald-500/15',
      headerSurface: 'border-b border-zinc-200 bg-white',
      headerOrnament: 'text-emerald-700',
      restaurantTitle: 'font-sans text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl',
      restaurantSubtitle: 'text-sm leading-relaxed text-zinc-600 sm:text-base',
      locationBadge:
        'inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700',
      navStickyBar:
        'sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85',
      navPill:
        'whitespace-nowrap rounded-full border border-zinc-200 bg-zinc-100 px-3.5 py-1.5 text-xs font-medium text-zinc-700 transition hover:border-zinc-900 hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900',
      navPillActive: 'border-zinc-900 bg-zinc-900 text-white',
      sectionHeading: 'font-sans text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl',
      sectionDescription: 'mt-1 text-sm text-zinc-500',
      sectionDivider: 'mt-3 h-1 w-10 rounded-full bg-emerald-600',
      dishCard:
        'group flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-300',
      dishCardUnavailable: 'opacity-60',
      dishTitle: 'font-sans text-base font-semibold leading-snug text-zinc-950',
      dishDescription: 'mt-1 text-sm leading-relaxed text-zinc-600',
      dishPrice: 'font-sans text-base font-bold tabular-nums text-emerald-700',
      unavailableBadge:
        'inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-600',
      photoFrame:
        'relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 sm:h-28 sm:w-28',
      footer: 'border-t border-zinc-200 bg-white text-xs text-zinc-500',
    },
  },
  escuro: {
    id: 'escuro',
    label: 'Noturno Elegante',
    description: 'Ambiente intimista em carvão suave com detalhes em âmbar dourado.',
    availableInMvp: true,
    classes: {
      pageWrapper: 'min-h-screen bg-[#121110] text-[#F5EFE6] antialiased selection:bg-amber-400/20',
      headerSurface: 'border-b border-[#262320] bg-[#181614]',
      headerOrnament: 'text-amber-400',
      restaurantTitle:
        'font-serif text-3xl font-semibold tracking-tight text-[#FAF6F0] sm:text-4xl',
      restaurantSubtitle: 'text-sm leading-relaxed text-[#B5AAA0] sm:text-base',
      locationBadge:
        'inline-flex items-center gap-1.5 rounded-full border border-[#302B27] bg-[#211E1B] px-3 py-1 text-xs font-medium text-[#D6C9BC]',
      navStickyBar:
        'sticky top-0 z-20 border-b border-[#262320] bg-[#121110]/95 backdrop-blur supports-[backdrop-filter]:bg-[#121110]/85',
      navPill:
        'whitespace-nowrap rounded-full border border-[#302B27] bg-[#1B1917] px-3.5 py-1.5 text-xs font-medium text-[#D6C9BC] transition hover:border-amber-400 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
      navPillActive: 'border-amber-400 bg-amber-400 text-[#121110]',
      sectionHeading: 'font-serif text-2xl font-semibold tracking-tight text-[#FAF6F0]',
      sectionDescription: 'mt-1 text-sm text-[#9E9388]',
      sectionDivider: 'mt-3 h-px w-16 bg-amber-400/50',
      dishCard:
        'group flex gap-4 rounded-2xl border border-[#262320] bg-[#191715] p-4 transition hover:border-[#3A342E]',
      dishCardUnavailable: 'opacity-55',
      dishTitle: 'font-serif text-lg font-medium leading-snug text-[#FAF6F0]',
      dishDescription: 'mt-1.5 text-sm leading-relaxed text-[#A89D92]',
      dishPrice: 'font-sans text-base font-semibold tabular-nums text-amber-400',
      unavailableBadge:
        'inline-flex items-center rounded-full border border-[#332E2A] bg-[#24201D] px-2.5 py-0.5 text-[11px] font-medium text-[#A89D92]',
      photoFrame:
        'relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[#2C2825] bg-[#211E1B] sm:h-28 sm:w-28',
      footer: 'border-t border-[#262320] bg-[#161412] text-xs text-[#9E9388]',
    },
  },
};

export function resolveMenuTheme(style: string | null | undefined): MenuThemeTokens {
  if (style === 'moderno' || style === 'escuro' || style === 'classico') {
    return MENU_THEMES[style];
  }
  return MENU_THEMES.classico;
}
