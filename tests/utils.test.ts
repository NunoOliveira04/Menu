import { describe, expect, it } from 'vitest';
import { resolveSubdomainRewritePath } from '@/lib/routing/subdomain';
import { resolveMenuTheme } from '@/lib/themes/registry';
import { formatCentsToEuroInput, formatPriceCents, parseEuroToCents } from '@/lib/utils/price';
import { moveItemInList, normalizePositions } from '@/lib/utils/reorder';
import { slugifyRestaurantName } from '@/lib/utils/slug';
import { buildPublicMenuUrl } from '@/lib/utils/url';

describe('Utilitários de Slug, Preço, Reordenação, Temas e Subdomínios', () => {
  it('gera slugs limpos a partir de nomes em português com acentos', () => {
    expect(slugifyRestaurantName('Tasca do Castelo — Guimarães!')).toBe(
      'tasca-do-castelo-guimaraes',
    );
    expect(slugifyRestaurantName('  São João & Cia.  ')).toBe('sao-joao-cia');
  });

  it('converte e formata preços em euros e cêntimos de forma exata', () => {
    expect(parseEuroToCents('6,50')).toBe(650);
    expect(parseEuroToCents('18.5')).toBe(1850);
    expect(parseEuroToCents('0')).toBe(0);
    expect(parseEuroToCents('€ 14,90')).toBe(1490);
    expect(parseEuroToCents('abc')).toBeNull();

    expect(formatCentsToEuroInput(1850)).toBe('18,50');
    expect(formatPriceCents(650)).toContain('6,50');
  });

  it('reordena categorias/pratos para cima e para baixo mantendo posições contíguas', () => {
    const items = [
      { id: 'a', position: 0 },
      { id: 'b', position: 5 },
      { id: 'c', position: 9 },
    ];

    const movedUp = moveItemInList(items, 'b', 'up');
    expect(movedUp.map((i) => i.id)).toEqual(['b', 'a', 'c']);
    expect(movedUp.map((i) => i.position)).toEqual([0, 1, 2]);

    const movedDownEdge = moveItemInList(movedUp, 'c', 'down');
    expect(movedDownEdge.map((i) => i.id)).toEqual(['b', 'a', 'c']);

    expect(normalizePositions(items).map((i) => i.position)).toEqual([0, 1, 2]);
  });

  it('resolve temas classico, moderno e escuro com fallback seguro para classico', () => {
    expect(resolveMenuTheme('classico').id).toBe('classico');
    expect(resolveMenuTheme('moderno').id).toBe('moderno');
    expect(resolveMenuTheme('escuro').id).toBe('escuro');
    expect(resolveMenuTheme('inexistente').id).toBe('classico');
  });

  it('reescreve subdomínios apenas quando ENABLE_SUBDOMAIN_ROUTING está ativo', () => {
    expect(
      resolveSubdomainRewritePath({
        hostHeader: 'tasca-do-castelo.menudigital.pt',
        pathname: '/',
        enableSubdomainRouting: false,
        rootDomain: 'menudigital.pt',
      }),
    ).toBeNull();

    expect(
      resolveSubdomainRewritePath({
        hostHeader: 'tasca-do-castelo.menudigital.pt',
        pathname: '/',
        enableSubdomainRouting: true,
        rootDomain: 'menudigital.pt',
      }),
    ).toBe('/r/tasca-do-castelo');

    expect(
      resolveSubdomainRewritePath({
        hostHeader: 'www.menudigital.pt',
        pathname: '/',
        enableSubdomainRouting: true,
        rootDomain: 'menudigital.pt',
      }),
    ).toBeNull();

    expect(
      resolveSubdomainRewritePath({
        hostHeader: 'menudigital.pt',
        pathname: '/dashboard',
        enableSubdomainRouting: true,
        rootDomain: 'menudigital.pt',
      }),
    ).toBeNull();
  });

  it('constrói URL público consistente', () => {
    expect(buildPublicMenuUrl('tasca-do-castelo', 'https://ementa.pt/')).toBe(
      'https://ementa.pt/r/tasca-do-castelo',
    );
  });
});
