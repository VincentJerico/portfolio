import { describe, expect, it } from 'vitest';
import { morphText, scrambleFrame } from '../../src/lib/decode';

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

describe('morphText', () => {
  it('starts on the old word and lands exactly on the new one', () => {
    expect(morphText('Security', 'Performance', 0, () => 0.5)).toBe('Security');
    expect(morphText('Security', 'Performance', 1, () => 0.5)).toBe('Performance');
  });

  it('grows or shrinks its length smoothly between the two words', () => {
    const lengths = [0, 0.25, 0.5, 0.75, 1].map(
      (p) => morphText('API', 'Accessibility', p, () => 0.1).length,
    );
    expect(lengths[0]).toBe(3);
    expect(lengths.at(-1)).toBe(13);
    for (let i = 1; i < lengths.length; i++)
      expect(lengths[i]!).toBeGreaterThanOrEqual(lengths[i - 1]!);
  });

  it('settles from the left: early characters reach the new word first', () => {
    expect(morphText('Security', 'Regression', 0.6, () => 0.5).slice(0, 3)).toBe('Reg');
  });
});
