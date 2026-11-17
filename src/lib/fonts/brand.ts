import { Atkinson_Hyperlegible_Next, Young_Serif } from 'next/font/google';

/*
 * Letras da marca «O Seu Menu»: Young Serif nos títulos e Atkinson Hyperlegible Next no
 * texto. Usadas na página de apresentação, no login e no painel (as cartas dos
 * restaurantes têm as suas próprias letras e não as carregam).
 */
export const brandDisplayFont = Young_Serif({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-landing-display',
  display: 'swap',
});

export const brandBodyFont = Atkinson_Hyperlegible_Next({
  subsets: ['latin'],
  weight: ['400', '600'],
  variable: '--font-landing-body',
  display: 'swap',
  // O Next ainda não tem as medidas desta letra para a letra de recurso; evita o aviso no build.
  adjustFontFallback: false,
});

/** Classes a pôr no contentor da página para ativar as letras da marca. */
export const BRAND_FONT_CLASSES = `${brandDisplayFont.variable} ${brandBodyFont.variable}`;

/**
 * Estilo para o painel e o login: faz `font-serif` e `font-sans` (Tailwind) usarem as
 * letras da marca dentro deste contentor.
 */
export const BRAND_FONT_STYLE = {
  '--font-serif': 'var(--font-landing-display)',
  '--font-sans': 'var(--font-landing-body)',
} as React.CSSProperties;
