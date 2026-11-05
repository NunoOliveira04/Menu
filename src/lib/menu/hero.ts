export interface MenuHeroCandidate {
  name: string;
  photoUrl: string | null;
  highlight: string | null;
  available: boolean;
}

export interface MenuHeroSelection {
  photoUrl: string;
  name: string;
}

/**
 * Escolhe a fotografia do hero (~35vh): prato em destaque com foto,
 * senão o primeiro prato disponível com foto de comida.
 */
export function selectMenuHero(dishes: readonly MenuHeroCandidate[]): MenuHeroSelection | null {
  const withPhoto = dishes.filter((dish) => Boolean(dish.photoUrl));
  const featured = withPhoto.find((dish) => dish.available && dish.highlight === 'featured');
  const fallback = featured ?? withPhoto.find((dish) => dish.available) ?? withPhoto[0];
  if (!fallback?.photoUrl) {
    return null;
  }
  return { photoUrl: fallback.photoUrl, name: fallback.name };
}

/** Etiqueta pontual «Da casa» — só o selo featured, nunca um bloco de destaques. */
export function showsHouseBadge(
  highlight: string | null | undefined,
  highlightsModuleEnabled: boolean,
): boolean {
  return highlightsModuleEnabled && highlight === 'featured';
}
