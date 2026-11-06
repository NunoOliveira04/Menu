import { describe, expect, it } from 'vitest';
import {
  EU_ALLERGENS,
  getAllergenDefinition,
  normalizeAllergenList,
} from '@/lib/modules/allergens';
import { getHighlightLabel } from '@/lib/modules/highlights';
import {
  evaluateLisbonOpenStatus,
  formatDaySlots,
  normalizeWeeklySchedule,
  type DaySchedule,
} from '@/lib/modules/hours';
import {
  buildEnglishTranslationsJson,
  localeToHtmlLang,
  resolveLocalizedField,
  resolveMenuLocale,
} from '@/lib/modules/i18n';
import { createDishSchema, weeklyHoursUpdateSchema } from '@/lib/validations/schemas';

describe('Módulo de Idiomas (PT / EN) e Fallback', () => {
  it('resolve o idioma para EN apenas quando o módulo languages está ativo', () => {
    expect(resolveMenuLocale('en', true)).toBe('en');
    expect(resolveMenuLocale('EN', true)).toBe('en');
    expect(resolveMenuLocale('en', false)).toBe('pt');
    expect(resolveMenuLocale('fr', true)).toBe('pt');
    expect(resolveMenuLocale(undefined, true)).toBe('pt');

    expect(localeToHtmlLang('pt')).toBe('pt-PT');
    expect(localeToHtmlLang('en')).toBe('en');
  });

  it('devolve tradução EN quando presente e faz fallback limpo para PT quando vazia', () => {
    const translations = buildEnglishTranslationsJson(null, {
      nameEn: 'Salt Cod Fritters',
      descriptionEn: '',
    });

    expect(resolveLocalizedField('Pataniscas de Bacalhau', translations, 'name', 'en')).toBe(
      'Salt Cod Fritters',
    );

    // Descrição em inglês vazia -> fallback para PT
    expect(
      resolveLocalizedField('Fritas na hora em azeite.', translations, 'description', 'en'),
    ).toBe('Fritas na hora em azeite.');

    expect(resolveLocalizedField('Pataniscas de Bacalhau', translations, 'name', 'pt')).toBe(
      'Pataniscas de Bacalhau',
    );
  });
});

describe('Módulo de Alergénios (14 da UE) e Destaques', () => {
  it('inclui exatamente os 14 alergénios oficiais da UE numerados de 1 a 14', () => {
    expect(EU_ALLERGENS).toHaveLength(14);
    expect(EU_ALLERGENS.map((a) => a.number)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
    ]);
    expect(getAllergenDefinition('fish')?.label.pt).toBe('Peixes');
    expect(getAllergenDefinition('fish')?.label.en).toBe('Fish');
    expect(getAllergenDefinition('inexistente')).toBeNull();
  });

  it('normaliza, ordena e remove duplicados/inválidos na lista de alergénios', () => {
    expect(normalizeAllergenList(['molluscs', 'gluten', 'gluten', 'invalido'])).toEqual([
      'gluten',
      'molluscs',
    ]);
  });

  it('valida alergénios e selo de destaque no schema Zod do prato', () => {
    const valid = createDishSchema.safeParse({
      restaurantId: '11111111-1111-4111-8111-111111111111',
      categoryId: '22222222-2222-4222-8222-222222222201',
      name: 'Polvo à Lagareiro',
      nameEn: 'Lagareiro Octopus',
      priceCents: '21,00',
      allergens: ['molluscs', 'molluscs'],
      highlight: 'recommended',
    });

    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.allergens).toEqual(['molluscs']);
      expect(valid.data.highlight).toBe('recommended');
    }

    const invalidAllergen = createDishSchema.safeParse({
      restaurantId: '11111111-1111-4111-8111-111111111111',
      categoryId: '22222222-2222-4222-8222-222222222201',
      name: 'Prato',
      priceCents: '10,00',
      allergens: ['chocolate'],
    });
    expect(invalidAllergen.success).toBe(false);

    expect(getHighlightLabel('featured', 'pt')).toBe('Destaque da Casa');
    expect(getHighlightLabel('featured', 'en')).toBe('House Special');
    expect(getHighlightLabel(null, 'pt')).toBeNull();
  });
});

describe('Módulo de Horário Semanal e Fuso Europe/Lisbon', () => {
  const sampleSchedule: DaySchedule[] = normalizeWeeklySchedule([
    { day_of_week: 0, closed: true, slots: [] }, // Segunda: fechado
    {
      day_of_week: 1,
      closed: false,
      slots: [
        { open: '12:00', close: '15:00' },
        { open: '19:00', close: '22:30' },
      ],
    },
    {
      day_of_week: 4, // Sexta: turno noturno até 01:00 de sábado
      closed: false,
      slots: [{ open: '19:30', close: '01:00' }],
    },
  ]);

  it('calcula estado Aberto / Encerrado corretamente em UTC+0 (inverno) e UTC+1 (verão WEST) em Europe/Lisbon', () => {
    // Terça-feira 3 Nov 2026 às 13:30 UTC (inverno em Lisboa = 13:30 WET -> ABERTO no almoço)
    const winterLunchOpen = evaluateLisbonOpenStatus(
      sampleSchedule,
      new Date('2026-11-03T13:30:00Z'),
    );
    expect(winterLunchOpen.isOpen).toBe(true);
    expect(winterLunchOpen.currentDayOfWeek).toBe(1);

    // Terça-feira 3 Nov 2026 às 16:30 UTC (entre almoço e jantar -> ENCERRADO)
    const winterAfternoonClosed = evaluateLisbonOpenStatus(
      sampleSchedule,
      new Date('2026-11-03T16:30:00Z'),
    );
    expect(winterAfternoonClosed.isOpen).toBe(false);

    // Terça-feira 14 Jul 2026 às 18:15 UTC (verão em Lisboa UTC+1 = 19:15 WEST -> ABERTO no jantar!)
    const summerDinnerOpen = evaluateLisbonOpenStatus(
      sampleSchedule,
      new Date('2026-07-14T18:15:00Z'),
    );
    expect(summerDinnerOpen.localTime).toBe('19:15');
    expect(summerDinnerOpen.isOpen).toBe(true);

    // Sábado 7 Nov 2026 às 00:30 UTC (prolongamento do turno de sexta 19:30–01:00 -> ABERTO)
    const afterMidnightOpen = evaluateLisbonOpenStatus(
      sampleSchedule,
      new Date('2026-11-07T00:30:00Z'),
    );
    expect(afterMidnightOpen.currentDayOfWeek).toBe(5);
    expect(afterMidnightOpen.isOpen).toBe(true);
  });

  it('formata turnos do dia e valida sobreposição de 2 turnos via Zod', () => {
    expect(formatDaySlots(sampleSchedule[0]!, 'Encerrado')).toBe('Encerrado');
    expect(formatDaySlots(sampleSchedule[1]!, 'Encerrado')).toBe('12:00–15:00 · 19:00–22:30');

    const invalidOverlap = weeklyHoursUpdateSchema.safeParse({
      restaurantId: '11111111-1111-4111-8111-111111111111',
      days: Array.from({ length: 7 }, (_, idx) => ({
        dayOfWeek: idx,
        closed: idx !== 1,
        slots:
          idx === 1
            ? [
                { open: '12:00', close: '16:00' },
                { open: '15:00', close: '22:00' },
              ]
            : [],
      })),
    });
    expect(invalidOverlap.success).toBe(false);
  });
});
