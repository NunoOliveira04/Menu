import { describe, expect, it } from 'vitest';
import { buildCategoryAnchors, slugifyAnchor } from '@/lib/menu/anchors';
import { DRAG_DISMISS_DISTANCE_PX, shouldDismissDrag } from '@/components/menu/use-drag-to-dismiss';
import { buildCompressedFileName, LOGO_COMPRESS_OPTIONS } from '@/lib/images/compress-photo';

describe('Âncoras legíveis das categorias', () => {
  it('gera slugs sem acentos nem símbolos', () => {
    expect(slugifyAnchor('Peixe & Bacalhau')).toBe('peixe-bacalhau');
    expect(slugifyAnchor('Sopas & Tachos Quentes')).toBe('sopas-tachos-quentes');
    expect(slugifyAnchor('Sobremesas Caseiras 🍮')).toBe('sobremesas-caseiras');
    expect(slugifyAnchor('Ç')).toBe('c');
  });

  it('âncoras únicas, sem UUIDs, mesmo com nomes repetidos ou vazios', () => {
    const anchors = buildCategoryAnchors([
      { id: '22222222-2222-4222-8222-222222222201', name: 'Petiscos & Entradas' },
      { id: '22222222-2222-4222-8222-222222222202', name: 'Petiscos & Entradas' },
      { id: '22222222-2222-4222-8222-222222222203', name: '🍷' },
    ]);
    expect([...anchors.values()]).toEqual(['petiscos-entradas', 'petiscos-entradas-2', 'seccao']);
    for (const anchor of anchors.values()) {
      expect(anchor).not.toMatch(/[0-9a-f]{8}-[0-9a-f]{4}/);
    }
  });

  it('a navegação de categorias não acrescenta # ao endereço', async () => {
    const { readFileSync } = await import('node:fs');
    const nav = readFileSync('src/components/menu/category-nav.tsx', 'utf8');
    expect(nav).toContain('event.preventDefault()');
    expect(nav).toContain('scrollIntoView');
    expect(nav).not.toContain('cat-');
  });
});

describe('Arrastar para baixo para fechar', () => {
  it('fecha com um arrasto longo', () => {
    expect(shouldDismissDrag(DRAG_DISMISS_DISTANCE_PX, 800)).toBe(true);
    expect(shouldDismissDrag(200, 1500)).toBe(true);
  });

  it('fecha com um gesto curto mas rápido', () => {
    expect(shouldDismissDrag(40, 50)).toBe(true);
  });

  it('não fecha com toques ou arrastos lentos e curtos', () => {
    expect(shouldDismissDrag(0, 100)).toBe(false);
    expect(shouldDismissDrag(10, 10)).toBe(false);
    expect(shouldDismissDrag(50, 400)).toBe(false);
  });
});

describe('Logotipo', () => {
  it('mantém a transparência e chega com 512 px', () => {
    expect(LOGO_COMPRESS_OPTIONS).toEqual({ maxDimension: 512, keepTransparency: true });
    expect(buildCompressedFileName('logo.svg', 'image/png')).toBe('logo.png');
  });
});
