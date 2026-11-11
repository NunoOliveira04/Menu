import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockMaybeSingle = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(async () => ({
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: mockMaybeSingle }),
      }),
    }),
  })),
}));

import { generateMetadata } from '@/app/[slug]/page';

describe('Metadados de /[slug] (ponto 7)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://dummy-project.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dummy-anon-key';
  });

  function restaurant(languages: boolean) {
    return {
      name: 'Tasca do Zé',
      slug: 'tasca-do-ze',
      description: null,
      published: true,
      settings: { modules: { languages } },
      translations: {},
    };
  }

  it('o título é só "Nome — Ementa", sem o sufixo do site', async () => {
    mockMaybeSingle.mockResolvedValue({ data: restaurant(false), error: null });
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'tasca-do-ze' }),
      searchParams: Promise.resolve({}),
    });
    expect(metadata.title).toEqual({ absolute: 'Tasca do Zé — Ementa' });
    expect(JSON.stringify(metadata.title)).not.toContain('O Seu Menu');
  });

  it('em inglês o título é "Nome — Menu"', async () => {
    mockMaybeSingle.mockResolvedValue({ data: restaurant(true), error: null });
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'tasca-do-ze' }),
      searchParams: Promise.resolve({ lang: 'en' }),
    });
    expect(metadata.title).toEqual({ absolute: 'Tasca do Zé — Menu' });
  });

  it('canonical e hreflang apontam para /<slug>, sem /r/', async () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://oseumenu.pt';
    mockMaybeSingle.mockResolvedValue({ data: restaurant(true), error: null });
    const metadata = await generateMetadata({
      params: Promise.resolve({ slug: 'tasca-do-ze' }),
      searchParams: Promise.resolve({}),
    });
    expect(metadata.alternates?.canonical).toBe('https://oseumenu.pt/tasca-do-ze');
    expect(metadata.alternates?.languages).toEqual({
      'pt-PT': 'https://oseumenu.pt/tasca-do-ze',
      en: 'https://oseumenu.pt/tasca-do-ze?lang=en',
      'x-default': 'https://oseumenu.pt/tasca-do-ze',
    });
    delete process.env.NEXT_PUBLIC_APP_URL;
  });
});
