import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { BRAND } from '@/lib/brand-colours';
import { toRgb } from '@/lib/contrast';
import { parseTokens } from '@/lib/tokens';

// C55 D11: the colours outside CSS (share images, favicon, theme-color) are the OKLCH tokens, in hex.
const css = readFileSync(new URL('../../src/styles/tokens.css', import.meta.url), 'utf8');
const { light, dark } = parseTokens(css);
const hex = (rgb: number[]) =>
  `#${rgb
    .map((c) =>
      Math.round(c * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
const over = (fg: string, bg: string, alpha: number) =>
  hex(toRgb(fg).map((c, i) => c * alpha + toRgb(bg)[i]! * (1 - alpha)));

describe('brand colours', () => {
  it('are the tokens, converted from OKLCH', () => {
    expect(BRAND).toEqual({
      paper: hex(toRgb(light.bg!)),
      ink: hex(toRgb(light.text!)),
      muted: hex(toRgb(light['text-muted']!)),
      accent: hex(toRgb(light.accent!)),
      // The rule is the ink at 18% (C54), laid over the paper.
      line: over(light.text!, light.bg!, 0.18),
      slate: hex(toRgb(dark.bg!)),
    });
  });

  it('are the only colours the share images use', () => {
    const og = readFileSync(new URL('../../src/lib/og.tsx', import.meta.url), 'utf8');
    expect(og.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []).toEqual([]);
  });

  it('paint the favicon in paper, ink and accent', () => {
    const icon = readFileSync(new URL('../../src/app/icon.svg', import.meta.url), 'utf8');
    const used = new Set((icon.match(/#[0-9a-fA-F]{6}\b/g) ?? []).map((c) => c.toLowerCase()));
    expect([...used].sort()).toEqual([BRAND.accent, BRAND.ink, BRAND.paper].sort());
  });
});
