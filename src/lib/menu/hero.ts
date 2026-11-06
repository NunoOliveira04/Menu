/** Etiqueta pontual «Da casa» — só o selo featured, nunca um bloco de destaques. */
export function showsHouseBadge(
  highlight: string | null | undefined,
  highlightsModuleEnabled: boolean,
): boolean {
  return highlightsModuleEnabled && highlight === 'featured';
}
