import { z } from 'zod';

export const DEMO_REQUEST_SUCCESS = 'Obrigado! Vamos contactá-lo em breve.';

/** Tempo mínimo (ms) entre abrir o formulário e enviá-lo: abaixo disto é quase sempre um robô. */
export const DEMO_REQUEST_MIN_FILL_MS = 2500;

/** Normaliza o telemóvel: só dígitos, com «+» opcional no início (ex.: «+351 912 345 678»). */
export function normalizePhone(raw: string): string {
  const trimmed = raw.trim();
  const plus = trimmed.startsWith('+') ? '+' : '';
  return plus + trimmed.replace(/\D/g, '');
}

export const demoRequestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Indique o seu nome.')
    .max(80, 'O nome não pode exceder 80 caracteres.'),
  restaurant: z
    .string()
    .trim()
    .min(2, 'Indique o nome do restaurante.')
    .max(120, 'O nome do restaurante não pode exceder 120 caracteres.'),
  phone: z
    .string()
    .transform(normalizePhone)
    .refine((value) => /^\+?\d{9,15}$/.test(value), {
      message: 'Indique um telemóvel válido (ex.: 912 345 678).',
    }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(160, 'O e-mail não pode exceder 160 caracteres.')
    .refine((value) => value === '' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(value), {
      message: 'Indique um e-mail válido ou deixe em branco.',
    })
    .transform((value) => (value === '' ? null : value)),
  consent: z.literal(true, {
    error: 'Para o podermos contactar, precisamos da sua autorização.',
  }),
});

export type DemoRequestInput = z.output<typeof demoRequestSchema>;

/** Lê o formulário (FormData) num objeto para validar. */
export function readDemoRequestForm(formData: FormData) {
  return {
    name: String(formData.get('name') ?? ''),
    restaurant: String(formData.get('restaurant') ?? ''),
    phone: String(formData.get('phone') ?? ''),
    email: String(formData.get('email') ?? ''),
    consent: formData.get('consent') === 'on' || formData.get('consent') === 'true',
  };
}

/**
 * Sinais de robô: o campo escondido «website» vem preenchido, ou o formulário foi enviado
 * depressa demais depois de aberto.
 */
export function looksLikeBot(formData: FormData, now: number = Date.now()): boolean {
  const honeypot = String(formData.get('website') ?? '').trim();
  if (honeypot.length > 0) {
    return true;
  }
  const startedAt = Number(formData.get('startedAt'));
  if (!Number.isFinite(startedAt) || startedAt <= 0) {
    return true;
  }
  return now - startedAt < DEMO_REQUEST_MIN_FILL_MS;
}
