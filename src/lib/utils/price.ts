const euroFormatter = new Intl.NumberFormat('pt-PT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPriceCents(priceCents: number): string {
  const safeCents = Number.isFinite(priceCents) ? Math.max(0, Math.round(priceCents)) : 0;
  return euroFormatter.format(safeCents / 100);
}

export function formatCentsToEuroInput(priceCents: number): string {
  const safeCents = Number.isFinite(priceCents) ? Math.max(0, Math.round(priceCents)) : 0;
  return (safeCents / 100).toFixed(2).replace('.', ',');
}

/**
 * Converte texto de preço em euros ("12,50", "12.5", "8") para cêntimos inteiros.
 * Devolve null se o formato for inválido ou negativo.
 */
export function parseEuroToCents(rawValue: string): number | null {
  const trimmed = rawValue.trim().replace(/\s+/g, '').replace(/^€/, '').replace(/€$/, '');
  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.replace(',', '.');
  if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100000) {
    return null;
  }

  return Math.round(parsed * 100);
}
