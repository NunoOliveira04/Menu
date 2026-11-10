/** Iniciais do restaurante (até 2 letras), usadas quando ainda não há logotipo. */
export function restaurantInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = words
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('');
  return (initials || '?').toUpperCase();
}

export type DishBadgeCode = 'featured' | 'recommended' | 'new';

/** Selo a mostrar no prato (Da casa, Recomendado, Novo), se o módulo de destaques estiver ligado. */
export function dishBadge(
  highlight: string | null | undefined,
  highlightsModuleEnabled: boolean,
): DishBadgeCode | null {
  if (!highlightsModuleEnabled) {
    return null;
  }
  return highlight === 'featured' || highlight === 'recommended' || highlight === 'new'
    ? highlight
    : null;
}
