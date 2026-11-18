import { describe, expect, it } from 'vitest';
import { skills } from '@/content';
import { odoParts, reel, ringText, skillRows, splitLetters } from '@/lib/motion-text';

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

describe('skillRows', () => {
  it('holds every proven skill once, in data order, and no skill still being learned', () => {
    const proven = skills.filter((group) => !group.learning).flatMap((group) => group.skills);
    const learning = skills.filter((group) => group.learning).flatMap((group) => group.skills);
    const [a, b] = skillRows(skills);
    expect([...a, ...b]).toEqual(proven);
    expect(a.length).toBe(Math.ceil(proven.length / 2));
    for (const skill of learning.filter((s) => !proven.includes(s))) {
      expect([...a, ...b]).not.toContain(skill);
    }
  });
});

describe('reel', () => {
  it('rolls a digit up from 0, one step per number passed', () => {
    expect(reel(3)).toEqual({ lines: '0\n1\n2', steps: 3 });
  });

  it('turns a 0 a full circle', () => {
    expect(reel(0).steps).toBe(10);
    expect(reel(0).lines.split('\n')).toHaveLength(10);
  });
});

describe('ringText', () => {
  it('joins the parts with a dot and closes the loop', () => {
    expect(ringText(['A', 'B'])).toBe('A · B · ');
  });
});

describe('odoParts', () => {
  const rolling = (value: string) =>
    odoParts(value)
      .filter((part) => part.roll)
      .map((part) => part.char)
      .join('');

  it('rolls the digits of the numbers', () => {
    expect(rolling('7 of 7')).toBe('77');
    expect(rolling('over 7,000 requests/s')).toBe('7000');
  });

  it('keeps digits that belong to a word still', () => {
    expect(rolling('12 s p95')).toBe('12');
  });

  it('keeps every character, in order', () => {
    expect(
      odoParts('12 s p95')
        .map((part) => part.char)
        .join(''),
    ).toBe('12 s p95');
  });
});
