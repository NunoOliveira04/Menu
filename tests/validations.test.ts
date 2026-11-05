import { describe, expect, it } from 'vitest';
import {
  MAX_DISH_PHOTO_BYTES,
  createCategorySchema,
  createDishSchema,
  createRestaurantSchema,
  slugFieldSchema,
  updateRestaurantSchema,
  validateDishPhotoFile,
} from '@/lib/validations/schemas';

describe('Validações Zod — Restaurante e Slugs', () => {
  it('aceita um slug válido e normaliza maiúsculas/espaços', () => {
    const parsed = slugFieldSchema.safeParse('  Tasca-Do-Castelo  ');
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data).toBe('tasca-do-castelo');
    }
  });

  it('rejeita slugs reservados pelo sistema ou caracteres inválidos', () => {
    expect(slugFieldSchema.safeParse('dashboard').success).toBe(false);
    expect(slugFieldSchema.safeParse('login').success).toBe(false);
    expect(slugFieldSchema.safeParse('tasca--castelo').success).toBe(false);
    expect(slugFieldSchema.safeParse('tasca_castelo').success).toBe(false);
    expect(slugFieldSchema.safeParse('a').success).toBe(false);
  });

  it('valida criação de restaurante com estilo classico por defeito', () => {
    const parsed = createRestaurantSchema.safeParse({
      name: 'Tasca do Castelo',
      slug: 'tasca-do-castelo',
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.style).toBe('classico');
    }
  });

  it('valida atualização de restaurante incluindo módulos opcionais', () => {
    const parsed = updateRestaurantSchema.safeParse({
      restaurantId: '11111111-1111-4111-8111-111111111111',
      name: 'Tasca do Castelo',
      slug: 'tasca-do-castelo',
      description: 'Cozinha minhota.',
      location: 'Guimarães',
      style: 'escuro',
      published: true,
      modules: {
        languages: false,
        allergens: true,
        highlights: false,
        hours: false,
      },
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.style).toBe('escuro');
      expect(parsed.data.modules.allergens).toBe(true);
      expect(parsed.data.modules.languages).toBe(false);
    }
  });
});

describe('Validações Zod — Categorias, Pratos e Fotografias', () => {
  it('valida criação de categoria', () => {
    const ok = createCategorySchema.safeParse({
      restaurantId: '11111111-1111-4111-8111-111111111111',
      name: 'Petiscos & Entradas',
      description: 'Para partilhar',
    });
    expect(ok.success).toBe(true);

    const empty = createCategorySchema.safeParse({
      restaurantId: '11111111-1111-4111-8111-111111111111',
      name: '   ',
    });
    expect(empty.success).toBe(false);
  });

  it('converte preços em euros para cêntimos no schema do prato', () => {
    const parsed = createDishSchema.safeParse({
      restaurantId: '11111111-1111-4111-8111-111111111111',
      categoryId: '22222222-2222-4222-8222-222222222201',
      name: 'Bacalhau Assado',
      description: 'Com broa de milho',
      priceCents: '18,50',
      available: true,
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.priceCents).toBe(1850);
    }
  });

  it('rejeita preços negativos ou mal formatados', () => {
    const negative = createDishSchema.safeParse({
      restaurantId: '11111111-1111-4111-8111-111111111111',
      categoryId: '22222222-2222-4222-8222-222222222201',
      name: 'Prato Teste',
      priceCents: '-5,00',
    });
    expect(negative.success).toBe(false);

    const invalidDecimals = createDishSchema.safeParse({
      restaurantId: '11111111-1111-4111-8111-111111111111',
      categoryId: '22222222-2222-4222-8222-222222222201',
      name: 'Prato Teste',
      priceCents: '12,999',
    });
    expect(invalidDecimals.success).toBe(false);
  });

  it('valida tipo MIME e tamanho máximo de 5 MB das fotografias', () => {
    expect(
      validateDishPhotoFile({ size: 512_000, type: 'image/webp', name: 'prato.webp' }),
    ).toEqual({ valid: true, extension: 'webp' });

    const wrongType = validateDishPhotoFile({
      size: 100_000,
      type: 'application/pdf',
      name: 'menu.pdf',
    });
    expect(wrongType.valid).toBe(false);

    const tooLarge = validateDishPhotoFile({
      size: MAX_DISH_PHOTO_BYTES + 1,
      type: 'image/jpeg',
      name: 'huge.jpg',
    });
    expect(tooLarge.valid).toBe(false);
  });
});
