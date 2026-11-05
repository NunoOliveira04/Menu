import { describe, expect, it } from 'vitest';
import { detectImageSignature } from '@/lib/validations/image-signature';
import {
  MAX_DISH_PHOTO_BYTES,
  createCategorySchema,
  createDishSchema,
  createRestaurantSchema,
  slugFieldSchema,
  updateRestaurantSchema,
  validateDishPhotoFile,
} from '@/lib/validations/schemas';

const SAMPLE_JPEG_BYTES = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
const SAMPLE_PNG_BYTES = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
const SAMPLE_WEBP_BYTES = new Uint8Array([
  0x52,
  0x49,
  0x46,
  0x46, // RIFF
  0x24,
  0x00,
  0x00,
  0x00, // size
  0x57,
  0x45,
  0x42,
  0x50, // WEBP
  0x56,
  0x50,
  0x38,
  0x20, // VP8
]);
const SAMPLE_AVIF_MAJOR_BYTES = new Uint8Array([
  0x00,
  0x00,
  0x00,
  0x1c, // box size 28
  0x66,
  0x74,
  0x79,
  0x70, // ftyp
  0x61,
  0x76,
  0x69,
  0x66, // avif
  0x00,
  0x00,
  0x00,
  0x00,
]);
const SAMPLE_AVIF_COMPAT_BYTES = new Uint8Array([
  0x00,
  0x00,
  0x00,
  0x18, // box size 24
  0x66,
  0x74,
  0x79,
  0x70, // ftyp
  0x6d,
  0x69,
  0x66,
  0x31, // mif1 major brand
  0x00,
  0x00,
  0x00,
  0x00, // minor version
  0x6d,
  0x69,
  0x61,
  0x66, // miaf
  0x61,
  0x76,
  0x69,
  0x66, // avif compatible brand
]);

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

describe('Validações Zod — Categorias, Pratos e Magic Bytes de Fotografias', () => {
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

  it('deteta magic bytes reais para JPEG, PNG, WebP e AVIF (major e compatible brand)', () => {
    expect(detectImageSignature(SAMPLE_JPEG_BYTES)).toEqual({
      mimeType: 'image/jpeg',
      extension: 'jpg',
    });
    expect(detectImageSignature(SAMPLE_PNG_BYTES)).toEqual({
      mimeType: 'image/png',
      extension: 'png',
    });
    expect(detectImageSignature(SAMPLE_WEBP_BYTES)).toEqual({
      mimeType: 'image/webp',
      extension: 'webp',
    });
    expect(detectImageSignature(SAMPLE_AVIF_MAJOR_BYTES)).toEqual({
      mimeType: 'image/avif',
      extension: 'avif',
    });
    expect(detectImageSignature(SAMPLE_AVIF_COMPAT_BYTES)).toEqual({
      mimeType: 'image/avif',
      extension: 'avif',
    });
  });

  it('rejeita ficheiros cujo conteúdo binário não corresponde a uma imagem suportada (spoofing de MIME)', () => {
    const fakeSvgDisguisedAsJpeg = new TextEncoder().encode('<svg><script>alert(1)</script></svg>');
    expect(detectImageSignature(fakeSvgDisguisedAsJpeg)).toBeNull();

    const spoofedValidation = validateDishPhotoFile({
      size: fakeSvgDisguisedAsJpeg.byteLength,
      type: 'image/jpeg',
      name: 'ataque.jpg',
      bytes: fakeSvgDisguisedAsJpeg,
    });
    expect(spoofedValidation.valid).toBe(false);

    // PNG válido mas enviado com file.type='image/jpeg' também é recusado por incoerência
    const mismatchedMime = validateDishPhotoFile({
      size: SAMPLE_PNG_BYTES.byteLength,
      type: 'image/jpeg',
      name: 'trocado.jpg',
      bytes: SAMPLE_PNG_BYTES,
    });
    expect(mismatchedMime.valid).toBe(false);
  });

  it('aceita fotografia válida com magic bytes corretos e rejeita acima de 5 MB', () => {
    expect(
      validateDishPhotoFile({
        size: SAMPLE_WEBP_BYTES.byteLength,
        type: 'image/webp',
        name: 'prato.webp',
        bytes: SAMPLE_WEBP_BYTES,
      }),
    ).toEqual({ valid: true, extension: 'webp', mimeType: 'image/webp' });

    const tooLarge = validateDishPhotoFile({
      size: MAX_DISH_PHOTO_BYTES + 1,
      type: 'image/jpeg',
      name: 'huge.jpg',
      bytes: SAMPLE_JPEG_BYTES,
    });
    expect(tooLarge.valid).toBe(false);
  });
});
