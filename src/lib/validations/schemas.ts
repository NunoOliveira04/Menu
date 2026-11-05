import { z } from 'zod';
import { isReservedSlug, isValidSlug } from '@/lib/utils/slug';
import { parseEuroToCents } from '@/lib/utils/price';

export const ALLOWED_IMAGE_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

export const MAX_DISH_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

export const restaurantStyleSchema = z.enum(['classico', 'moderno', 'escuro'], {
  error: 'Escolhe um tema válido (Clássico, Moderno ou Escuro).',
});

export const restaurantModulesSchema = z.object({
  languages: z.boolean().default(false),
  allergens: z.boolean().default(false),
  highlights: z.boolean().default(false),
  hours: z.boolean().default(false),
});

export const restaurantSettingsSchema = z.object({
  modules: restaurantModulesSchema.default({
    languages: false,
    allergens: false,
    highlights: false,
    hours: false,
  }),
});

export const slugFieldSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, 'O identificador (slug) deve ter pelo menos 2 caracteres.')
  .max(63, 'O identificador (slug) não pode exceder 63 caracteres.')
  .refine((val) => !isReservedSlug(val), {
    message: 'Este identificador está reservado pelo sistema.',
  })
  .refine((val) => isValidSlug(val), {
    message:
      'Usa apenas letras minúsculas (a-z), números e hífens simples (ex.: tasca-do-castelo).',
  });

export const authCredentialsSchema = z.object({
  email: z.email('Introduz um endereço de email válido.').trim().toLowerCase(),
  password: z
    .string()
    .min(8, 'A palavra-passe deve ter pelo menos 8 caracteres.')
    .max(128, 'A palavra-passe é demasiado longa.'),
});

export const registerOwnerSchema = authCredentialsSchema.extend({
  restaurantName: z
    .string()
    .trim()
    .min(2, 'O nome do restaurante deve ter pelo menos 2 caracteres.')
    .max(120, 'O nome do restaurante não pode exceder 120 caracteres.')
    .optional()
    .or(z.literal('')),
});

export const createRestaurantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'O nome do restaurante deve ter pelo menos 2 caracteres.')
    .max(120, 'O nome do restaurante não pode exceder 120 caracteres.'),
  slug: slugFieldSchema,
  description: z
    .string()
    .trim()
    .max(400, 'A descrição não pode exceder 400 caracteres.')
    .optional()
    .or(z.literal('')),
  location: z
    .string()
    .trim()
    .max(120, 'A localização não pode exceder 120 caracteres.')
    .optional()
    .or(z.literal('')),
  style: restaurantStyleSchema.default('classico'),
});

export const updateRestaurantSchema = createRestaurantSchema.extend({
  restaurantId: z.uuid('Identificador de restaurante inválido.'),
  published: z.boolean(),
  modules: restaurantModulesSchema,
});

export const createCategorySchema = z.object({
  restaurantId: z.uuid('Identificador de restaurante inválido.'),
  name: z
    .string()
    .trim()
    .min(1, 'O nome da categoria é obrigatório.')
    .max(80, 'O nome da categoria não pode exceder 80 caracteres.'),
  description: z
    .string()
    .trim()
    .max(240, 'A descrição da categoria não pode exceder 240 caracteres.')
    .optional()
    .or(z.literal('')),
});

export const updateCategorySchema = createCategorySchema.extend({
  categoryId: z.uuid('Identificador de categoria inválido.'),
});

export const deleteCategorySchema = z.object({
  restaurantId: z.uuid('Identificador de restaurante inválido.'),
  categoryId: z.uuid('Identificador de categoria inválido.'),
});

export const reorderCategorySchema = z.object({
  restaurantId: z.uuid('Identificador de restaurante inválido.'),
  categoryId: z.uuid('Identificador de categoria inválido.'),
  direction: z.enum(['up', 'down']),
});

export const euroPriceStringSchema = z
  .string()
  .trim()
  .min(1, 'Indica o preço do prato (ex.: 12,50).')
  .transform((val, ctx) => {
    const cents = parseEuroToCents(val);
    if (cents === null) {
      ctx.addIssue({
        code: 'custom',
        message: 'Preço inválido. Usa um valor não negativo como 12,50 ou 8.',
      });
      return z.NEVER;
    }
    return cents;
  });

export const createDishSchema = z.object({
  restaurantId: z.uuid('Identificador de restaurante inválido.'),
  categoryId: z.uuid('Seleciona uma categoria válida.'),
  name: z
    .string()
    .trim()
    .min(1, 'O nome do prato é obrigatório.')
    .max(120, 'O nome do prato não pode exceder 120 caracteres.'),
  description: z
    .string()
    .trim()
    .max(500, 'A descrição do prato não pode exceder 500 caracteres.')
    .optional()
    .or(z.literal('')),
  priceCents: euroPriceStringSchema,
  available: z.boolean().default(true),
});

export const updateDishSchema = createDishSchema.extend({
  dishId: z.uuid('Identificador de prato inválido.'),
  removePhoto: z.boolean().default(false),
});

export const deleteDishSchema = z.object({
  restaurantId: z.uuid('Identificador de restaurante inválido.'),
  dishId: z.uuid('Identificador de prato inválido.'),
});

export const toggleDishAvailabilitySchema = z.object({
  restaurantId: z.uuid('Identificador de restaurante inválido.'),
  dishId: z.uuid('Identificador de prato inválido.'),
  available: z.boolean(),
});

export const reorderDishSchema = z.object({
  restaurantId: z.uuid('Identificador de restaurante inválido.'),
  categoryId: z.uuid('Identificador de categoria inválido.'),
  dishId: z.uuid('Identificador de prato inválido.'),
  direction: z.enum(['up', 'down']),
});

export interface PhotoValidationInput {
  size: number;
  type: string;
  name?: string;
}

export type PhotoValidationResult =
  { valid: true; extension: string } | { valid: false; error: string };

const MIME_TO_EXTENSION: Record<(typeof ALLOWED_IMAGE_MIME_TYPES)[number], string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export function validateDishPhotoFile(
  file: PhotoValidationInput | null | undefined,
): PhotoValidationResult {
  if (!file || file.size === 0) {
    return { valid: false, error: 'Nenhum ficheiro de imagem selecionado.' };
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number])) {
    return {
      valid: false,
      error: 'Formato inválido. Usa uma imagem JPEG, PNG, WebP ou AVIF.',
    };
  }

  if (file.size > MAX_DISH_PHOTO_BYTES) {
    return {
      valid: false,
      error: 'A fotografia excede o tamanho máximo permitido de 5 MB.',
    };
  }

  const extension = MIME_TO_EXTENSION[file.type as (typeof ALLOWED_IMAGE_MIME_TYPES)[number]];
  return { valid: true, extension };
}
