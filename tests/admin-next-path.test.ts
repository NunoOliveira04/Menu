import { describe, expect, it } from 'vitest';
import {
  normalizeMistypedAdminPath,
  resolveLegacyAdminRedirect,
  resolveSafeAdminNextPath,
} from '@/lib/routing/admin-paths';

describe('resolveSafeAdminNextPath (ponto 5)', () => {
  it.each([
    ['/admin', '/admin'],
    ['/admin/', '/admin/'],
    ['/admin/restaurante', '/admin/restaurante'],
    ['/admin/restaurante?tab=horario', '/admin/restaurante?tab=horario'],
    ['/admin/restaurante#horario', '/admin/restaurante#horario'],
    ['  /admin/restaurante  ', '/admin/restaurante'],
  ])('aceita %j', (input, expected) => {
    expect(resolveSafeAdminNextPath(input)).toBe(expected);
  });

  it.each([
    // Prefixos parecidos com /admin
    '/adminfoo',
    '/admin-panel',
    '/administrador',
    '/admin?next=//evil.com',
    '/admin#x',
    // Fora de /admin
    '/',
    '/r/menu-restaurante',
    'admin',
    'admin/restaurante',
    '',
    '   ',
    // URLs relativos ao protocolo e barras invertidas
    '//evil.com',
    '//evil.com/admin',
    '/admin//evil.com',
    '/admin/x//y',
    '\\\\evil.com',
    '/\\evil.com',
    '/admin\\evil.com',
    '/admin/\\evil.com',
    // Esquemas
    'https://evil.com',
    'https://evil.com/admin',
    'http:/admin',
    'javascript:alert(1)',
    'JaVaScRiPt:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    '/admin/javascript:alert(1)',
    // Espaços e caracteres de controlo (os browsers removem \t e \n dos URLs)
    '/admin/\t/evil.com',
    '/admin/\n/evil.com',
    '/admin/\r/evil.com',
    '/admin/ x',
    '/admin/\u0000',
    // Segmentos . e ..
    '/admin/..',
    '/admin/../r/x',
    '/admin/./restaurante',
    '/admin/%2e%2e/r/x',
    '/admin/%2E%2E',
    '/admin/.%2e/r/x',
    // Rotas bloqueadas após login
    '/admin/login',
    '/admin/login/x',
    '/admin/registar',
    '/admin/registar/passo-2',
    '/admin/onboarding',
    '/admin/onboarding/x',
  ])('rejeita %j', (input) => {
    expect(resolveSafeAdminNextPath(input)).toBe('/admin');
  });

  it.each([null, undefined, 42, {}, ['/admin/restaurante']])(
    'rejeita valores que não são texto (%j)',
    (input) => {
      expect(resolveSafeAdminNextPath(input)).toBe('/admin');
    },
  );
});

describe('Endereços do admin mal escritos (maiúsculas, espaço ou ponto no fim)', () => {
  it.each([
    ['/Admin', '/admin'],
    ['/ADMIN', '/admin'],
    ['/admin%20', '/admin'],
    ['/admin.', '/admin'],
    ['/Admin/', '/admin'],
    ['/Admin/Restaurante', '/admin/restaurante'],
    ['/admin/Login', '/admin/login'],
  ])('%s redireciona para %s', (input, expected) => {
    expect(normalizeMistypedAdminPath(input)).toBe(expected);
    expect(resolveLegacyAdminRedirect(input)).toBe(expected);
  });

  it.each([
    '/admin',
    '/admin/restaurante',
    '/admin/login',
    '/r/menu-restaurante',
    '/',
    '/administrador',
    '/Admin%ZZ',
    '/Admin/<script>',
  ])('não mexe em %s', (input) => {
    expect(normalizeMistypedAdminPath(input)).toBeNull();
  });
});
