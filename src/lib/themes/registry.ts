import type { DishHighlight, RestaurantStyle } from '@/types/database';

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

export interface MenuThemeTokens {
  id: RestaurantStyle;
  label: string;
  description: string;
  availableInMvp: boolean;
  preview: MenuThemePreviewPalette;
  classes: {
    pageWrapper: string;
    skipLink: string;
    headerSurface: string;
    headerOrnament: string;
    restaurantTitle: string;
    restaurantSubtitle: string;
    locationBadge: string;
    langSwitcherContainer: string;
    langOption: string;
    langOptionActive: string;
    statusOpenBadge: string;
    statusClosedBadge: string;
    navStickyBar: string;
    navPill: string;
    navPillActive: string;
    highlightsBox: string;
    highlightBadges: Record<DishHighlight, string>;
    sectionHeading: string;
    sectionDescription: string;
    sectionDivider: string;
    dishCard: string;
    dishCardUnavailable: string;
    dishTitle: string;
    dishDescription: string;
    dishPrice: string;
    unavailableBadge: string;
    allergenBadge: string;
    allergenNumber: string;
    photoFrame: string;
    infoSectionCard: string;
    infoSectionTitle: string;
    infoSectionMuted: string;
    hoursCurrentRow: string;
    footer: string;
  };
}

