import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { restaurantInitials, showsHouseBadge } from '@/lib/menu/hero';
import {
  isProtectedAdminPath,
  isPublicAdminAuthPath,
  isRetiredAdminPath,
  resolveLegacyAdminRedirect,
  resolveSafeAdminNextPath,
} from '@/lib/routing/admin-paths';
import { MENU_THEMES, SELECTABLE_STYLES, resolveMenuTheme } from '@/lib/themes/registry';

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

  it('o cabeçalho é simples: logotipo (ou iniciais), nome e descrição — sem capa nem etiquetas', () => {
    const view = readFileSync(
      resolve(process.cwd(), 'src/components/menu/public-menu-view.tsx'),
      'utf8',
    );
    const header = view.slice(view.indexOf('<header'), view.indexOf('</header>'));
    expect(header).toContain('logoUrl');
    expect(header).toContain('menu-logo-initials');
    expect(header).toContain('menu-header-title');
    // Sem foto de capa, sem localização e sem «Aberto/Encerrado» no topo.
    expect(view).not.toContain('coverPhotoUrl');
    expect(header).not.toContain('restaurant.location');
    expect(header).not.toContain('openNowBadge');
    expect(header).not.toContain('closedNowBadge');
    expect(view).not.toContain('selectMenuHero');

    expect(restaurantInitials('Menu Restaurante')).toBe('MR');
    expect(restaurantInitials('  tasca  ')).toBe('T');
    expect(restaurantInitials('Casa do Zé Grande')).toBe('CD');
    expect(restaurantInitials('')).toBe('?');
  });

  it('só mostra «Da casa» no selo featured', () => {
    expect(showsHouseBadge('featured', true)).toBe(true);
    expect(showsHouseBadge('recommended', true)).toBe(false);
    expect(showsHouseBadge('featured', false)).toBe(false);
  });

  it('há três paletas («Cores») com nomes simples e todos os tokens usados pelo CSS', () => {
    expect(SELECTABLE_STYLES).toEqual(['classico', 'moderno', 'escuro']);
    expect(MENU_THEMES.classico.label).toBe('Quente');
    expect(MENU_THEMES.moderno.label).toBe('Viva');
    expect(MENU_THEMES.escuro.label).toBe('Noite');
    expect(resolveMenuTheme('desconhecido').id).toBe('classico');

    const requiredTokens = [
      '--color-bg',
      '--color-card',
      '--color-text',
      '--color-muted',
      '--color-accent',
      '--color-border',
      '--color-border-strong',
      '--color-accent-text',
      '--nav-bg',
      '--pill-fg',
      '--pill-active-bg',
      '--pill-active-fg',
      '--section-fg',
      '--section-muted',
      '--price-bg',
      '--price-fg',
      '--card-shadow',
    ] as const;
    for (const theme of Object.values(MENU_THEMES)) {
      expect(theme.ornament).toBe('none');
      for (const token of requiredTokens) {
        expect(theme.cssVars[token], `${theme.id} ${token}`).toBeTruthy();
      }
    }
  });

  it('o admin deixa escolher cores e fundo, sem «Publicar» nem foto de capa', () => {
    const form = readFileSync(
      resolve(process.cwd(), 'src/components/dashboard/restaurant-settings-form.tsx'),
      'utf8',
    );
    const picker = readFileSync(
      resolve(process.cwd(), 'src/components/dashboard/appearance-picker.tsx'),
      'utf8',
    );
    expect(form).toContain('<AppearancePicker');
    expect(picker).toContain('name="style"');
    expect(picker).toContain('name="background"');
    expect(form).not.toContain('name="published"');
    expect(form).not.toContain('coverPhoto');
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
