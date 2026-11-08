import { expect, test } from '../helpers/test';

test.describe('fonts', () => {
  test('text uses Geist and runner labels use Geist Mono, both loaded', async ({ page }) => {
    await page.goto('/');
    const h1 = await page.locator('h1').evaluate((el) => getComputedStyle(el).fontFamily);
    expect(h1).toMatch(/^"?Geist\b/i);
    const label = await page
      .locator('.label-mono')
      .first()
      .evaluate((el) => {
        const style = getComputedStyle(el);
        return { family: style.fontFamily, size: style.fontSize };
      });
    expect(label.family).toMatch(/Geist Mono/i);
    expect(label.size).toBe('12px');
    const loaded = await page.evaluate(async () => {
      await document.fonts.ready;
      return [...document.fonts]
        .filter((font) => font.status === 'loaded')
        .map((font) => font.family)
        .join('|');
    });
    expect(loaded).toMatch(/Geist Mono/i);
    expect(loaded).toMatch(/(^|\|)"?Geist"?(\||$)/i);
  });

  test('no mono text on the page is set below 11 px', async ({ page }) => {
    await page.goto('/');
    const sizes = await page
      .locator('.font-mono, .label-mono')
      .evaluateAll((els) => els.map((el) => parseFloat(getComputedStyle(el).fontSize)));
    expect(Math.min(...sizes)).toBeGreaterThanOrEqual(11);
  });
});
