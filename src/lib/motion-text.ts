// Pure helpers behind the text motion (C52). The components render these as server-side spans, so the
// motion itself is all CSS and the text stays the data text.

export interface LetterWord {
  word: string;
  letters: { char: string; index: number }[];
}

/**
 * Splits a title into words and letters; `index` runs across the whole title, spaces excluded,
 * from `start` (so a second line can carry on the first line's stagger).
 */
export function splitLetters(text: string, start = 0): LetterWord[] {
  let index = start;
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => ({
      word,
      letters: Array.from(word, (char) => ({ char, index: index++ })),
    }));
}

const round2 = (n: number) => Math.round(n * 100) / 100;

/**
 * Where each word of an inking paragraph turns from muted to ink, as percentages of its `cover` range:
 * evenly between 15% and 60%, so the paragraph is fully inked by the time it reaches the reading line.
 */
export function inkRanges(count: number): { from: number; to: number }[] {
  return Array.from({ length: count }, (_, i) => ({
    from: round2(15 + (45 * i) / count),
    to: round2(15 + (45 * (i + 1)) / count),
  }));
}

/** The skills strip's two rows: every skill of the proven groups, in data order, split in half. */
export function skillRows(
  groups: readonly { skills: string[]; learning: boolean }[],
): [string[], string[]] {
  const all = groups.filter((group) => !group.learning).flatMap((group) => group.skills);
  const half = Math.ceil(all.length / 2);
  return [all.slice(0, half), all.slice(half)];
}
