import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import tailwindConfig from '../tailwind.config';

const ROOT = resolve(__dirname, '..');
function filesIn(dir: string): string[] {
  return readdirSync(join(ROOT, dir)).flatMap((name) => {
    const rel = join(dir, name);
    return statSync(join(ROOT, rel)).isDirectory()
      ? filesIn(rel)
      : rel.endsWith('.tsx')
        ? [rel]
        : [];
  });
}
const ADMIN_FILES = [
  ...filesIn('src/app/admin'),
  ...filesIn('src/components/dashboard'),
  ...filesIn('src/components/auth'),
];

/** Contraste WCAG entre duas cores hex. */
function contrast(a: string, b: string): number {
  const lum = (hex: string) => {
    const [r, g, bl] = [1, 3, 5].map((i) => {
      const c = parseInt(hex.slice(i, i + 2), 16) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * r! + 0.7152 * g! + 0.0722 * bl!;
  };
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi! + 0.05) / (lo! + 0.05);
}

describe('Painel: cores e letras da marca', () => {
  it('não usa o terracota nem os tons antigos', () => {
    for (const file of ADMIN_FILES) {
      const source = readFileSync(join(ROOT, file), 'utf8');
      expect(source, file).not.toMatch(/#8C3B2B|#763123|#FAF6F0|#1F3A5F/i);
    }
  });

  it('o painel e o login usam as letras da marca', () => {
    for (const file of ['src/app/admin/(panel)/layout.tsx', 'src/app/admin/login/page.tsx']) {
      const source = readFileSync(join(ROOT, file), 'utf8');
      expect(source, file).toContain('BRAND_FONT_CLASSES');
      expect(source, file).toContain('BRAND_FONT_STYLE');
    }
  });

  it('os neutros quentes têm contraste AA para texto', () => {
    const stone = (tailwindConfig.theme?.extend?.colors as Record<string, Record<string, string>>)
      .stone!;
    const white = '#FFFFFF';
    for (const shade of ['500', '600', '700', '800', '900']) {
      expect(contrast(stone[shade]!, white), `stone-${shade} / branco`).toBeGreaterThanOrEqual(4.5);
      expect(
        contrast(stone[shade]!, stone['50']!),
        `stone-${shade} / papel`,
      ).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe('Painel: horário e caixas de texto', () => {
  it('o horário usa um traço entre as horas (sem «até»)', () => {
    const source = readFileSync(join(ROOT, 'src/components/dashboard/hours-editor.tsx'), 'utf8');
    expect(source).not.toMatch(/>\s*até\s*</);
    expect(source.match(/>\s*–\s*</g)).toHaveLength(2);
  });

  it('as caixas de texto das descrições crescem com o conteúdo', () => {
    const settings = readFileSync(
      join(ROOT, 'src/components/dashboard/restaurant-settings-form.tsx'),
      'utf8',
    );
    expect(settings).toContain('[field-sizing:content]');
    expect(settings.match(/className=\{TEXTAREA\}/g)).toHaveLength(2);
    const dishes = readFileSync(join(ROOT, 'src/components/dashboard/menu-manager.tsx'), 'utf8');
    expect(dishes.match(/\[field-sizing:content\]/g)?.length).toBeGreaterThanOrEqual(2);
  });
});
