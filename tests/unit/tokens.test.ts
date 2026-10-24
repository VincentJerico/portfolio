import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrastRatio } from '@/lib/contrast';
import { parseTokens, TOKEN_NAMES, TOKEN_PAIRS } from '@/lib/tokens';

const css = readFileSync(new URL('../../src/styles/tokens.css', import.meta.url), 'utf8');
const themes = parseTokens(css);

describe('tokens.css', () => {
  it.each(['dark', 'light'] as const)('%s theme defines every token', (theme) => {
    expect(Object.keys(themes[theme]).sort()).toEqual([...TOKEN_NAMES].sort());
  });

  it('uses the spec dark values for the page background (no-JS default)', () => {
    expect(themes.dark.bg?.toLowerCase()).toBe('#0b0f14');
  });
});

describe.each(['dark', 'light'] as const)('%s theme contrast', (theme) => {
  it.each(TOKEN_PAIRS)('$fg on $bg >= $min ($use)', ({ fg, bg, min }) => {
    const ratio = contrastRatio(themes[theme][fg]!, themes[theme][bg]!);
    expect(ratio, `${theme}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(min);
  });
});
