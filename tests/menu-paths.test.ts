import { describe, expect, it } from 'vitest';
import { resolveLegacyAdminRedirect } from '@/lib/routing/admin-paths';
import { extractMenuSlugFromPathname, resolveLegacyMenuRedirect } from '@/lib/routing/menu-paths';

describe('resolveLegacyMenuRedirect', () => {
  it('redireciona /r/<slug> para /<slug>', () => {
    expect(resolveLegacyMenuRedirect('/r/demo')).toBe('/demo');
    expect(resolveLegacyMenuRedirect('/r/demo/')).toBe('/demo');
    expect(resolveLegacyMenuRedirect('/r/tasca-do-largo')).toBe('/tasca-do-largo');
  });

  it('ignora caminhos que não são a carta antiga', () => {
    expect(resolveLegacyMenuRedirect('/r')).toBeNull();
    expect(resolveLegacyMenuRedirect('/r/')).toBeNull();
    expect(resolveLegacyMenuRedirect('/demo')).toBeNull();
    expect(resolveLegacyMenuRedirect('/admin')).toBeNull();
    expect(resolveLegacyMenuRedirect('/r/demo/admin')).toBeNull();
  });

  it('mantém o atalho /r/<slug>/admin -> /admin', () => {
    expect(resolveLegacyAdminRedirect('/r/demo/admin')).toBe('/admin');
    expect(resolveLegacyAdminRedirect('/r/demo/admin/restaurante')).toBe('/admin/restaurante');
  });
});

describe('extractMenuSlugFromPathname', () => {
  it('reconhece a carta em /<slug>', () => {
    expect(extractMenuSlugFromPathname('/demo')).toBe('demo');
    expect(extractMenuSlugFromPathname('/demo/')).toBe('demo');
    expect(extractMenuSlugFromPathname('/Tasca-do-Largo')).toBe('tasca-do-largo');
  });

  it('ignora a raiz, rotas da app, ficheiros e caminhos com mais de um segmento', () => {
    for (const path of [
      '/',
      '/admin',
      '/admin/login',
      '/api',
      '/r',
      '/r/demo',
      '/login',
      '/favicon.ico',
      '/robots.txt',
      '/sitemap.xml',
      '/_next',
      '/demo/extra',
    ]) {
      expect(extractMenuSlugFromPathname(path)).toBeNull();
    }
  });
});
