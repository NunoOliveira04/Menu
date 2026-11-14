import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockGetClaims, mockFrom, mockCreateServerClient } = vi.hoisted(() => {
  const getClaims = vi.fn();
  const from = vi.fn();
  return {
    mockGetClaims: getClaims,
    mockFrom: from,
    mockCreateServerClient: vi.fn(() => ({
      auth: { getClaims, getUser: vi.fn(), signOut: vi.fn() },
      from,
    })),
  };
});

vi.mock('@supabase/ssr', () => ({
  createServerClient: mockCreateServerClient,
}));

import { extractMenuSlugFromPathname } from '@/lib/routing/menu-paths';
import { updateSession } from '@/lib/supabase/middleware';

function restaurantSettings(languages: boolean) {
  return () => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({
          data: { settings: { modules: { languages } } },
          error: null,
        }),
      }),
    }),
  });
}

describe('Página de apresentação na raiz e rotas existentes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://dummy-project.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'dummy-anon-key';
    mockGetClaims.mockResolvedValue({ data: { claims: null } });
  });

  it('/ é servida sem redirect e sem falar com o Supabase', async () => {
    const res = await updateSession(new NextRequest('http://localhost:3000/'));
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
    expect(mockCreateServerClient).not.toHaveBeenCalled();
    expect(mockGetClaims).not.toHaveBeenCalled();
  });

  it('a página de apresentação e a carta continuam em ficheiros separados', () => {
    const root = resolve(__dirname, '..');
    expect(existsSync(resolve(root, 'src/app/page.tsx'))).toBe(true);
    expect(existsSync(resolve(root, 'src/app/[slug]/page.tsx'))).toBe(true);
    expect(existsSync(resolve(root, 'src/app/[slug]/not-found.tsx'))).toBe(true);
    expect(existsSync(resolve(root, 'src/app/admin/(panel)/page.tsx'))).toBe(true);
    expect(existsSync(resolve(root, 'src/app/admin/login/page.tsx'))).toBe(true);
  });

  it('/demo e /<slug> continuam a ser cartas (e / não é)', () => {
    expect(extractMenuSlugFromPathname('/demo')).toBe('demo');
    expect(extractMenuSlugFromPathname('/tasca-do-largo')).toBe('tasca-do-largo');
    expect(extractMenuSlugFromPathname('/')).toBeNull();
  });

  it('/demo é servida sem redirect, em português por omissão', async () => {
    const res = await updateSession(new NextRequest('http://localhost:3000/demo'));
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
    expect(res.headers.get('x-middleware-request-x-menu-html-lang')).toBe('pt-PT');
  });

  it('/demo?lang=en continua a pôr <html lang="en"> quando o inglês está ligado', async () => {
    mockFrom.mockImplementationOnce(restaurantSettings(true));
    const res = await updateSession(new NextRequest('http://localhost:3000/demo?lang=en'));
    expect(res.status).toBe(200);
    expect(res.headers.get('x-middleware-request-x-menu-html-lang')).toBe('en');
  });

  it('/<slug> de outro restaurante continua a ser servido', async () => {
    const res = await updateSession(new NextRequest('http://localhost:3000/tasca-do-largo'));
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });

  it('/r/<slug> continua a redirecionar (308) para /<slug> com a query', async () => {
    const res = await updateSession(new NextRequest('http://localhost:3000/r/demo?lang=en'));
    expect(res.status).toBe(308);
    expect(res.headers.get('location')).toBe('http://localhost:3000/demo?lang=en');
  });

  it('/r/<slug>/admin continua a levar a /admin', async () => {
    const res = await updateSession(new NextRequest('http://localhost:3000/r/demo/admin'));
    expect(res.status).toBe(308);
    expect(res.headers.get('location')).toBe('http://localhost:3000/admin');
  });

  it('/admin sem sessão continua a mandar para o login', async () => {
    const res = await updateSession(new NextRequest('http://localhost:3000/admin'));
    expect(res.status).toBe(307);
    expect(res.headers.get('location')).toBe('http://localhost:3000/admin/login?next=%2Fadmin');
  });

  it('/admin com sessão continua a abrir o painel', async () => {
    mockGetClaims.mockResolvedValue({ data: { claims: { sub: 'user-1' } } });
    const res = await updateSession(new NextRequest('http://localhost:3000/admin'));
    expect(res.status).toBe(200);
    expect(res.headers.get('location')).toBeNull();
  });
});
