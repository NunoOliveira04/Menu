import { describe, expect, it } from 'vitest';
import { resolveSubdomainRewritePath } from '@/lib/routing/subdomain';
import { parseMenuAppearance } from '@/lib/themes/backgrounds';
import { formatCentsToEuroInput, formatPriceCents, parseEuroToCents } from '@/lib/utils/price';
import { moveItemInList, normalizePositions } from '@/lib/utils/reorder';
import { buildPublicMenuUrl } from '@/lib/utils/url';

describe('Utilitários de Preço, Reordenação, Temas e Subdomínios', () => {
  it('converte e formata preços em euros e cêntimos de forma exata', () => {
    expect(parseEuroToCents('6,50')).toBe(650);
    expect(parseEuroToCents('18.5')).toBe(1850);
    expect(parseEuroToCents('0')).toBe(0);
    expect(parseEuroToCents('€ 14,90')).toBe(1490);
    expect(parseEuroToCents('abc')).toBeNull();

    expect(formatCentsToEuroInput(1850)).toBe('18,50');
    expect(formatPriceCents(650)).toBe('6,50 €');
    expect(formatPriceCents(1250)).toBe('12,50 €');
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

  it('converte os estilos antigos (classico, moderno, escuro) em fundo e cor, com fallback seguro', () => {
    expect(parseMenuAppearance({}, 'classico').background).toBe('areia');
    expect(parseMenuAppearance({}, 'moderno').background).toBe('claro');
    expect(parseMenuAppearance({}, 'escuro').background).toBe('escuro');
    expect(parseMenuAppearance({}, 'inexistente').background).toBe('areia');
  });

  it('reescreve subdomínios apenas quando ENABLE_SUBDOMAIN_ROUTING está ativo', () => {
    expect(
      resolveSubdomainRewritePath({
        hostHeader: 'menu-restaurante.menudigital.pt',
        pathname: '/',
        enableSubdomainRouting: false,
        rootDomain: 'menudigital.pt',
      }),
    ).toBeNull();

    expect(
      resolveSubdomainRewritePath({
        hostHeader: 'menu-restaurante.menudigital.pt',
        pathname: '/',
        enableSubdomainRouting: true,
        rootDomain: 'menudigital.pt',
      }),
    ).toBe('/r/menu-restaurante');

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
    expect(buildPublicMenuUrl('menu-restaurante', 'https://ementa.pt/')).toBe(
      'https://ementa.pt/menu-restaurante',
    );
  });
});
