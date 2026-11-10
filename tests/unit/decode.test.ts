import { describe, expect, it } from 'vitest';
import { scrambleFrame } from '../../src/lib/decode';

describe('scrambleFrame', () => {
  it('keeps length and spaces, and settles on the exact text', () => {
    const text = 'tests for';
    for (let frame = 0; frame < text.length * 2; frame++) {
      const out = scrambleFrame(text, frame, () => 0.5);
      expect(out).toHaveLength(text.length);
      expect(out[5]).toBe(' ');
    }
    expect(scrambleFrame(text, text.length * 2, Math.random)).toBe(text);
  });

  it('reveals left to right: frame 2n fixes the first n characters', () => {
    expect(scrambleFrame('based in', 6, () => 0).slice(0, 3)).toBe('bas');
  });
});
