import { metrics } from '../../src/content';
import { expect, test } from '../helpers/test';

// Review focus 2 (C52): in a browser without scroll-driven animations (Firefox today), every scroll
// effect shows its final layout with all its content. Current engines can't switch the feature off, so
// the stylesheet is served with its `@supports (animation-timeline: view())` blocks made false, which
// is exactly what such a browser does with them.

test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

test.beforeEach(async ({ page }) => {
  await page.route(/\.css(\?|$)/, async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(
      /@supports\s*\(\s*animation-timeline\s*:\s*view\(\s*\)\s*\)/g,
      '@supports (animation-timeline: no-such-timeline)',
    );
    await route.fulfill({ response, body });
  });
});

test.describe('without scroll-driven animations', () => {
  test('the scroll-driven rules really are off', async ({ page }) => {
    await page.goto('/');
    // Sections rise in on a view timeline wherever it is supported; here they must not.
    expect(
      await page
        .locator('main section')
        .first()
        .evaluate((el) => getComputedStyle(el).animationName),
    ).toBe('none');
  });

  test('home: the skills strip wraps', async ({ page }) => {
    await page.goto('/');
    const copy = page.locator('.marquee-row ul[aria-hidden="true"]').first();
    expect(await copy.evaluate((el) => getComputedStyle(el).display)).toBe('none');
    expect(
      await page
        .locator('.marquee-row')
        .first()
        .evaluate((el) => getComputedStyle(el).flexWrap),
    ).toBe('wrap');
  });

  test('about: the numbers show their values and the career path is a list', async ({ page }) => {
    await page.goto('/about');
    const values = page.locator('#numbers .metric-value');
    for (const [i, metric] of metrics.entries()) {
      expect(await values.nth(i).evaluate((el) => el.textContent)).toBe(metric.value);
    }
    const windows = await page
      .locator('#numbers .odo-window')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).display));
    expect(new Set(windows)).toEqual(new Set(['none']));
    const tops = await page
      .locator('.career-track ol > li')
      .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
    expect(new Set(tops).size).toBe(tops.length);
  });

  test('home: Contact is full bleed', async ({ page }) => {
    await page.goto('/');
    const clip = await page
      .getByRole('region', { name: 'Contact' })
      .evaluate((el) => getComputedStyle(el).clipPath);
    // The finished band: out to the viewport's edges (half the 1280 px viewport), no rounded card.
    expect(clip).toBe('inset(0px calc(50% - 640px))');
  });
});