export const MENU_THEMES: Record<RestaurantStyle, MenuThemeTokens> = {
  classico: {
    id: 'classico',
    label: 'Clássico Editorial',
    description: 'Papel marfim quente, tipografia serifada elegante e apontamentos terracota.',
    availableInMvp: true,
    preview: {
      surfaceBg: 'bg-[#FAF6F0]',
      cardBg: 'bg-white',
      cardBorder: 'border-[#E6DDD0]',
      headingText: 'text-[#1C1613]',
      bodyText: 'text-[#5C5149]',
      accentBg: 'bg-[#8C3B2B]',
      accentText: 'text-[#8C3B2B]',
      fontClass: 'font-serif',
    },
    classes: {
      pageWrapper: 'min-h-screen bg-[#FAF6F0] text-[#1F1A17] antialiased selection:bg-[#8C3B2B]/15',
      skipLink:
        'sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-[#8C3B2B] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white',
      headerSurface: 'border-b border-[#E6DDD0] bg-gradient-to-b from-[#F5EFE6] to-[#FAF6F0]',
      headerOrnament: 'text-[#8C3B2B]',
      restaurantTitle:
        'font-serif text-3xl font-semibold tracking-tight text-[#1C1613] sm:text-4xl',
      restaurantSubtitle: 'text-sm leading-relaxed text-[#52463E] sm:text-base',
      locationBadge:
        'inline-flex items-center gap-1.5 rounded-full border border-[#DFD3C3] bg-[#F3ECE1] px-3 py-1 text-xs font-medium text-[#4E3C2F]',
      langSwitcherContainer:
        'inline-flex items-center rounded-full border border-[#DFD3C3] bg-white/90 p-0.5 shadow-sm',
      langOption:
        'rounded-full px-3 py-1 text-xs font-semibold text-[#4A3F37] transition hover:text-[#8C3B2B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C3B2B]',
      langOptionActive: 'bg-[#8C3B2B] text-white hover:text-white',
      statusOpenBadge:
        'inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900',
      statusClosedBadge:
        'inline-flex items-center gap-1.5 rounded-full border border-[#D8CBB8] bg-[#EFE8DD] px-3 py-1 text-xs font-medium text-[#4E4239]',
      navStickyBar:
        'sticky top-0 z-20 border-b border-[#E6DDD0] bg-[#FAF6F0]/95 backdrop-blur supports-[backdrop-filter]:bg-[#FAF6F0]/85',
      navPill:
        'whitespace-nowrap rounded-full border border-[#DFD3C3] bg-white px-3.5 py-1.5 text-xs font-medium text-[#433830] transition hover:border-[#8C3B2B] hover:text-[#8C3B2B] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8C3B2B]',
      navPillActive: 'border-[#8C3B2B] bg-[#8C3B2B] text-white hover:bg-[#773123] hover:text-white',
      highlightsBox:
        'rounded-3xl border border-[#DFCEBA] bg-gradient-to-br from-[#F6EFE4] via-white to-[#F6EFE4] p-5 sm:p-6 shadow-sm',
      highlightBadges: {
        featured:
          'inline-flex items-center gap-1 rounded-full border border-[#8C3B2B]/30 bg-[#8C3B2B] px-2.5 py-0.5 text-[11px] font-semibold text-white',
        recommended:
          'inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-950',
        new: 'inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-950',
      },
      sectionHeading:
        'font-serif text-2xl font-semibold tracking-tight text-[#1C1613] sm:text-[1.65rem]',
      sectionDescription: 'mt-1 text-sm text-[#5C5046]',
      sectionDivider: 'mt-3 h-px w-16 bg-[#8C3B2B]/45',
      dishCard:
        'group flex gap-4 rounded-2xl border border-[#EAE0D3] bg-white p-4 shadow-[0_1px_3px_rgba(28,22,19,0.04)] transition hover:border-[#D6C5B1]',
      dishCardUnavailable: 'opacity-65',
      dishTitle: 'font-serif text-lg font-semibold leading-snug text-[#1F1A17]',
      dishDescription: 'mt-1.5 text-sm leading-relaxed text-[#574C43]',
      dishPrice: 'font-sans text-base font-semibold tabular-nums text-[#8C3B2B]',
      unavailableBadge:
        'inline-flex items-center rounded-full border border-[#D8CFC4] bg-[#F3EFEA] px-2.5 py-0.5 text-[11px] font-medium text-[#5A4F46]',
      allergenBadge:
        'inline-flex items-center gap-1 rounded-md border border-[#DFD3C3] bg-[#F8F3EC] px-2 py-0.5 text-[11px] font-medium text-[#4A3E35]',
      allergenNumber: 'font-mono text-[10px] font-bold text-[#8C3B2B]',
      photoFrame:
        'relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[#EAE0D3] bg-[#F3ECE1] sm:h-28 sm:w-28',
      infoSectionCard: 'rounded-2xl border border-[#E6DDD0] bg-white p-5 sm:p-6 shadow-sm',
      infoSectionTitle: 'font-serif text-xl font-semibold text-[#1C1613]',
      infoSectionMuted: 'text-xs leading-relaxed text-[#5C5046]',
      hoursCurrentRow: 'rounded-lg bg-[#F5EFE6] px-2.5 py-1.5 font-semibold text-[#1C1613]',
      footer: 'border-t border-[#E6DDD0] bg-[#F5EFE6]/80 text-xs text-[#5C5046]',
    },
  },
  moderno: {
    id: 'moderno',
    label: 'Moderno Minimal',
    description: 'Fundo claro geométrico, tipografia contemporânea nítida e contraste AA elevado.',
    availableInMvp: true,
    preview: {
      surfaceBg: 'bg-zinc-50',
      cardBg: 'bg-white',
      cardBorder: 'border-zinc-200',
      headingText: 'text-zinc-950',
      bodyText: 'text-zinc-600',
      accentBg: 'bg-emerald-700',
      accentText: 'text-emerald-800',
      fontClass: 'font-sans',
    },
    classes: {
      pageWrapper: 'min-h-screen bg-zinc-50 text-zinc-950 antialiased selection:bg-emerald-600/15',
      skipLink:
        'sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-zinc-950 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white',
      headerSurface: 'border-b border-zinc-200 bg-white',
      headerOrnament: 'text-emerald-700',
      restaurantTitle: 'font-sans text-3xl font-bold tracking-tight text-zinc-950 sm:text-4xl',
      restaurantSubtitle: 'text-sm leading-relaxed text-zinc-700 sm:text-base',
      locationBadge:
        'inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-800',
      langSwitcherContainer:
        'inline-flex items-center rounded-full border border-zinc-300 bg-zinc-100 p-0.5',
      langOption:
        'rounded-full px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950',
      langOptionActive: 'bg-zinc-950 text-white hover:text-white',
      statusOpenBadge:
        'inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-900',
      statusClosedBadge:
        'inline-flex items-center gap-1.5 rounded-full border border-zinc-300 bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-800',
      navStickyBar:
        'sticky top-0 z-20 border-b border-zinc-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85',
      navPill:
        'whitespace-nowrap rounded-full border border-zinc-300 bg-zinc-100 px-3.5 py-1.5 text-xs font-semibold text-zinc-800 transition hover:border-zinc-950 hover:bg-white hover:text-zinc-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950',
      navPillActive: 'border-zinc-950 bg-zinc-950 text-white',
      highlightsBox:
        'rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-zinc-50 p-5 sm:p-6 shadow-sm',
      highlightBadges: {
        featured:
          'inline-flex items-center gap-1 rounded-full bg-zinc-950 px-2.5 py-0.5 text-[11px] font-semibold text-white',
        recommended:
          'inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-900',
        new: 'inline-flex items-center gap-1 rounded-full border border-sky-300 bg-sky-50 px-2.5 py-0.5 text-[11px] font-semibold text-sky-950',
      },
      sectionHeading: 'font-sans text-xl font-bold tracking-tight text-zinc-950 sm:text-2xl',
      sectionDescription: 'mt-1 text-sm text-zinc-600',
      sectionDivider: 'mt-3 h-1 w-10 rounded-full bg-emerald-700',
      dishCard:
        'group flex gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:border-zinc-400',
      dishCardUnavailable: 'opacity-60',
      dishTitle: 'font-sans text-base font-bold leading-snug text-zinc-950',
      dishDescription: 'mt-1 text-sm leading-relaxed text-zinc-700',
      dishPrice: 'font-sans text-base font-bold tabular-nums text-emerald-800',
      unavailableBadge:
        'inline-flex items-center rounded-full border border-zinc-300 bg-zinc-100 px-2.5 py-0.5 text-[11px] font-medium text-zinc-700',
      allergenBadge:
        'inline-flex items-center gap-1 rounded-md border border-zinc-300 bg-zinc-100 px-2 py-0.5 text-[11px] font-medium text-zinc-800',
      allergenNumber: 'font-mono text-[10px] font-bold text-emerald-800',
      photoFrame:
        'relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100 sm:h-28 sm:w-28',
      infoSectionCard: 'rounded-2xl border border-zinc-200 bg-white p-5 sm:p-6 shadow-sm',
      infoSectionTitle: 'font-sans text-lg font-bold text-zinc-950',
      infoSectionMuted: 'text-xs leading-relaxed text-zinc-600',
      hoursCurrentRow: 'rounded-lg bg-emerald-50 px-2.5 py-1.5 font-semibold text-zinc-950',
      footer: 'border-t border-zinc-200 bg-white text-xs text-zinc-600',
    },
  },
  escuro: {
    id: 'escuro',
    label: 'Noturno Elegante',
    description: 'Ambiente intimista em carvão profundo com apontamentos em âmbar luminoso (AA).',
    availableInMvp: true,
    preview: {
      surfaceBg: 'bg-[#121110]',
      cardBg: 'bg-[#1B1917]',
      cardBorder: 'border-[#332E2A]',
      headingText: 'text-[#FAF6F0]',
      bodyText: 'text-[#CFC4B8]',
      accentBg: 'bg-amber-400',
      accentText: 'text-amber-300',
      fontClass: 'font-serif',
    },
    classes: {
      pageWrapper: 'min-h-screen bg-[#121110] text-[#F5EFE6] antialiased selection:bg-amber-400/25',
      skipLink:
        'sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-amber-400 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-[#121110]',
      headerSurface: 'border-b border-[#2D2925] bg-gradient-to-b from-[#1A1715] to-[#121110]',
      headerOrnament: 'text-amber-300',
      restaurantTitle:
        'font-serif text-3xl font-semibold tracking-tight text-[#FAF6F0] sm:text-4xl',
      restaurantSubtitle: 'text-sm leading-relaxed text-[#D0C5B9] sm:text-base',
      locationBadge:
        'inline-flex items-center gap-1.5 rounded-full border border-[#3B352F] bg-[#211E1B] px-3 py-1 text-xs font-medium text-[#E5DACF]',
      langSwitcherContainer:
        'inline-flex items-center rounded-full border border-[#3B352F] bg-[#1C1917] p-0.5',
      langOption:
        'rounded-full px-3 py-1 text-xs font-semibold text-[#D6C9BC] transition hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
      langOptionActive: 'bg-amber-400 text-[#121110] hover:text-[#121110]',
      statusOpenBadge:
        'inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-950/80 px-3 py-1 text-xs font-semibold text-emerald-200',
      statusClosedBadge:
        'inline-flex items-center gap-1.5 rounded-full border border-[#3B352F] bg-[#211E1B] px-3 py-1 text-xs font-medium text-[#D6C9BC]',
      navStickyBar:
        'sticky top-0 z-20 border-b border-[#2D2925] bg-[#121110]/95 backdrop-blur supports-[backdrop-filter]:bg-[#121110]/85',
      navPill:
        'whitespace-nowrap rounded-full border border-[#3B352F] bg-[#1C1917] px-3.5 py-1.5 text-xs font-medium text-[#E5DACF] transition hover:border-amber-400 hover:text-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
      navPillActive: 'border-amber-400 bg-amber-400 text-[#121110]',
      highlightsBox:
        'rounded-3xl border border-amber-400/30 bg-gradient-to-br from-[#211D18] via-[#191715] to-[#141210] p-5 sm:p-6 shadow-sm',
      highlightBadges: {
        featured:
          'inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[11px] font-bold text-[#121110]',
        recommended:
          'inline-flex items-center gap-1 rounded-full border border-amber-400/50 bg-amber-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-amber-200',
        new: 'inline-flex items-center gap-1 rounded-full border border-emerald-400/40 bg-emerald-950/70 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200',
      },
      sectionHeading: 'font-serif text-2xl font-semibold tracking-tight text-[#FAF6F0]',
      sectionDescription: 'mt-1 text-sm text-[#BEB2A6]',
      sectionDivider: 'mt-3 h-px w-16 bg-amber-400/60',
      dishCard:
        'group flex gap-4 rounded-2xl border border-[#2D2925] bg-[#1A1816] p-4 transition hover:border-[#463F38]',
      dishCardUnavailable: 'opacity-55',
      dishTitle: 'font-serif text-lg font-medium leading-snug text-[#FAF6F0]',
      dishDescription: 'mt-1.5 text-sm leading-relaxed text-[#C8BDB1]',
      dishPrice: 'font-sans text-base font-semibold tabular-nums text-amber-300',
      unavailableBadge:
        'inline-flex items-center rounded-full border border-[#3B352F] bg-[#24201D] px-2.5 py-0.5 text-[11px] font-medium text-[#C8BDB1]',
      allergenBadge:
        'inline-flex items-center gap-1 rounded-md border border-[#3B352F] bg-[#24201D] px-2 py-0.5 text-[11px] font-medium text-[#E5DACF]',
      allergenNumber: 'font-mono text-[10px] font-bold text-amber-300',
      photoFrame:
        'relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-[#332E2A] bg-[#211E1B] sm:h-28 sm:w-28',
      infoSectionCard: 'rounded-2xl border border-[#2D2925] bg-[#1A1816] p-5 sm:p-6',
      infoSectionTitle: 'font-serif text-xl font-semibold text-[#FAF6F0]',
      infoSectionMuted: 'text-xs leading-relaxed text-[#BEB2A6]',
      hoursCurrentRow: 'rounded-lg bg-amber-400/15 px-2.5 py-1.5 font-semibold text-amber-200',
      footer: 'border-t border-[#2D2925] bg-[#161412] text-xs text-[#BEB2A6]',
    },
  },
};

export function resolveMenuTheme(style: string | null | undefined): MenuThemeTokens {
  if (style === 'moderno' || style === 'escuro' || style === 'classico') {
    return MENU_THEMES[style];
  }
  return MENU_THEMES.classico;
}
