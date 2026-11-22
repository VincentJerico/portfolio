import { describe, expect, it } from 'vitest';
import { contrastRatio, oklchToRgb, relativeLuminance, toRgb } from '@/lib/contrast';

describe('contrastRatio', () => {
  it('is 21 for black on white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1);
  });

  it('is symmetric', () => {
    expect(contrastRatio('#FFFFFF', '#000000')).toBeCloseTo(21, 1);
  });

  it('matches the WCAG reference value for #777777 on white', () => {
    expect(contrastRatio('#777777', '#FFFFFF')).toBeCloseTo(4.48, 2);
  });

  it('accepts lowercase and 3-digit hex', () => {
    expect(contrastRatio('#fff', '#000')).toBeCloseTo(21, 1);
  });

  it('rejects values that are not hex or OKLCH colours', () => {
    expect(() => contrastRatio('blue', '#000')).toThrow(/hex|oklch/);
  });
});

// C54: the tokens are written in OKLCH, so contrast is checked on the colour OKLCH describes.
describe('OKLCH', () => {
  const close = (a: number[], b: number[]) =>
    a.forEach((v, i) => expect(Math.abs(v - b[i]!)).toBeLessThanOrEqual(1 / 255));

  it('converts white and black', () => {
    close(oklchToRgb(1, 0, 0), [1, 1, 1]);
    close(oklchToRgb(0, 0, 0), [0, 0, 0]);
  });

  it('reads the paper colour back to its hex within one step', () => {
    close(toRgb('oklch(0.9357 0.0161 82.79)'), toRgb('#efe9de'));
  });

  it('measures luminance and contrast the same as hex', () => {
    expect(relativeLuminance('oklch(0.9357 0.0161 82.79)')).toBeCloseTo(
      relativeLuminance('#efe9de'),
      3,
    );
    expect(contrastRatio('oklch(0.2726 0.0383 270.9)', 'oklch(0.9357 0.0161 82.79)')).toBeCloseTo(
      contrastRatio('#20263a', '#efe9de'),
      1,
    );
  });

  it('ignores an alpha channel when reading the colour', () => {
    close(toRgb('oklch(0.2726 0.0383 270.9 / 0.18)'), toRgb('oklch(0.2726 0.0383 270.9)'));
  });
});
