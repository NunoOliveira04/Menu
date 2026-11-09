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

  it('o tema do piloto (id classico) tem o visual moderno e limpo', () => {
    const theme = resolveMenuTheme('classico');
    expect(theme.label).toBe('Essencial');
    expect(theme.ornament).toBe('none');
    expect(theme.cssVars['--color-bg']).toBe('#F6F6F3');
    expect(theme.cssVars['--color-text']).toBe('#18181B');
    expect(theme.cssVars['--color-card']).toBe('#FFFFFF');
    expect(theme.cssVars['--color-muted']).toBe('#5F5F67');
    expect(theme.cssVars['--font-display']).toContain('--font-sans');
    // Todos os temas definem os tokens novos usados pelo CSS
    for (const t of Object.values(MENU_THEMES)) {
      expect(t.cssVars['--color-border']).toBeTruthy();
      expect(t.cssVars['--color-border-strong']).toBeTruthy();
      expect(t.cssVars['--color-accent-text']).toBeTruthy();
    }
    expect(MENU_THEMES.moderno.ornament).toBe('rule');
    expect(MENU_THEMES.escuro.ornament).toBe('rule');
    expect(resolveMenuTheme('desconhecido').id).toBe('classico');
  });

  it('no piloto o dono só vê o estilo clássico, sem apagar os outros temas (ponto 8)', () => {
    expect(SELECTABLE_STYLES).toEqual(['classico']);
    // O código dos outros temas mantém-se e a carta continua a sabê-los mostrar.
    expect(resolveMenuTheme('moderno').id).toBe('moderno');
    expect(resolveMenuTheme('escuro').id).toBe('escuro');

    // Com um só estilo disponível, o admin já não mostra a escolha de tema nem «Publicar».
    const form = readFileSync(
      resolve(process.cwd(), 'src/components/dashboard/restaurant-settings-form.tsx'),
      'utf8',
    );
    expect(form).toContain('name="style" value="classico"');
    expect(form).not.toMatch(/\['classico',\s*'moderno',\s*'escuro'\]/);
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
