import { z } from 'zod';
import { EU_ALLERGEN_CODES } from '@/lib/modules/allergens';
import { isValidTimeString, timeToMinutes } from '@/lib/modules/hours';
import { isReservedSlug, isValidSlug } from '@/lib/utils/slug';
import { parseEuroToCents } from '@/lib/utils/price';
import type { DishHighlight, EuAllergenCode } from '@/types/database';
import { detectImageSignature, type AllowedImageMimeType } from './image-signature';

export const ALLOWED_IMAGE_MIME_TYPES: readonly AllowedImageMimeType[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

export const MAX_DISH_PHOTO_BYTES = 5 * 1024 * 1024; // 5 MB

export const restaurantStyleSchema = z.enum(['classico', 'moderno', 'escuro'], {
  error: 'Escolhe um tema válido (Clássico, Moderno ou Escuro).',
});

export const euAllergenSchema = z.enum(
  EU_ALLERGEN_CODES as unknown as [EuAllergenCode, ...EuAllergenCode[]],
  {
    error: 'Alergénio inválido.',
  },
);

export const dishHighlightSchema = z.enum(['featured', 'recommended', 'new'] as const, {
  error: 'Tipo de destaque inválido.',
});

export const optionalDishHighlightSchema = z
  .union([dishHighlightSchema, z.literal(''), z.null(), z.undefined()])
  .transform((val): DishHighlight | null => {
    if (!val) {
      return null;
    }
    return val;
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
  descriptionEn: z
    .string()
    .trim()
    .max(400, 'A descrição em inglês não pode exceder 400 caracteres.')
    .optional()
    .or(z.literal('')),
});

export const timeSlotSchema = z
  .object({
    open: z
      .string()
      .trim()
      .refine((v) => isValidTimeString(v), {
        message: 'Hora de abertura inválida (usa HH:MM, ex.: 12:00).',
      }),
    close: z
      .string()
      .trim()
      .refine((v) => isValidTimeString(v), {
        message: 'Hora de fecho inválida (usa HH:MM, ex.: 15:00).',
      }),
  })
  .refine((slot) => slot.open !== slot.close, {
    message: 'A hora de abertura e a hora de fecho não podem ser iguais.',
  });

export const dayScheduleInputSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    closed: z.boolean(),
    slots: z
      .array(timeSlotSchema)
      .max(2, 'Cada dia suporta até 2 períodos (ex.: almoço e jantar).'),
  })
  .superRefine((day, ctx) => {
    if (!day.closed && day.slots.length === 0) {
      ctx.addIssue({
        code: 'custom',
        message: 'Indica pelo menos um período horário ou marca o dia como encerrado.',
        path: ['slots'],
      });
    }

    if (!day.closed && day.slots.length === 2) {
      const first = day.slots[0];
      const second = day.slots[1];
      if (first && second) {
        const firstOpen = timeToMinutes(first.open);
        const firstClose = timeToMinutes(first.close);
        const secondOpen = timeToMinutes(second.open);

        if (firstClose < firstOpen || secondOpen < firstClose) {
          ctx.addIssue({
            code: 'custom',
            message: 'O segundo período deve começar depois de o primeiro terminar.',
            path: ['slots'],
          });
        }
      }
    }
  });

export const weeklyHoursUpdateSchema = z.object({
  restaurantId: z.uuid('Identificador de restaurante inválido.'),
  days: z
    .array(dayScheduleInputSchema)
    .length(7, 'O horário deve incluir exatamente os 7 dias da semana.')
    .refine(
      (days) => {
        const seen = new Set(days.map((d) => d.dayOfWeek));
        return seen.size === 7;
      },
      { message: 'Os 7 dias da semana (0 a 6) devem ser únicos.' },
    ),
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
  nameEn: z
    .string()
    .trim()
    .max(80, 'O nome em inglês não pode exceder 80 caracteres.')
    .optional()
    .or(z.literal('')),
  descriptionEn: z
    .string()
    .trim()
    .max(240, 'A descrição em inglês não pode exceder 240 caracteres.')
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
  nameEn: z
    .string()
    .trim()
    .max(120, 'O nome em inglês não pode exceder 120 caracteres.')
    .optional()
    .or(z.literal('')),
  descriptionEn: z
    .string()
    .trim()
    .max(500, 'A descrição em inglês não pode exceder 500 caracteres.')
    .optional()
    .or(z.literal('')),
  priceCents: euroPriceStringSchema,
  available: z.boolean().default(true),
  allergens: z
    .array(euAllergenSchema)
    .max(14)
    .default([])
    .transform((list) => Array.from(new Set(list))),
  highlight: optionalDishHighlightSchema.default(null),
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
  bytes?: ArrayBuffer | Uint8Array;
}

export type PhotoValidationResult =
  | { valid: true; extension: 'jpg' | 'png' | 'webp' | 'avif'; mimeType: AllowedImageMimeType }
  | { valid: false; error: string };

const MIME_TO_EXTENSION: Record<AllowedImageMimeType, 'jpg' | 'png' | 'webp' | 'avif'> = {
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

  if (file.size > MAX_DISH_PHOTO_BYTES) {
    return {
      valid: false,
      error: 'A fotografia excede o tamanho máximo permitido de 5 MB.',
    };
  }

  if (file.bytes !== undefined) {
    const signature = detectImageSignature(file.bytes);
    if (!signature) {
      return {
        valid: false,
        error:
          'O conteúdo do ficheiro não corresponde a uma imagem JPEG, PNG, WebP ou AVIF válida.',
      };
    }

    if (file.type && file.type !== signature.mimeType) {
      return {
        valid: false,
        error: 'O tipo MIME declarado não coincide com o formato real da imagem.',
      };
    }

    return {
      valid: true,
      extension: signature.extension,
      mimeType: signature.mimeType,
    };
  }

  if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as AllowedImageMimeType)) {
    return {
      valid: false,
      error: 'Formato inválido. Usa uma imagem JPEG, PNG, WebP ou AVIF.',
    };
  }

  const mimeType = file.type as AllowedImageMimeType;
  return {
    valid: true,
    extension: MIME_TO_EXTENSION[mimeType],
    mimeType,
  };
}
