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

/** The skills strip's two rows: every skill of the proven groups, in data order, split in half. */
export function skillRows(
  groups: readonly { skills: string[]; learning: boolean }[],
): [string[], string[]] {
  const all = groups.filter((group) => !group.learning).flatMap((group) => group.skills);
  const half = Math.ceil(all.length / 2);
  return [all.slice(0, half), all.slice(half)];
}

/**
 * An odometer reel for one digit: the numbers it rolls past before landing (shown above the real digit
 * by CSS) and how many steps that is. A 0 turns a full circle, 0 through 9, so it moves like the rest.
 */
export function reel(digit: number): { lines: string; steps: number } {
  const steps = digit === 0 ? 10 : digit;
  return { lines: Array.from({ length: steps }, (_, i) => String(i)).join('\n'), steps };
}

/** The CV ring's text: the parts joined with a dot, closing the loop so the end meets the start. */
export function ringText(parts: string[]): string {
  return `${parts.join(' · ')} · `;
}

/**
 * The odometer's characters, each marked whether it rolls: the digits of a number roll; digits that
 * belong to a word (the "95" in "p95") and every other character stay still.
 */
export function odoParts(value: string): { char: string; roll: boolean }[] {
  let attached = false;
  return Array.from(value, (char) => {
    if (/[0-9]/.test(char)) return { char, roll: !attached };
    attached = /\p{L}/u.test(char);
    return { char, roll: false };
  });
}
