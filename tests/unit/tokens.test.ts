import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrastRatio, relativeLuminance, toRgb } from '@/lib/contrast';
import { parseTokens, TOKEN_NAMES, TOKEN_PAIRS } from '@/lib/tokens';

const css = readFileSync(new URL('../../src/styles/tokens.css', import.meta.url), 'utf8');
const themes = parseTokens(css);

describe('tokens.css', () => {
  it.each(['dark', 'light'] as const)('%s theme defines every token', (theme) => {
    expect(Object.keys(themes[theme]).sort()).toEqual([...TOKEN_NAMES].sort());
  });

  const sameAs = (value: string | undefined, hex: string) =>
    toRgb(value!).every((v, i) => Math.abs(v - toRgb(hex)[i]!) <= 1 / 255);

  // C51: the poster is designed paper-first, so visitors without JavaScript get the paper theme.
  it('makes paper the no-JS default (C51)', () => {
    expect(css).toMatch(/:root[^{]*\{[^}]*color-scheme:\s*light/);
    expect(sameAs(themes.light.bg, '#efe9de')).toBe(true);
  });

  // C54: every colour token is written in OKLCH.
  it.each(['dark', 'light'] as const)('%s theme is written in OKLCH', (theme) => {
    const notOklch = Object.entries(themes[theme]).filter(
      ([, value]) => !value.startsWith('oklch('),
    );
    expect(notOklch).toEqual([]);
  });

  // C54: the page and its two surfaces step evenly in lightness.
  it.each(['dark', 'light'] as const)('%s surfaces step evenly in lightness', (theme) => {
    const lightness = (name: 'bg' | 'surface' | 'surface-2') =>
      Number(/oklch\(\s*([\d.]+)/.exec(themes[theme][name]!)![1]);
    const first = lightness('surface') - lightness('bg');
    const second = lightness('surface-2') - lightness('surface');
    expect(Math.abs(first - second)).toBeLessThanOrEqual(0.002);
  });

  // C54: lines are the text colour at low alpha, so they read the same on any surface.
  it.each(['dark', 'light'] as const)('%s border is the text colour at low alpha', (theme) => {
    const [, lch, alpha] = /oklch\(([^/)]+)\/\s*([\d.]+)\)/.exec(themes[theme].border!) ?? [];
    expect(lch?.trim()).toBe(/oklch\(([^/)]+)\)/.exec(themes[theme].text!)![1]!.trim());
    expect(Number(alpha)).toBeLessThanOrEqual(0.25);
  });

  // C52: the home ending (.theme-flip) is set in the other theme's tokens, already checked for contrast.
  it('sets .theme-flip in the opposite theme', () => {
    expect(css).toMatch(/(?:^|\n):root,\n\.light,\n\.dark \.theme-flip\s*\{/);
    expect(css).toMatch(/(?:^|\n)\.dark,\n:root:not\(\.dark\) \.theme-flip\s*\{/);
  });

  it('keeps the dark theme a deep slate rather than near-black (C48)', () => {
    expect(sameAs(themes.dark.bg, '#151c26')).toBe(true);
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
    const pure = Object.entries(themes[theme]).filter(([, value]) => {
      const rgb = toRgb(value);
      return rgb.every((c) => c === 0) || rgb.every((c) => c === 1);
    });
    expect(pure).toEqual([]);
  });
});

describe.each(['dark', 'light'] as const)('%s theme contrast', (theme) => {
  it.each(TOKEN_PAIRS)('$fg on $bg >= $min ($use)', ({ fg, bg, min }) => {
    const ratio = contrastRatio(themes[theme][fg]!, themes[theme][bg]!);
    expect(ratio, `${theme}: ${fg} on ${bg} is ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(min);
  });
});

// C54: every gradient and colour mix in the stylesheet interpolates in OKLCH.
describe('globals.css', () => {
  const globals = readFileSync(new URL('../../src/app/globals.css', import.meta.url), 'utf8');
  it('mixes and blends colours in OKLCH', () => {
    const calls = [...globals.matchAll(/(color-mix|linear-gradient|radial-gradient)\(([^;]*)/g)];
    expect(calls.length).toBeGreaterThan(0);
    const notOklch = calls.map((m) => m[0]).filter((call) => !/\bin oklch\b/.test(call));
    expect(notOklch).toEqual([]);
  });
});

// C54 T9: full-height sizes use the dynamic or small viewport units, never plain vh.
describe('viewport units', () => {
  it('uses no plain vh in globals.css', () => {
    const globals = readFileSync(new URL('../../src/app/globals.css', import.meta.url), 'utf8');
    const code = globals.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(code.match(/\b\d+(\.\d+)?vh\b/g) ?? []).toEqual([]);
  });
});

// C54 T10, review focus 1: the grain sits over the text, blended multiply on paper and screen on
// slate. Even if every grain pixel were pure black on paper (or pure white on slate), at the grain's
// opacity every text pair keeps its contrast.
describe.each(['dark', 'light'] as const)('%s theme under the grain', (theme) => {
  const block =
    theme === 'light'
      ? ':root,\n.light,\n.dark .theme-flip'
      : '.dark,\n:root:not(.dark) .theme-flip';
  const body = css.slice(css.indexOf(block));
  const grain = Number(/--grain:\s*([\d.]+)/.exec(body)![1]);
  const toHex = (rgb: number[]) =>
    `#${rgb
      .map((c) =>
        Math.round(Math.min(1, Math.max(0, c)) * 255)
          .toString(16)
          .padStart(2, '0'),
      )
      .join('')}`;
  const worstBackground = (value: string) => {
    const rgb = toRgb(value);
    return toHex(
      theme === 'light' ? rgb.map((c) => c * (1 - grain)) : rgb.map((c) => c + grain * (1 - c)),
    );
  };
  it.each(TOKEN_PAIRS.filter((pair) => pair.min === 4.5 && pair.fg !== 'bg'))(
    '$fg on $bg stays >= $min',
    ({ fg, bg, min }) => {
      const ratio = contrastRatio(themes[theme][fg]!, worstBackground(themes[theme][bg]!));
      expect(
        ratio,
        `${theme}: ${fg} on grained ${bg} is ${ratio.toFixed(2)}:1`,
      ).toBeGreaterThanOrEqual(min);
    },
  );
});
