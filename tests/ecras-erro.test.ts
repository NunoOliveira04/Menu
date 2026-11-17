import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';

// next/font só funciona no build do Next; nos testes basta devolver a classe.
vi.mock('next/font/google', () => ({
  Young_Serif: () => ({ variable: 'font-landing-display', className: '', style: {} }),
  Atkinson_Hyperlegible_Next: () => ({ variable: 'font-landing-body', className: '', style: {} }),
}));

import RestaurantNotFound from '@/app/[slug]/not-found';
import ErrorPage from '@/app/error';
import NotFound from '@/app/not-found';

const text = (html: string) => html.replace(/<[^>]+>/g, ' ');

describe('Ecrãs de erro com a marca, em português', () => {
  it('carta não encontrada', () => {
    const html = renderToStaticMarkup(createElement(RestaurantNotFound));
    expect(text(html)).toContain('Não encontrámos esta carta');
    expect(html).toContain('#B4412A');
    expect(html).not.toMatch(/#8C3B2B|#FAF6F0|Ementa indisponível/);
  });

  it('página 404 geral com ligação para a página inicial', () => {
    const html = renderToStaticMarkup(createElement(NotFound));
    expect(text(html)).toContain('Esta página não existe');
    expect(html).toMatch(/<a[^>]*href="\/"[^>]*>Ir para a página inicial<\/a>/);
    expect(html).not.toMatch(/could not be found/i);
  });

  it('página de erro com «Tentar outra vez»', () => {
    const html = renderToStaticMarkup(
      createElement(ErrorPage, { error: new Error('teste'), reset: () => {} }),
    );
    expect(text(html)).toContain('Não foi possível abrir esta página');
    expect(text(html)).toContain('Tentar outra vez');
  });
});
