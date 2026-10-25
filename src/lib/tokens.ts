export const TOKEN_NAMES = [
  'bg',
  'surface',
  'surface-2',
  'border',
  'text',
  'text-muted',
  'accent',
  'pass',
  'warn',
  'fail',
  'focus-ring',
] as const;

export type TokenName = (typeof TOKEN_NAMES)[number];
export type ThemeTokens = Partial<Record<TokenName, string>>;

export interface TokenPair {
  fg: TokenName;
  bg: TokenName;
  min: 4.5 | 3;
  use: string;
}

const SURFACES = ['bg', 'surface', 'surface-2'] as const;
const TEXT_ROLES: { fg: TokenName; use: string }[] = [
  { fg: 'text', use: 'body text' },
  { fg: 'text-muted', use: 'secondary text' },
  { fg: 'accent', use: 'links' },
  { fg: 'pass', use: 'PASS chip label' },
  { fg: 'warn', use: 'WARN chip label' },
  { fg: 'fail', use: 'FAIL chip label' },
];

export const TOKEN_PAIRS: TokenPair[] = [
  ...TEXT_ROLES.flatMap(({ fg, use }) =>
    SURFACES.map((bg) => ({ fg, bg, min: 4.5 as const, use })),
  ),
  { fg: 'bg', bg: 'accent', min: 4.5, use: 'primary button label' },
  { fg: 'focus-ring', bg: 'bg', min: 3, use: 'focus indicator' },
  { fg: 'focus-ring', bg: 'surface', min: 3, use: 'focus indicator' },
];

function readBlock(css: string, selector: string): ThemeTokens {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const block = new RegExp(`(?:^|\\n)\\s*${escaped}\\s*\\{([^}]*)\\}`).exec(css)?.[1] ?? '';
  const tokens: ThemeTokens = {};
  for (const [, name, value] of block.matchAll(/--([a-z0-9-]+)\s*:\s*(#[0-9a-fA-F]{3,6})\s*;/g)) {
    if ((TOKEN_NAMES as readonly string[]).includes(name!)) tokens[name as TokenName] = value!;
  }
  return tokens;
}

/** Reads the dark (`:root`) and light (`.light`) token blocks from tokens.css. */
export function parseTokens(css: string): { dark: ThemeTokens; light: ThemeTokens } {
  return { dark: readBlock(css, ':root'), light: readBlock(css, '.light') };
}
