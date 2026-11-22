const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
// oklch(L C H) or oklch(L C H / A); L as a number (0–1) or a percentage. The alpha is not part of the
// colour's own value, so it is read past and ignored.
const OKLCH = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*[\d.]+%?\s*)?\)$/i;

function hexChannels(hex: string): [number, number, number] {
  const body = hex.slice(1);
  const full = body.length === 3 ? [...body].map((c) => c + c).join('') : body;
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255) as [number, number, number];
}

const encode = (c: number) => {
  const v = c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;
  return Math.min(1, Math.max(0, v));
};

/** An OKLCH colour as gamma-encoded sRGB channels from 0 to 1, clamped to the sRGB gamut (C54). */
export function oklchToRgb(l: number, c: number, h: number): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    encode(4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_),
    encode(-1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_),
    encode(-0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_),
  ];
}

/** A hex or OKLCH colour as sRGB channels from 0 to 1. */
export function toRgb(color: string): [number, number, number] {
  if (HEX.test(color)) return hexChannels(color);
  const match = OKLCH.exec(color.trim());
  if (match) {
    const lightness = Number(match[1]) / (match[2] ? 100 : 1);
    return oklchToRgb(lightness, Number(match[3]), Number(match[4]));
  }
  throw new Error(`Expected a hex colour like #0B0F14 or an oklch() colour, got "${color}"`);
}

/** WCAG relative luminance of a hex or OKLCH colour, from 0 (black) to 1 (white). */
export function relativeLuminance(color: string): number {
  const [r, g, b] = toRgb(color).map((c) =>
    c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4,
  ) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG 2.x contrast ratio between two colours (1 to 21). */
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x) as [
    number,
    number,
  ];
  return (hi + 0.05) / (lo + 0.05);
}
