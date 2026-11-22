import type { Page } from '@playwright/test';

/**
 * Any CSS colour as sRGB channels from 0 to 255, converted by the browser itself through color-mix:
 * the tokens are OKLCH (C54), and computed colours come back in whichever space the browser keeps.
 */
export async function srgb(page: Page, color: string): Promise<[number, number, number]> {
  return page.evaluate((value) => {
    const probe = document.createElement('span');
    document.body.append(probe);
    probe.style.color = `color-mix(in srgb, ${value} 100%, transparent)`;
    const out = getComputedStyle(probe).color;
    probe.remove();
    const nums = (out.match(/-?[\d.]+/g) ?? []).map(Number).slice(0, 3);
    return (out.startsWith('color(srgb') ? nums.map((n) => Math.round(n * 255)) : nums) as [
      number,
      number,
      number,
    ];
  }, color);
}

/** Whether two sRGB colours match within one step per channel. */
export const sameColour = (a: readonly number[], b: readonly number[]) =>
  a.every((v, i) => Math.abs(v - b[i]!) <= 1);

/** WCAG relative luminance of sRGB channels from 0 to 255. */
export function luminance([r, g, b]: readonly number[]): number {
  const lin = (v: number) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r!) + 0.7152 * lin(g!) + 0.0722 * lin(b!);
}
