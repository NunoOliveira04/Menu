import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { dishBadge, restaurantInitials } from '@/lib/menu/hero';
import {
  isProtectedAdminPath,
  isPublicAdminAuthPath,
  isRetiredAdminPath,
  resolveLegacyAdminRedirect,
  resolveSafeAdminNextPath,
} from '@/lib/routing/admin-paths';

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

  it('mostra os três selos (Da casa, Recomendado, Novo) só com o módulo ligado', () => {
    expect(dishBadge('featured', true)).toBe('featured');
    expect(dishBadge('recommended', true)).toBe('recommended');
    expect(dishBadge('new', true)).toBe('new');
    expect(dishBadge('featured', false)).toBeNull();
    expect(dishBadge('outro', true)).toBeNull();
    expect(dishBadge(null, true)).toBeNull();
  });

  it('o botão dos alergénios mostra a contagem e a ficha não fala do regulamento', () => {
    const sheet = readFileSync(
      resolve(process.cwd(), 'src/components/menu/allergen-sheet.tsx'),
      'utf8',
    );
    expect(sheet).toContain('({allergens.length})');
    const i18n = readFileSync(resolve(process.cwd(), 'src/lib/modules/i18n.ts'), 'utf8');
    expect(i18n).not.toMatch(/Regulamento|Regulation|1169/);
  });

  it('o admin deixa escolher fundo, cor e disposição, sem «Publicar» nem foto de capa', () => {
    const form = readFileSync(
      resolve(process.cwd(), 'src/components/dashboard/restaurant-settings-form.tsx'),
      'utf8',
    );
    const picker = readFileSync(
      resolve(process.cwd(), 'src/components/dashboard/appearance-picker.tsx'),
      'utf8',
    );
    expect(form).toContain('<AppearancePicker');
    expect(picker).toContain('name="accent"');
    expect(picker).toContain('name="background"');
    expect(picker).toContain('name="layout"');
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
