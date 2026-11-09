/** Etiqueta pontual «Da casa» — só o selo featured, nunca um bloco de destaques. */
export function showsHouseBadge(
  highlight: string | null | undefined,
  highlightsModuleEnabled: boolean,
): boolean {
  return highlightsModuleEnabled && highlight === 'featured';
}

/** Iniciais do restaurante (até 2 letras), usadas quando ainda não há logotipo. */
export function restaurantInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initials = words
    .slice(0, 2)
    .map((word) => word[0] ?? '')
    .join('');
  return (initials || '?').toUpperCase();
}
