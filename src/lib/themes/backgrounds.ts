/**
 * Aspeto da carta, escolhido pelo dono em Definições → Aspeto:
 * - Fundo: a página e os cartões (claro, areia, escuro ou texturas). É o único que muda o fundo.
 * - Cor: só os destaques (preços, títulos das secções, categoria ativa, traços).
 * - Disposição: lista, grelha (2 colunas) ou foto grande.
 * As texturas são SVG gerados (sem imagens externas). O texto normal adapta-se ao fundo.
 */
export const MENU_BACKGROUND_IDS = [
  'claro',
  'areia',
  'escuro',
  'madeira-clara',
  'madeira-escura',
  'linho',
  'pedra',
] as const;

export type MenuBackgroundId = (typeof MENU_BACKGROUND_IDS)[number];

export interface MenuBackground {
  id: MenuBackgroundId;
  label: string;
  /** Valor CSS `background` da página. */
  css: string;
  /** Amostra para o painel. */
  preview: string;
  /** Cor base (barra de categorias translúcida, cor do browser). */
  baseColor: string;
  /** A página é escura (texto claro por cima). */
  pageDark: boolean;
  /** Os cartões dos pratos são escuros. */
  cardDark: boolean;
  /** Títulos/descrições sobre a página. */
  sectionFg: string;
  sectionMuted: string;
  /** Cartões dos pratos. */
  card: string;
  text: string;
  muted: string;
  border: string;
  borderStrong: string;
  cardShadow: string;
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

/** Superfícies comuns: página clara com cartões claros. */
const LIGHT_SURFACE = {
  card: '#FFFCF8',
  text: '#1E1611',
  muted: '#6B5D52',
  border: 'rgba(30, 22, 17, 0.08)',
  borderStrong: 'rgba(30, 22, 17, 0.18)',
  cardShadow: '0 1px 2px rgba(60, 35, 15, 0.06), 0 10px 28px rgba(60, 35, 15, 0.1)',
} as const;

export const MENU_BACKGROUNDS: Record<MenuBackgroundId, MenuBackground> = {
  claro: {
    id: 'claro',
    label: 'Claro',
    css: '#F4F1EC',
    preview: '#F4F1EC',
    baseColor: '#F4F1EC',
    pageDark: false,
    cardDark: false,
    sectionFg: '#1A1714',
    sectionMuted: '#5F574F',
    ...LIGHT_SURFACE,
  },
  areia: {
    id: 'areia',
    label: 'Areia',
    css: '#F3E6D6',
    preview: '#F3E6D6',
    baseColor: '#F3E6D6',
    pageDark: false,
    cardDark: false,
    sectionFg: '#1E1611',
    sectionMuted: '#5E5146',
    ...LIGHT_SURFACE,
  },
  escuro: {
    id: 'escuro',
    label: 'Escuro',
    css: 'radial-gradient(80% 35% at 50% 0%, rgba(255, 230, 190, 0.08) 0%, transparent 70%), #0F0E0C',
    preview: '#0F0E0C',
    baseColor: '#0F0E0C',
    pageDark: true,
    cardDark: true,
    sectionFg: '#F2ECE3',
    sectionMuted: '#A89F93',
    card: '#191714',
    text: '#F2ECE3',
    muted: '#A89F93',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.22)',
    cardShadow: 'none',
  },
  'madeira-clara': {
    id: 'madeira-clara',
    label: 'Madeira clara',
    css: `${softLight('rgba(255, 244, 228, 0.35)', 'rgba(70, 40, 15, 0.14)')}, ${LIGHT_WOOD} center top / 900px 900px, #D9B791`,
    preview: `${LIGHT_WOOD} center / 450px 450px`,
    baseColor: '#D9B791',
    pageDark: false,
    cardDark: false,
    sectionFg: '#24170E',
    sectionMuted: '#3D2A1E',
    ...LIGHT_SURFACE,
  },
  'madeira-escura': {
    id: 'madeira-escura',
    label: 'Madeira escura',
    css: `${softLight('rgba(255, 210, 160, 0.16)', 'rgba(0, 0, 0, 0.28)')}, ${DARK_WOOD} center top / 900px 900px, #4E3725`,
    preview: `${DARK_WOOD} center / 450px 450px`,
    baseColor: '#4E3725',
    pageDark: true,
    cardDark: false,
    sectionFg: '#FFF7EE',
    sectionMuted: 'rgba(255, 247, 238, 0.86)',
    ...LIGHT_SURFACE,
  },
  linho: {
    id: 'linho',
    label: 'Linho',
    css: `${LINEN} 0 0 / 300px 300px, #EFE6D8`,
    preview: `${LINEN} 0 0 / 150px 150px`,
    baseColor: '#EFE6D8',
    pageDark: false,
    cardDark: false,
    sectionFg: '#24170E',
    sectionMuted: '#5A4636',
    ...LIGHT_SURFACE,
  },
  pedra: {
    id: 'pedra',
    label: 'Pedra',
    css: `${STONE} center top / 600px 600px, #D9D8D5`,
    preview: `${STONE} center / 300px 300px`,
    baseColor: '#D9D8D5',
    pageDark: false,
    cardDark: false,
    sectionFg: '#1F1F1F',
    sectionMuted: '#454545',
    ...LIGHT_SURFACE,
  },
};

