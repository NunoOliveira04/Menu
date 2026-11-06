import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { showsHouseBadge } from '@/lib/menu/hero';
import {
  isProtectedAdminPath,
  isPublicAdminAuthPath,
  isRetiredAdminPath,
  resolveLegacyAdminRedirect,
  resolveSafeAdminNextPath,
} from '@/lib/routing/admin-paths';
import { MENU_THEMES, resolveMenuTheme } from '@/lib/themes/registry';

describe('Grupo 3 — rotas /admin, hero e carta sem bloco de destaques', () => {
  it('mapeia rotas legadas para /admin e protege tudo excepto login', () => {
    expect(resolveLegacyAdminRedirect('/dashboard')).toBe('/admin');
    expect(resolveLegacyAdminRedirect('/dashboard/restaurante')).toBe('/admin/restaurante');
    expect(resolveLegacyAdminRedirect('/login')).toBe('/admin/login');
    expect(resolveLegacyAdminRedirect('/registar')).toBeNull();
    expect(resolveLegacyAdminRedirect('/onboarding')).toBeNull();
    expect(resolveLegacyAdminRedirect('/r/menu-restaurante')).toBeNull();

    expect(isProtectedAdminPath('/admin')).toBe(true);
    expect(isProtectedAdminPath('/admin/restaurante')).toBe(true);
    expect(isProtectedAdminPath('/admin/onboarding')).toBe(false);
    expect(isProtectedAdminPath('/admin/onboarding/extra')).toBe(false);
    expect(isProtectedAdminPath('/admin/login')).toBe(false);
    expect(isProtectedAdminPath('/admin/registar')).toBe(false);
    expect(isProtectedAdminPath('/admin/registar/passo-2')).toBe(false);
    expect(isPublicAdminAuthPath('/admin/login')).toBe(true);
    expect(isPublicAdminAuthPath('/admin/registar')).toBe(false);
    expect(isPublicAdminAuthPath('/admin')).toBe(false);

    expect(isRetiredAdminPath('/admin/registar')).toBe(true);
    expect(isRetiredAdminPath('/admin/registar/x')).toBe(true);
    expect(isRetiredAdminPath('/admin/onboarding')).toBe(true);
    expect(isRetiredAdminPath('/admin/onboarding/x')).toBe(true);
    expect(isRetiredAdminPath('/admin')).toBe(false);
    expect(isRetiredAdminPath('/admin/restaurante')).toBe(false);
  });

  it('resolveSafeAdminNextPath aceita /admin/* seguro e rejeita open-redirects', () => {
    expect(resolveSafeAdminNextPath('/admin/restaurante')).toBe('/admin/restaurante');
    expect(resolveSafeAdminNextPath('/admin')).toBe('/admin');
    expect(resolveSafeAdminNextPath('https://evil.com')).toBe('/admin');
    expect(resolveSafeAdminNextPath('//evil.com')).toBe('/admin');
    expect(resolveSafeAdminNextPath('/\\evil.com')).toBe('/admin');
    expect(resolveSafeAdminNextPath('/r/x')).toBe('/admin');
    expect(resolveSafeAdminNextPath('/admin/login')).toBe('/admin');
    expect(resolveSafeAdminNextPath('/admin/registar')).toBe('/admin');
    expect(resolveSafeAdminNextPath('/admin/onboarding')).toBe('/admin');
    expect(resolveSafeAdminNextPath('/admin/onboarding/x')).toBe('/admin');
    expect(resolveSafeAdminNextPath(null)).toBe('/admin');
  });

  it('a capa usa a foto escolhida pelo dono (não um prato) e há cabeçalho tipográfico sem foto', () => {
    const view = readFileSync(
      resolve(process.cwd(), 'src/components/menu/public-menu-view.tsx'),
      'utf8',
    );
    expect(view).not.toContain('selectMenuHero');
    expect(view).toContain('coverPhotoUrl');
    expect(view).toContain('menu-hero-plain');

    const css = readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf8');
    const heroRule = css.match(/\n\.menu-hero \{([^}]*)\}/)?.[1] ?? '';
    expect(heroRule).toMatch(/min-height:\s*max\(27vh/);
    expect(heroRule).toMatch(/background:\s*#1f3a5f/i);
    expect(heroRule).not.toMatch(/35vh/);
  });

  it('só mostra «Da casa» no selo featured', () => {
    expect(showsHouseBadge('featured', true)).toBe(true);
    expect(showsHouseBadge('recommended', true)).toBe(false);
    expect(showsHouseBadge('featured', false)).toBe(false);
  });

  it('o tema clássico é Clássico com tokens de azulejo e tijolo', () => {
    const classic = resolveMenuTheme('classico');
    expect(classic.label).toBe('Clássico');
    expect(classic.ornament).toBe('azulejo');
    expect(classic.cssVars['--color-bg']).toBe('#F5EFE6');
    expect(classic.cssVars['--color-text']).toBe('#2B2B2B');
    expect(classic.cssVars['--color-azulejo']).toBe('#1F3A5F');
    expect(classic.cssVars['--color-accent']).toBe('#B5452B');
    expect(classic.cssVars['--color-card']).toBe('#FFFFFF');
    expect(classic.cssVars['--color-muted']).toBe('#6B6B6B');
    expect(MENU_THEMES.moderno.ornament).toBe('rule');
    expect(MENU_THEMES.escuro.ornament).toBe('rule');
    expect(resolveMenuTheme('desconhecido').id).toBe('classico');
  });

  it('o menu público não tem secção Em Destaque e a seed só usa fotos de comida', () => {
    const view = readFileSync(
      resolve(process.cwd(), 'src/components/menu/public-menu-view.tsx'),
      'utf8',
    );
    expect(view).not.toContain('sec-destaques');
    expect(view).not.toContain('highlightsSectionTitle');
    expect(view).not.toContain('Em Destaque');

    const seed = readFileSync(resolve(process.cwd(), 'supabase/seed.sql'), 'utf8');
    expect(seed).not.toContain('picsum.photos');
    expect(seed).toContain('images.unsplash.com');
    expect(seed).toContain('images.pexels.com');
  });
});
