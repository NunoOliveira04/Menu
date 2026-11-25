import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockSelect } = vi.hoisted(() => ({ mockSelect: vi.fn() }));
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    from: () => ({
      select: () => ({ eq: () => ({ neq: mockSelect }) }),
    }),
  }),
}));

import robots from '@/app/robots';
import sitemap from '@/app/sitemap';
import { jsonLdScript, restaurantMenuJsonLd } from '@/lib/seo/json-ld';
import { AI_CRAWLERS } from '@/lib/seo/site';

describe('SEO: robots.txt e sitemap.xml', () => {
  beforeEach(() => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://oseumenu.pt';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://dummy.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dummy';
  });

  it('robots.txt deixa entrar motores de busca e IAs, fecha o painel e aponta o sitemap', () => {
    const result = robots();
    const rules = Array.isArray(result.rules) ? result.rules : [result.rules];
    expect(rules[0]).toMatchObject({ userAgent: '*', allow: '/' });
    for (const rule of rules) expect(rule.disallow).toContain('/admin');
    const aiRule = rules.find((rule) => Array.isArray(rule.userAgent));
    for (const bot of ['GPTBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended']) {
      expect(AI_CRAWLERS).toContain(bot);
      expect(aiRule?.userAgent).toContain(bot);
    }
    expect(result.sitemap).toBe('https://oseumenu.pt/sitemap.xml');
  });

  it('sitemap tem a página principal e as cartas publicadas (sem a demo)', async () => {
    mockSelect.mockResolvedValue({
      data: [{ slug: 'tasca-do-largo', updated_at: '2026-11-20T10:00:00Z' }],
    });
    const entries = await sitemap();
    expect(entries.map((entry) => entry.url)).toEqual([
      'https://oseumenu.pt/',
      'https://oseumenu.pt/tasca-do-largo',
    ]);
  });

  it('sitemap continua a funcionar se a base de dados falhar', async () => {
    mockSelect.mockRejectedValue(new Error('sem rede'));
    const entries = await sitemap();
    expect(entries.map((entry) => entry.url)).toEqual(['https://oseumenu.pt/']);
  });
});

describe('SEO: dados estruturados da carta (Restaurant + Menu)', () => {
  const data = restaurantMenuJsonLd({
    restaurant: { name: 'Tasca do Largo', description: 'Petiscos.' },
    url: 'https://oseumenu.pt/tasca-do-largo',
    logoUrl: null,
    categories: [
      { id: 'c1', name: 'Petiscos', description: null },
      { id: 'c2', name: 'Vazia', description: null },
    ],
    dishes: [
      {
        category_id: 'c1',
        name: 'Gambas ao Alho',
        description: 'Com pão.',
        price_cents: 950,
        available: false,
        photo_url: 'https://images.pexels.com/x.jpg',
      },
    ],
    weeklySchedule: [
      { dayOfWeek: 0, closed: true, slots: [] },
      { dayOfWeek: 1, closed: false, slots: [{ open: '12:00', close: '15:00' }] },
    ],
  });

  it('descreve o restaurante, o menu, os preços em euros e o horário', () => {
    expect(data).toMatchObject({ '@type': 'Restaurant', name: 'Tasca do Largo' });
    const menu = data.hasMenu as { hasMenuSection: { name: string; hasMenuItem: unknown[] }[] };
    // Categorias sem pratos ficam de fora.
    expect(menu.hasMenuSection.map((section) => section.name)).toEqual(['Petiscos']);
    expect(menu.hasMenuSection[0]?.hasMenuItem[0]).toMatchObject({
      '@type': 'MenuItem',
      name: 'Gambas ao Alho',
      offers: {
        price: '9.50',
        priceCurrency: 'EUR',
        availability: 'https://schema.org/OutOfStock',
      },
    });
    expect(data.openingHoursSpecification).toEqual([
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'https://schema.org/Tuesday',
        opens: '12:00',
        closes: '15:00',
      },
    ]);
  });

  it('o JSON-LD não deixa fechar a tag <script> a partir dos dados', () => {
    const script = jsonLdScript({ name: '</script><script>alert(1)</script>' });
    expect(script).not.toContain('</script>');
  });
});

describe('SEO: llms.txt e a demo', () => {
  it('llms.txt resume o produto para as IAs', () => {
    const text = readFileSync(resolve(__dirname, '..', 'public', 'llms.txt'), 'utf8');
    expect(text.startsWith('# O Seu Menu')).toBe(true);
    expect(text).toContain('https://oseumenu.pt');
    expect(text).toMatch(/QR code/);
    expect(text).not.toMatch(/€\s*\d|\d+\s*€/); // sem preços inventados
  });

  it('a carta de exemplo (demo) fica fora do Google', () => {
    const page = readFileSync(resolve(__dirname, '..', 'src/app/[slug]/page.tsx'), 'utf8');
    expect(page).toContain('restaurant.slug !== DEMO_SLUG');
    expect(page).toContain('index: false, follow: true');
  });
});
