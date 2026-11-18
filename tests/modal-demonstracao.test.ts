import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(__dirname, '..');
const dialog = readFileSync(
  resolve(ROOT, 'src/components/marketing/demo-request-dialog.tsx'),
  'utf8',
);
const css = readFileSync(resolve(ROOT, 'src/app/globals.css'), 'utf8');

describe('Modal «Peça uma demonstração»', () => {
  it('abre e fecha com animação (e sem animação com «reduzir movimento»)', () => {
    expect(css).toMatch(/\.osm-dialog\[open\]\s*\{[^}]*animation:\s*osm-sheet-in/);
    expect(css).toMatch(/\.osm-dialog\[data-closing\]\s*\{[^}]*animation:\s*osm-sheet-out/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)[\s\S]*\.osm-dialog\[open\]/);
    expect(dialog).toContain("dialog.dataset.closing = ''");
    // Esc e toque fora também fecham com a animação.
    expect(dialog).toContain("addEventListener('cancel'");
  });

  it('bloqueia o scroll da página por trás e desbloqueia ao fechar', () => {
    expect(dialog).toContain("classList.add('osm-scroll-lock')");
    expect(dialog).toContain("classList.remove('osm-scroll-lock')");
    expect(css).toMatch(/html\.osm-scroll-lock[\s\S]*overflow:\s*hidden/);
    expect(dialog).toContain('overscroll-contain');
  });

  it('no telemóvel a cor da folha continua para baixo (sem ver a página por baixo)', () => {
    expect(dialog).toContain('0_100vh_0_0_#FBF6EC');
    expect(dialog).toContain('env(safe-area-inset-bottom)');
  });
});
