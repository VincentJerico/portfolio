import { describe, expect, it } from 'vitest';
import { contrastRatio } from '@/lib/contrast';

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

  it('rejects values that are not hex colours', () => {
    expect(() => contrastRatio('blue', '#000')).toThrow(/hex/);
  });
});
