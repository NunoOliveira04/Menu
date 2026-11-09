/**
 * Fundos da carta, escolhidos pelo dono nas definições («Fundo»).
 * As texturas são SVG gerados (sem imagens externas): leves e sem pedidos extra.
 * Cada fundo define também a cor dos títulos das secções para se lerem bem por cima.
 */
export const MENU_BACKGROUND_IDS = [
  'nenhum',
  'madeira-clara',
  'madeira-escura',
  'linho',
  'pedra',
] as const;

export type MenuBackgroundId = (typeof MENU_BACKGROUND_IDS)[number];

export interface MenuBackground {
  id: MenuBackgroundId;
  label: string;
  /** Valor CSS `background` da página; null = cor de fundo da paleta. */
  css: string | null;
  /** Cores dos títulos/descrições das secções sobre este fundo (null = as da paleta). */
  sectionFg: string | null;
  sectionMuted: string | null;
  /** Amostra para o painel. */
  preview: string;
}

function svgUrl(body: string, width = 600, height = 600): string {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'>${body}</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

/**
 * Madeira: ruído esticado na horizontal (veios largos e suaves) com riscas finas discretas.
 * Contraste baixo para a textura se notar sem competir com os pratos.
 */
function woodTexture(
  [r, g, b]: [number, number, number],
  [dr, dg, db]: [number, number, number],
  seed: number,
): string {
  return svgUrl(
    `<filter id='w' x='0' y='0' width='100%' height='100%'>` +
      `<feTurbulence type='fractalNoise' baseFrequency='0.0025 0.075' numOctaves='4' seed='${seed}' result='base'/>` +
      `<feTurbulence type='fractalNoise' baseFrequency='0.0015 0.6' numOctaves='2' seed='${seed + 9}' result='fine'/>` +
      `<feComposite in='base' in2='fine' operator='arithmetic' k1='0' k2='0.75' k3='0.2' k4='0'/>` +
      `<feColorMatrix type='matrix' values='0 0 0 ${dr} ${r}  0 0 0 ${dg} ${g}  0 0 0 ${db} ${b}  0 0 0 0 1'/>` +
      `</filter><rect width='100%' height='100%' filter='url(#w)'/>`,
    900,
    900,
  );
}

const LINEN = svgUrl(
  `<filter id='l'><feTurbulence type='fractalNoise' baseFrequency='0.9 0.02' numOctaves='2' seed='2' result='a'/>` +
    `<feTurbulence type='fractalNoise' baseFrequency='0.02 0.9' numOctaves='2' seed='5' result='b'/>` +
    `<feBlend in='a' in2='b' mode='multiply'/>` +
    `<feColorMatrix type='matrix' values='0 0 0 0.12 0.86  0 0 0 0.12 0.81  0 0 0 0.12 0.73  0 0 0 0 1'/></filter>` +
    `<rect width='100%' height='100%' filter='url(#l)'/>`,
  300,
  300,
);

const STONE = svgUrl(
  `<filter id='p'><feTurbulence type='fractalNoise' baseFrequency='0.012' numOctaves='5' seed='11'/>` +
    `<feColorMatrix type='matrix' values='0 0 0 0.25 0.72  0 0 0 0.25 0.71  0 0 0 0.25 0.69  0 0 0 0 1'/></filter>` +
    `<rect width='100%' height='100%' filter='url(#p)'/>`,
);

const LIGHT_WOOD = woodTexture([0.6, 0.43, 0.28], [0.3, 0.22, 0.15], 7);
const DARK_WOOD = woodTexture([0.2, 0.125, 0.07], [0.22, 0.14, 0.08], 3);

/**
 * Luz por cima da textura: mais clara em cima ao centro e cantos ligeiramente mais escuros,
 * para a madeira ter profundidade e as transições serem suaves.
 */
function softLight(top: string, edges: string): string {
  return (
    `radial-gradient(130% 55% at 50% 0%, ${top} 0%, transparent 70%), ` +
    `linear-gradient(90deg, ${edges} 0%, transparent 22%, transparent 78%, ${edges} 100%)`
  );
}

export const MENU_BACKGROUNDS: Record<MenuBackgroundId, MenuBackground> = {
  nenhum: {
    id: 'nenhum',
    label: 'Liso',
    css: null,
    sectionFg: null,
    sectionMuted: null,
    preview: 'var(--swatch-bg)',
  },
  'madeira-clara': {
    id: 'madeira-clara',
    label: 'Madeira clara',
    css: `${softLight('rgba(255, 244, 228, 0.35)', 'rgba(70, 40, 15, 0.14)')}, ${LIGHT_WOOD} center top / 900px 900px, #D9B791`,
    sectionFg: '#2B1A12',
    sectionMuted: '#3D2A1E',
    preview: `${LIGHT_WOOD} center / 450px 450px`,
  },
  'madeira-escura': {
    id: 'madeira-escura',
    label: 'Madeira escura',
    css: `${softLight('rgba(255, 210, 160, 0.16)', 'rgba(0, 0, 0, 0.28)')}, ${DARK_WOOD} center top / 900px 900px, #4E3725`,
    sectionFg: '#FFF7EE',
    sectionMuted: 'rgba(255, 247, 238, 0.86)',
    preview: `${DARK_WOOD} center / 450px 450px`,
  },
  linho: {
    id: 'linho',
    label: 'Linho',
    css: `${LINEN} 0 0 / 300px 300px, #EFE6D8`,
    sectionFg: '#2B1A12',
    sectionMuted: '#5A4636',
    preview: `${LINEN} 0 0 / 150px 150px`,
  },
  pedra: {
    id: 'pedra',
    label: 'Pedra',
    css: `${STONE} center top / 600px 600px, #D9D8D5`,
    sectionFg: '#1F1F1F',
    sectionMuted: '#454545',
    preview: `${STONE} center / 300px 300px`,
  },
};

export function resolveMenuBackground(id: string | null | undefined): MenuBackground {
  if (id && (MENU_BACKGROUND_IDS as readonly string[]).includes(id)) {
    return MENU_BACKGROUNDS[id as MenuBackgroundId];
  }
  return MENU_BACKGROUNDS.nenhum;
}

/** Variáveis CSS a juntar às da paleta quando há um fundo escolhido. */
export function backgroundCssVars(background: MenuBackground): Record<string, string> {
  const vars: Record<string, string> = {};
  if (background.css) {
    vars['--page-bg'] = background.css;
  }
  if (background.sectionFg) {
    vars['--section-fg'] = background.sectionFg;
  }
  if (background.sectionMuted) {
    vars['--section-muted'] = background.sectionMuted;
  }
  return vars;
}

/** Lê `settings.appearance.background` (JSON do restaurante) com fallback para «Liso». */
export function parseMenuBackgroundId(settings: unknown): MenuBackgroundId {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    return 'nenhum';
  }
  const appearance = (settings as Record<string, unknown>).appearance;
  if (!appearance || typeof appearance !== 'object' || Array.isArray(appearance)) {
    return 'nenhum';
  }
  return resolveMenuBackground((appearance as Record<string, unknown>).background as string).id;
}
