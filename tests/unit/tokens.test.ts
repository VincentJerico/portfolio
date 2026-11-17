import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrastRatio, relativeLuminance } from '@/lib/contrast';
import { parseTokens, TOKEN_NAMES, TOKEN_PAIRS } from '@/lib/tokens';

const css = readFileSync(new URL('../../src/styles/tokens.css', import.meta.url), 'utf8');
const themes = parseTokens(css);

describe('tokens.css', () => {
  it.each(['dark', 'light'] as const)('%s theme defines every token', (theme) => {
    expect(Object.keys(themes[theme]).sort()).toEqual([...TOKEN_NAMES].sort());
  });

  // C51: the poster is designed paper-first, so visitors without JavaScript get the paper theme.
  it('makes paper the no-JS default (C51)', () => {
    expect(css).toMatch(/:root[^{]*\{[^}]*color-scheme:\s*light/);
    expect(themes.light.bg?.toLowerCase()).toBe('#efe9de');
  });

  it('keeps the dark theme a deep slate rather than near-black (C48)', () => {
    expect(themes.dark.bg?.toLowerCase()).toBe('#151c26');
  });

  // Vincent (C48): no surface or text should read as white or black, not just avoid #fff and #000.
  it.each(['dark', 'light'] as const)(
    '%s theme has nothing that reads as white or black',
    (theme) => {
      const extremes = Object.entries(themes[theme])
        .map(([name, value]) => [name, relativeLuminance(value)] as const)
        .filter(([, luminance]) => luminance < 0.01 || luminance > 0.91);
      expect(extremes).toEqual([]);
    },
  );

  it.each(['dark', 'light'] as const)('%s theme uses no pure black or pure white', (theme) => {
    const pure = Object.entries(themes[theme]).filter(([, value]) =>
      ['#000', '#000000', '#fff', '#ffffff'].includes(value.toLowerCase()),
    );
    expect(pure).toEqual([]);
  });
});

describe.each(['dark', 'light'] as const)('%s theme contrast', (theme) => {
  it.each(TOKEN_PAIRS)('$fg on $bg >= $min ($use)', ({ fg, bg, min }) => {
    const ratio = contrastRatio(themes[theme][fg]!, themes[theme][bg]!);
    expect(ratio, `${theme}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(min);
  });
});
