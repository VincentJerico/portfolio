/**
 * The site's colours in hex, for the places CSS can't reach: the share images (Satori reads hex), the
 * favicon and the browser's theme-color. They are the OKLCH tokens in src/styles/tokens.css, converted;
 * tests/unit/brand-colours.test.ts keeps them equal (C55 D11).
 */
export const BRAND = {
  paper: '#efe9de',
  ink: '#20263a',
  muted: '#4c5163',
  accent: '#a5341e',
  /** The rule: the ink at 18% over the paper (C54). */
  line: '#cac6c0',
  /** The dark theme's page. */
  slate: '#151c26',
} as const;
