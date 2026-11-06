import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8');

/** Devolve o corpo da primeira regra cujo seletor é exatamente `selector`. */
function ruleBody(selector: string): string {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = css.match(new RegExp(`(^|\\n)${escaped}\\s*\\{([^}]*)\\}`));
  return match?.[2] ?? '';
}

describe('Carta pública — legibilidade (ponto 3)', () => {
  it('não corta as descrições dos pratos', () => {
    const desc = ruleBody('.menu-desc');
    expect(desc).not.toBe('');
    expect(desc).not.toMatch(/line-clamp/);
    expect(desc).not.toMatch(/overflow:\s*hidden/);
  });

  it('pratos indisponíveis mantêm as cores e só o preço fica esbatido e riscado', () => {
    expect(css).not.toMatch(/\.menu-dish-unavailable\s*\{[^}]*opacity/);
    const price = ruleBody('.menu-dish-unavailable .menu-price');
    expect(price).toMatch(/text-decoration:\s*line-through/);
    expect(price).toMatch(/color:\s*var\(--color-muted\)/);
  });
});

describe('Carta pública — alinhamento (ponto 4)', () => {
  it('o nome não tem largura máxima e pode partir linha', () => {
    const name = ruleBody('.menu-dish-name');
    expect(name).not.toMatch(/max-width/);
    expect(name).toMatch(/min-width:\s*0/);
  });

  it('o preço nunca parte linha nem encolhe', () => {
    const price = ruleBody('.menu-price');
    expect(price).toMatch(/white-space:\s*nowrap/);
    expect(price).toMatch(/flex:\s*none/);
  });

  it('a miniatura vem antes do texto do prato', () => {
    const view = readFileSync(
      resolve(process.cwd(), 'src/components/menu/public-menu-view.tsx'),
      'utf8',
    );
    const thumbIdx = view.indexOf('className="menu-thumb"');
    const copyIdx = view.indexOf('className="menu-dish-copy"');
    expect(thumbIdx).toBeGreaterThan(-1);
    expect(copyIdx).toBeGreaterThan(-1);
    expect(thumbIdx).toBeLessThan(copyIdx);
  });
});
