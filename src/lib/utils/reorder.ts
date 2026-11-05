export interface PositionedItem {
  id: string;
  position: number;
}

/**
 * Reordena uma lista ordenada movendo o item em direção 'up' ou 'down'
 * e devolve uma nova lista com posições contíguas (0..n-1).
 */
export function moveItemInList<T extends PositionedItem>(
  items: readonly T[],
  itemId: string,
  direction: 'up' | 'down',
): T[] {
  const sorted = [...items].sort((a, b) => a.position - b.position);
  const currentIndex = sorted.findIndex((item) => item.id === itemId);

  if (currentIndex === -1) {
    return sorted.map((item, idx) => ({ ...item, position: idx }));
  }

  const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
  if (targetIndex < 0 || targetIndex >= sorted.length) {
    return sorted.map((item, idx) => ({ ...item, position: idx }));
  }

  const reordered = [...sorted];
  const currentItem = reordered[currentIndex];
  const targetItem = reordered[targetIndex];
  if (!currentItem || !targetItem) {
    return sorted.map((item, idx) => ({ ...item, position: idx }));
  }

  reordered[currentIndex] = targetItem;
  reordered[targetIndex] = currentItem;

  return reordered.map((item, idx) => ({
    ...item,
    position: idx,
  }));
}

export function normalizePositions<T extends PositionedItem>(items: readonly T[]): T[] {
  return [...items]
    .sort((a, b) => a.position - b.position)
    .map((item, idx) => ({ ...item, position: idx }));
}
