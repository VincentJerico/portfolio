import { expect, test, type Page } from '../helpers/test';

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

const inkColour = (page: Page) =>
  page.evaluate(() => {
    const el = document.createElement('span');
    el.style.color = 'var(--text)';
    document.body.append(el);
    const rgb = getComputedStyle(el).color;
    el.remove();
    return rgb;
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

  test('home: the intro is ink and the skills strip wraps', async ({ page }) => {
    await page.goto('/');
    expect(
      await page
        .locator('.ink-text span')
        .first()
        .evaluate((el) => getComputedStyle(el).color),
    ).toBe(await inkColour(page));
    const copy = page.locator('.marquee-row ul[aria-hidden="true"]').first();
    expect(await copy.evaluate((el) => getComputedStyle(el).display)).toBe('none');
    expect(
      await page
        .locator('.marquee-row')
        .first()
        .evaluate((el) => getComputedStyle(el).flexWrap),
    ).toBe('wrap');
  });
});
