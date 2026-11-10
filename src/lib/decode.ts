const GLYPHS = 'abcdefghijklmnopqrstuvwxyz0123456789#%&*';

/**
 * One frame of a label "decoding": characters settle left to right, two frames per character, and
 * the rest show random glyphs. Spaces never change, so the label keeps its word shapes and width.
 * Frame `text.length * 2` and later return the text exactly.
 */
export function scrambleFrame(text: string, frame: number, random: () => number): string {
  return [...text]
    .map((char, i) =>
      i < frame / 2 || char === ' ' ? char : GLYPHS[Math.floor(random() * GLYPHS.length)],
    )
    .join('');
}

/**
 * One frame of one word morphing into another, `progress` from 0 to 1. The length eases from the old
 * word's to the new word's, the new word settles from the left, and unsettled places show random
 * glyphs (spaces in the new word stay spaces). 0 returns the old word and 1 the new word exactly.
 */
export function morphText(
  from: string,
  to: string,
  progress: number,
  random: () => number,
): string {
  if (progress <= 0) return from;
  if (progress >= 1) return to;
  const length = Math.round(from.length + (to.length - from.length) * progress);
  const settled = Math.floor(progress * to.length);
  let out = '';
  for (let i = 0; i < length; i++) {
    if (i < settled || to[i] === ' ') out += to[i] ?? '';
    else out += GLYPHS[Math.floor(random() * GLYPHS.length)];
  }
  return out;
}
