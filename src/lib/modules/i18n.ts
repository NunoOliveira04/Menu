import type { Json, MenuLocale } from '@/types/database';

export const MENU_LOCALES: readonly MenuLocale[] = ['pt', 'en'] as const;

export interface LocalizedTextFields {
  name?: string;
  description?: string;
}

export type TranslationsMap = Partial<Record<MenuLocale, LocalizedTextFields>>;

export function resolveMenuLocale(
  rawLang: string | string[] | undefined | null,
  languagesModuleEnabled: boolean,
): MenuLocale {
  if (!languagesModuleEnabled) {
    return 'pt';
  }
  const candidate = Array.isArray(rawLang) ? rawLang[0] : rawLang;
  if (candidate && candidate.trim().toLowerCase() === 'en') {
    return 'en';
  }
  return 'pt';
}

export function localeToHtmlLang(locale: MenuLocale): 'pt-PT' | 'en' {
  return locale === 'en' ? 'en' : 'pt-PT';
}

export function parseTranslationsJson(raw: Json | null | undefined): TranslationsMap {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }

  const root = raw as Record<string, Json | undefined>;
  const result: TranslationsMap = {};

  for (const locale of MENU_LOCALES) {
    const entry = root[locale];
    if (entry && typeof entry === 'object' && !Array.isArray(entry)) {
      const obj = entry as Record<string, Json | undefined>;
      const fields: LocalizedTextFields = {};
      if (typeof obj.name === 'string' && obj.name.trim().length > 0) {
        fields.name = obj.name.trim();
      }
      if (typeof obj.description === 'string' && obj.description.trim().length > 0) {
        fields.description = obj.description.trim();
      }
      if (fields.name || fields.description) {
        result[locale] = fields;
      }
    }
  }

  return result;
}

export function buildEnglishTranslationsJson(
  existingRaw: Json | null | undefined,
  input: { nameEn?: string | null | undefined; descriptionEn?: string | null | undefined },
): Json {
  const current = parseTranslationsJson(existingRaw);
  const nameEn = input.nameEn?.trim() ?? '';
  const descriptionEn = input.descriptionEn?.trim() ?? '';

  const nextEn: LocalizedTextFields = {};
  if (nameEn.length > 0) {
    nextEn.name = nameEn;
  }
  if (descriptionEn.length > 0) {
    nextEn.description = descriptionEn;
  }

  const merged: Record<string, Json> = {};
  if (current.pt && (current.pt.name || current.pt.description)) {
    merged.pt = {
      ...(current.pt.name ? { name: current.pt.name } : {}),
      ...(current.pt.description ? { description: current.pt.description } : {}),
    };
  }
  if (nextEn.name || nextEn.description) {
    merged.en = {
      ...(nextEn.name ? { name: nextEn.name } : {}),
      ...(nextEn.description ? { description: nextEn.description } : {}),
    };
  }

  return merged;
}

export function resolveLocalizedField(
  basePtValue: string | null | undefined,
  translationsRaw: Json | null | undefined,
  field: keyof LocalizedTextFields,
  locale: MenuLocale,
): string | null {
  const cleanBase = basePtValue?.trim() ?? '';
  if (locale === 'pt') {
    return cleanBase.length > 0 ? cleanBase : null;
  }

  const parsed = parseTranslationsJson(translationsRaw);
  const translated = parsed[locale]?.[field]?.trim() ?? '';
  if (translated.length > 0) {
    return translated;
  }

  return cleanBase.length > 0 ? cleanBase : null;
}

export interface MenuUiDictionary {
  skipToMenu: string;
  draftBanner: string;
  languageSelectorLabel: string;
  categoriesNavLabel: string;
  highlightsSectionTitle: string;
  highlightsSectionSubtitle: string;
  emptyMenuTitle: string;
  emptyMenuSubtitle: string;
  priceAriaPrefix: string;
  unavailableBadge: string;
  photoAltPrefix: string;
  allergensLabel: string;
  allergensButton: string;
  allergensClose: string;
  allergensLegendTitle: string;
  allergensLegendNote: string;
  houseBadge: string;
  hoursTitle: string;
  openNowBadge: string;
  closedNowBadge: string;
  closedDayLabel: string;
  timezoneNote: string;
  vatIncluded: string;
}

export const MENU_UI_STRINGS: Record<MenuLocale, MenuUiDictionary> = {
  pt: {
    skipToMenu: 'Saltar para a ementa',
    draftBanner:
      'Pré-visualização de rascunho — apenas visível para membros do restaurante. Ativa a publicação no painel para abrir ao público.',
    languageSelectorLabel: 'Selecionar idioma da ementa',
    categoriesNavLabel: 'Categorias da ementa',
    highlightsSectionTitle: 'Em Destaque',
    highlightsSectionSubtitle: 'Sugestões especiais e novidades da nossa cozinha.',
    emptyMenuTitle: 'A nossa ementa está a ser preparada.',
    emptyMenuSubtitle: 'Volta a consultar dentro de momentos.',
    priceAriaPrefix: 'Preço',
    unavailableBadge: 'Temporariamente indisponível',
    photoAltPrefix: 'Fotografia de',
    allergensLabel: 'Alergénios presentes',
    allergensButton: 'Alergénios',
    allergensClose: 'Fechar',
    houseBadge: 'Da casa',
    allergensLegendTitle: 'Informação de Alergénios (Regulamento UE 1169/2011)',
    allergensLegendNote:
      'Em caso de alergia ou intolerância alimentar, confirma sempre com a nossa equipa antes de pedir.',
    hoursTitle: 'Horário de Funcionamento',
    openNowBadge: 'Aberto agora',
    closedNowBadge: 'Encerrado de momento',
    closedDayLabel: 'Encerrado',
    timezoneNote: 'Hora local de Portugal Continental (Europe/Lisbon)',
    vatIncluded: 'IVA incluído à taxa legal em vigor.',
  },
  en: {
    skipToMenu: 'Skip to menu',
    draftBanner:
      'Draft preview — only visible to restaurant members. Enable publishing in the dashboard to open to the public.',
    languageSelectorLabel: 'Select menu language',
    categoriesNavLabel: 'Menu categories',
    highlightsSectionTitle: 'Highlights',
    highlightsSectionSubtitle: 'Chef recommendations, house specials and new dishes.',
    emptyMenuTitle: 'Our menu is being prepared.',
    emptyMenuSubtitle: 'Please check back shortly.',
    priceAriaPrefix: 'Price',
    unavailableBadge: 'Temporarily unavailable',
    photoAltPrefix: 'Photo of',
    allergensLabel: 'Contains allergens',
    allergensButton: 'Allergens',
    allergensClose: 'Close',
    houseBadge: 'House',
    allergensLegendTitle: 'Allergen Information (EU Regulation 1169/2011)',
    allergensLegendNote:
      'If you have any food allergy or intolerance, please inform our staff before ordering.',
    hoursTitle: 'Opening Hours',
    openNowBadge: 'Open now',
    closedNowBadge: 'Currently closed',
    closedDayLabel: 'Closed',
    timezoneNote: 'Local time in Mainland Portugal (Europe/Lisbon)',
    vatIncluded: 'VAT included at the applicable legal rate.',
  },
};
