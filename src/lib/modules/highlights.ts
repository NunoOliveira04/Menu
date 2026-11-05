import type { DishHighlight, MenuLocale } from '@/types/database';

export interface HighlightDefinition {
  code: DishHighlight;
  label: Record<MenuLocale, string>;
}

export const DISH_HIGHLIGHTS: readonly HighlightDefinition[] = [
  {
    code: 'featured',
    label: { pt: 'Destaque da Casa', en: 'House Special' },
  },
  {
    code: 'recommended',
    label: { pt: 'Recomendado pelo Chef', en: "Chef's Pick" },
  },
  {
    code: 'new',
    label: { pt: 'Novo na Carta', en: 'New' },
  },
] as const;

export function getHighlightLabel(
  highlight: DishHighlight | string | null | undefined,
  locale: MenuLocale,
): string | null {
  if (!highlight) {
    return null;
  }
  const found = DISH_HIGHLIGHTS.find((item) => item.code === highlight);
  return found ? found.label[locale] : null;
}
