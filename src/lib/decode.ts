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
