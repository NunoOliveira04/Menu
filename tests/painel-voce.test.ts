import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { DISH_HIGHLIGHTS } from '@/lib/modules/highlights';
import { MENU_UI_STRINGS } from '@/lib/modules/i18n';

// Ficheiros com texto que o dono vê no painel, no login e nas mensagens de erro.
const FILES = [
  'src/app/admin/login/page.tsx',
  'src/app/admin/(panel)/layout.tsx',
  'src/app/admin/(panel)/page.tsx',
  'src/app/admin/(panel)/restaurante/page.tsx',
  'src/components/dashboard/admin-tabs.tsx',
  'src/components/dashboard/menu-manager.tsx',
  'src/components/dashboard/qr-code-card.tsx',
  'src/components/dashboard/restaurant-settings-form.tsx',
  'src/app/actions/auth.ts',
  'src/app/actions/categories.ts',
  'src/app/actions/dishes.ts',
  'src/app/actions/restaurant.ts',
  'src/lib/validations/schemas.ts',
  'src/lib/images/compress-photo.ts',
];

const read = (file: string) => readFileSync(resolve(__dirname, '..', file), 'utf8');

describe('Painel do restaurante: tratamento por «você» e a palavra «carta»', () => {
  it.each(FILES)('%s não usa formas de «tu»', (file) => {
    const source = read(file);
    expect(source).not.toMatch(
      /\b(Entra na|tua conta|Organiza as|Aponta a|Clica em|Carrega em|Escolhe (o|um|uma|outro)|Liga (só|os)|Marca em|Verifica os|Tenta (novamente|outra|uma)|Usa (apenas|um|uma)|Introduz um|Indica (o|pelo)|Seleciona uma|Podes|precisas|abres|Não tens)\b/,
    );
  });

  it('usa «carta» e não «ementa» / «menu» nos textos do painel', () => {
    expect(read('src/components/dashboard/admin-tabs.tsx')).toContain("label: 'Carta'");
    const qr = read('src/components/dashboard/qr-code-card.tsx');
    expect(qr).toContain('Ver a carta');
    expect(qr).not.toMatch(/Ver menu|o menu de|O menu ainda/);
    expect(read('src/app/admin/(panel)/layout.tsx')).toContain('Ver a carta');
  });

  it('o QR code fala de imprimir, não de formatos de ficheiro', () => {
    const qr = read('src/components/dashboard/qr-code-card.tsx');
    expect(qr).toContain('Descarregar para imprimir');
    expect(qr).toContain('Ficheiro para a gráfica (SVG)');
    expect(qr).not.toMatch(/>\s*PNG\s*</);
  });

  it('os selos têm o mesmo nome no painel e na carta', () => {
    const labels = Object.fromEntries(DISH_HIGHLIGHTS.map((h) => [h.code, h.label]));
    for (const locale of ['pt', 'en'] as const) {
      const ui = MENU_UI_STRINGS[locale];
      expect(labels.featured?.[locale]).toBe(ui.houseBadge);
      expect(labels.recommended?.[locale]).toBe(ui.recommendedBadge);
      expect(labels.new?.[locale]).toBe(ui.newBadge);
    }
  });
});
