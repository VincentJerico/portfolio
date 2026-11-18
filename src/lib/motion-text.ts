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
