import { describe, expect, it } from 'vitest';
import { splitLetters } from '@/lib/motion-text';

describe('splitLetters', () => {
  it('numbers every letter of a single word', () => {
    const words = splitLetters('About');
    expect(words).toHaveLength(1);
    expect(words[0]!.word).toBe('About');
    expect(words[0]!.letters.map((l) => l.index)).toEqual([0, 1, 2, 3, 4]);
    expect(words[0]!.letters.map((l) => l.char).join('')).toBe('About');
  });

  it('keeps counting across words, skipping the spaces', () => {
    const words = splitLetters('Client work');
    expect(words.map((w) => w.word)).toEqual(['Client', 'work']);
    expect(words[1]!.letters[0]).toEqual({ char: 'w', index: 6 });
  });

  it('collapses extra whitespace', () => {
    expect(splitLetters('  a  b ').map((w) => w.word)).toEqual(['a', 'b']);
  });
});
