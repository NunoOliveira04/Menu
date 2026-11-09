/**
 * Âncoras legíveis para as secções da carta (ex.: `#peixe-bacalhau` em vez de `#cat-<uuid>`).
 */
export function slugifyAnchor(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
    .replace(/-+$/g, '');
}

/**
 * Gera uma âncora única por categoria a partir do nome mostrado.
 * Nomes repetidos ganham sufixo (`-2`, `-3`, …); nomes sem letras usam `seccao`.
 */
export function buildCategoryAnchors(
  categories: readonly { id: string; name: string }[],
): Map<string, string> {
  const used = new Set<string>();
  const anchors = new Map<string, string>();

  for (const category of categories) {
    const base = slugifyAnchor(category.name) || 'seccao';
    let anchor = base;
    let counter = 2;
    while (used.has(anchor)) {
      anchor = `${base}-${counter}`;
      counter += 1;
    }
    used.add(anchor);
    anchors.set(category.id, anchor);
  }

  return anchors;
}
