import { describe, expect, it } from 'vitest';
import { resolveLegacyAdminRedirect } from '@/lib/routing/admin-paths';
import { resolveLegacyMenuRedirect } from '@/lib/routing/menu-paths';

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