export function resolveMenuBackground(id: unknown): MenuBackground {
  if (typeof id === 'string' && (MENU_BACKGROUND_IDS as readonly string[]).includes(id)) {
    return MENU_BACKGROUNDS[id as MenuBackgroundId];
  }
  return MENU_BACKGROUNDS.areia;
}

// ---------------------------------------------------------------------------
// Cor (só os destaques: preços, títulos das secções, categoria ativa, traços)
// ---------------------------------------------------------------------------

export const MENU_ACCENT_IDS = ['terracota', 'dourado', 'verde', 'azul', 'grafite'] as const;

export type MenuAccentId = (typeof MENU_ACCENT_IDS)[number];

interface AccentShade {
  /** Texto de destaque (preços, títulos) com contraste AA sobre esta superfície. */
  text: string;
  /** Categoria ativa. */
  pillBg: string;
  pillFg: string;
}

export interface MenuAccent {
  id: MenuAccentId;
  label: string;
  /** Cor da amostra no painel. */
  swatch: string;
  /** Traço sob os títulos. */
  line: string;
  onLight: AccentShade;
  onDark: AccentShade;
}

export const MENU_ACCENTS: Record<MenuAccentId, MenuAccent> = {
  terracota: {
    id: 'terracota',
    label: 'Terracota',
    swatch: '#B9461F',
    line: '#C2532B',
    onLight: { text: '#A63C18', pillBg: '#B9461F', pillFg: '#FFFFFF' },
    onDark: { text: '#F0956C', pillBg: '#C2532B', pillFg: '#FFFFFF' },
  },
  dourado: {
    id: 'dourado',
    label: 'Dourado',
    swatch: '#C9973F',
    line: '#C9973F',
    onLight: { text: '#765210', pillBg: '#7E5C14', pillFg: '#FFFFFF' },
    onDark: { text: '#E5B76B', pillBg: '#D9A65A', pillFg: '#14100A' },
  },
  verde: {
    id: 'verde',
    label: 'Verde',
    swatch: '#2F6B4F',
    line: '#3C8462',
    onLight: { text: '#2A6248', pillBg: '#2F6B4F', pillFg: '#FFFFFF' },
    onDark: { text: '#86CDA8', pillBg: '#33765A', pillFg: '#FFFFFF' },
  },
  azul: {
    id: 'azul',
    label: 'Azul',
    swatch: '#1F4E7A',
    line: '#2C6496',
    onLight: { text: '#1F4E7A', pillBg: '#1F3A5F', pillFg: '#FFFFFF' },
    onDark: { text: '#93BDE6', pillBg: '#2C6496', pillFg: '#FFFFFF' },
  },
  grafite: {
    id: 'grafite',
    label: 'Grafite',
    swatch: '#1A1714',
    line: '#3A342E',
    onLight: { text: '#1A1714', pillBg: '#1A1714', pillFg: '#FFFFFF' },
    onDark: { text: '#F2ECE3', pillBg: '#F2ECE3', pillFg: '#0F0E0C' },
  },
};

export function resolveMenuAccent(id: unknown): MenuAccent {
  if (typeof id === 'string' && (MENU_ACCENT_IDS as readonly string[]).includes(id)) {
    return MENU_ACCENTS[id as MenuAccentId];
  }
  return MENU_ACCENTS.terracota;
}

// ---------------------------------------------------------------------------
// Disposição dos pratos
// ---------------------------------------------------------------------------

export const MENU_LAYOUT_IDS = ['lista', 'grelha', 'foto'] as const;

export type MenuLayoutId = (typeof MENU_LAYOUT_IDS)[number];

export const MENU_LAYOUTS: Record<MenuLayoutId, { label: string; description: string }> = {
  lista: { label: 'Lista', description: 'Uma linha por prato, com a foto ao lado.' },
  grelha: { label: 'Grelha', description: 'Dois pratos por linha, em colunas.' },
  foto: { label: 'Foto grande', description: 'Um prato por linha, com a foto em destaque.' },
};

