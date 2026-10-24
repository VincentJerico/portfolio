const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

function channels(hex: string): [number, number, number] {
  if (!HEX.test(hex)) throw new Error(`Expected a hex colour like #0B0F14, got "${hex}"`);
  const body = hex.slice(1);
  const full = body.length === 3 ? [...body].map((c) => c + c).join('') : body;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255) as [number, number, number];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = channels(hex).map((c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  ) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio between two hex colours (1 to 21). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hi + 0.05) / (lo + 0.05);
}
