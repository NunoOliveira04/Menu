import type { EuAllergenCode, MenuLocale } from '@/types/database';

export interface EuAllergenDefinition {
  code: EuAllergenCode;
  shortCode: string;
  number: number;
  label: Record<MenuLocale, string>;
}

/**
 * Os 14 alergénios de declaração obrigatória na União Europeia (Anexo II Reg. UE 1169/2011).
 */
export const EU_ALLERGENS: readonly EuAllergenDefinition[] = [
  {
    code: 'gluten',
    shortCode: 'GLU',
    number: 1,
    label: { pt: 'Cereais com glúten', en: 'Cereals containing gluten' },
  },
  {
    code: 'crustaceans',
    shortCode: 'CRU',
    number: 2,
    label: { pt: 'Crustáceos', en: 'Crustaceans' },
  },
  {
    code: 'eggs',
    shortCode: 'OVO',
    number: 3,
    label: { pt: 'Ovos', en: 'Eggs' },
  },
  {
    code: 'fish',
    shortCode: 'PEI',
    number: 4,
    label: { pt: 'Peixes', en: 'Fish' },
  },
  {
    code: 'peanuts',
    shortCode: 'AME',
    number: 5,
    label: { pt: 'Amendoins', en: 'Peanuts' },
  },
  {
    code: 'soybeans',
    shortCode: 'SOJ',
    number: 6,
    label: { pt: 'Soja', en: 'Soybeans' },
  },
  {
    code: 'milk',
    shortCode: 'LAC',
    number: 7,
    label: { pt: 'Leite / Lactose', en: 'Milk / Lactose' },
  },
  {
    code: 'nuts',
    shortCode: 'FRU',
    number: 8,
    label: { pt: 'Frutos de casca rija', en: 'Tree nuts' },
  },
  {
    code: 'celery',
    shortCode: 'AIP',
    number: 9,
    label: { pt: 'Aipo', en: 'Celery' },
  },
  {
    code: 'mustard',
    shortCode: 'MOS',
    number: 10,
    label: { pt: 'Mostarda', en: 'Mustard' },
  },
  {
    code: 'sesame',
    shortCode: 'SES',
    number: 11,
    label: { pt: 'Sementes de sésamo', en: 'Sesame seeds' },
  },
  {
    code: 'sulphites',
    shortCode: 'SUL',
    number: 12,
    label: { pt: 'Dióxido de enxofre e sulfitos', en: 'Sulphur dioxide & sulphites' },
  },
  {
    code: 'lupin',
    shortCode: 'TRE',
    number: 13,
    label: { pt: 'Tremoço', en: 'Lupin' },
  },
  {
    code: 'molluscs',
    shortCode: 'MOL',
    number: 14,
    label: { pt: 'Moluscos', en: 'Molluscs' },
  },
] as const;

export const EU_ALLERGEN_CODES: readonly EuAllergenCode[] = EU_ALLERGENS.map((a) => a.code);

const ALLERGEN_MAP = new Map<EuAllergenCode, EuAllergenDefinition>(
  EU_ALLERGENS.map((item) => [item.code, item]),
);

export function getAllergenDefinition(code: string): EuAllergenDefinition | null {
  return ALLERGEN_MAP.get(code as EuAllergenCode) ?? null;
}

export function normalizeAllergenList(raw: readonly string[] | null | undefined): EuAllergenCode[] {
  if (!raw || raw.length === 0) {
    return [];
  }
  const validSet = new Set<EuAllergenCode>();
  for (const code of raw) {
    const def = getAllergenDefinition(code);
    if (def) {
      validSet.add(def.code);
    }
  }
  return EU_ALLERGENS.filter((def) => validSet.has(def.code)).map((def) => def.code);
}
