import { expect, test } from '../helpers/test';

test.describe('fonts', () => {
  test('headings use Host Grotesk and runner labels use Departure Mono, both loaded', async ({
    page,
  }) => {
    await page.goto('/');
    const h1 = await page.locator('h1').evaluate((el) => getComputedStyle(el).fontFamily);
    expect(h1).toMatch(/Host Grotesk/i);
    const label = await page
      .locator('.label-mono')
      .first()
      .evaluate((el) => {
        const style = getComputedStyle(el);
        return { family: style.fontFamily, size: style.fontSize };
      });
    expect(label.family).toMatch(/departure ?mono/i);
    expect(label.size).toBe('11px');
    const loaded = await page.evaluate(async () => {
      await document.fonts.ready;
      return [...document.fonts]
        .filter((font) => font.status === 'loaded')
        .map((font) => font.family)
        .join('|');
    });
    expect(loaded).toMatch(/Host Grotesk/i);
    expect(loaded).toMatch(/departure ?mono/i);
  });

  test('small mono text snaps to the 11 px grid', async ({ page }) => {
    await page.goto('/');
    const sizes = await page
      .locator('.font-mono.text-xs')
      .evaluateAll((els) => [...new Set(els.map((el) => getComputedStyle(el).fontSize))]);
    expect(sizes).toEqual(['11px']);
  });
});