export function resolveMenuLayout(id: unknown): MenuLayoutId {
  return typeof id === 'string' && (MENU_LAYOUT_IDS as readonly string[]).includes(id)
    ? (id as MenuLayoutId)
    : 'lista';
}

// ---------------------------------------------------------------------------
// Leitura das definições (com compatibilidade com escolhas antigas)
// ---------------------------------------------------------------------------

export interface MenuAppearance {
  background: MenuBackgroundId;
  accent: MenuAccentId;
  layout: MenuLayoutId;
}

/** Fundo e cor por omissão a partir do estilo antigo guardado em restaurants.style. */
const LEGACY_BY_STYLE: Record<string, { background: MenuBackgroundId; accent: MenuAccentId }> = {
  classico: { background: 'areia', accent: 'terracota' },
  moderno: { background: 'claro', accent: 'grafite' },
  escuro: { background: 'escuro', accent: 'dourado' },
};

function appearanceRecord(settings: unknown): Record<string, unknown> {
  if (!settings || typeof settings !== 'object' || Array.isArray(settings)) {
    return {};
  }
  const appearance = (settings as Record<string, unknown>).appearance;
  if (!appearance || typeof appearance !== 'object' || Array.isArray(appearance)) {
    return {};
  }
  return appearance as Record<string, unknown>;
}

/**
 * Lê `settings.appearance` ({ background, accent, layout }).
 * - Fundo «nenhum» (antigo «Liso») ou em falta → fundo liso do estilo antigo.
 * - Cor em falta → cor do estilo antigo.
 * - `columns: true` (opção antiga) → disposição «grelha».
 */
export function parseMenuAppearance(
  settings: unknown,
  legacyStyle?: string | null,
): MenuAppearance {
  const record = appearanceRecord(settings);
  const legacy = LEGACY_BY_STYLE[legacyStyle ?? ''] ?? LEGACY_BY_STYLE.classico!;

  const rawBackground = record.background;
  const background =
    typeof rawBackground === 'string' &&
    (MENU_BACKGROUND_IDS as readonly string[]).includes(rawBackground)
      ? (rawBackground as MenuBackgroundId)
      : legacy.background;

  const rawAccent = record.accent;
  const accent =
    typeof rawAccent === 'string' && (MENU_ACCENT_IDS as readonly string[]).includes(rawAccent)
      ? (rawAccent as MenuAccentId)
      : legacy.accent;

  const layout =
    typeof record.layout === 'string'
      ? resolveMenuLayout(record.layout)
      : record.columns === true
        ? 'grelha'
        : 'lista';

  return { background, accent, layout };
}

const SERIF = 'var(--font-serif), Georgia, serif';
const SANS = 'var(--font-sans), system-ui, sans-serif';

/** Variáveis CSS da carta para um fundo e uma cor. */
export function menuCssVars(backgroundId: MenuBackgroundId, accentId: MenuAccentId) {
  const bg = MENU_BACKGROUNDS[backgroundId];
  const accent = MENU_ACCENTS[accentId];
  const onPage = bg.pageDark ? accent.onDark : accent.onLight;
  const onCard = bg.cardDark ? accent.onDark : accent.onLight;

  return {
    '--page-bg': bg.css,
    '--color-bg': bg.baseColor,
    '--color-card': bg.card,
    '--color-text': bg.text,
    '--color-muted': bg.muted,
    '--color-border': bg.border,
    '--color-border-strong': bg.borderStrong,
    '--color-line': bg.borderStrong,
    '--color-azulejo': accent.line,
    '--color-accent': accent.line,
    '--color-on-accent': onPage.pillFg,
    '--color-accent-text': onCard.text,
    '--nav-bg': bg.pageDark
      ? `color-mix(in srgb, ${bg.baseColor} 82%, transparent)`
      : `color-mix(in srgb, ${bg.baseColor} 90%, transparent)`,
    '--pill-bg': bg.pageDark ? 'transparent' : bg.card,
    '--pill-fg': bg.sectionMuted,
    '--pill-active-bg': onPage.pillBg,
    '--pill-active-fg': onPage.pillFg,
    '--section-fg': onPage.text,
    '--section-muted': bg.sectionMuted,
    '--header-fg': bg.sectionFg,
    '--price-bg': 'transparent',
    '--price-fg': onCard.text,
    '--card-shadow': bg.cardShadow,
    '--radius-card': '20px',
    '--radius-pill': '999px',
    '--radius-thumb': '14px',
    '--font-display': SERIF,
    '--font-body': SANS,
  } as const;
}
