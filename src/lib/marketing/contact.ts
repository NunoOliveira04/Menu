/**
 * Contactos mostrados na página de apresentação (oseumenu.pt/).
 *
 * TODO: preencher antes de divulgar a página.
 * - whatsapp: número com indicativo, só dígitos (ex.: '3519XXXXXXXX').
 * - email: endereço de contacto (ex.: 'ola@oseumenu.pt').
 * Enquanto um valor estiver vazio, o botão correspondente não aparece.
 */
export interface MarketingContact {
  whatsapp: string;
  email: string;
}

export const MARKETING_CONTACT: MarketingContact = {
  whatsapp: '',
  email: '',
};

const WHATSAPP_MESSAGE = 'Olá! Gostava de saber mais sobre O Seu Menu.';
const EMAIL_SUBJECT = 'O Seu Menu';

/** Ligação de WhatsApp (wa.me) ou null se o número estiver vazio ou inválido. */
export function buildWhatsAppUrl(phone: string): string | null {
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) {
    return null;
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
}

/** Ligação mailto: ou null se o e-mail estiver vazio ou inválido. */
export function buildEmailUrl(email: string): string | null {
  const trimmed = email.trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return null;
  }
  return `mailto:${trimmed}?subject=${encodeURIComponent(EMAIL_SUBJECT)}`;
}
