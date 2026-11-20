import { expect, test, type Page } from '../helpers/test';
import { focusEntirelyObscured } from '../helpers/a11y';
import { waitForHydration } from '../helpers/hydration';
import { tabKey } from '../helpers/keys';

// C53: the pull cord is back as the theme switch from 1024 px up, with its own motion. It is the same
// control as the top bar's "Dark" button (same name, aria-pressed means dark), which takes over below.

const header = (page: Page) => page.locator('[data-site-header]');
const visibleSwitch = (page: Page) => header(page).getByRole('button', { name: 'Dark theme' });
const cord = (page: Page) => header(page).locator('[data-pull-cord]');

test.describe('on a wide screen', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('the cord is the one visible theme switch', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    await expect(visibleSwitch(page)).toHaveCount(1);
    await expect(visibleSwitch(page).locator('[data-pull-cord]')).toHaveCount(1);
    // Easy to hit: at least 44 px tall.
    const box = (await visibleSwitch(page).boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
    // Final review (C53) #5: it stays in the 40 px side gutter, never over the content beside it.
    const width = await page.evaluate(() => document.documentElement.clientWidth);
    expect(box.x).toBeGreaterThanOrEqual(width - 40);
    expect(box.width).toBeGreaterThanOrEqual(24);
  });

  // Final review (C53) #6: in forced colours (Windows high contrast) the cord stays drawn. Forced
  // colours exist only in Windows browsers (Chromium, Firefox); WebKit has no such mode.
  test('the cord stays drawn in forced colours', { tag: '@chromium-only' }, async ({ page }) => {
    await page.emulateMedia({ forcedColors: 'active' });
    await page.goto('/');
    const line = await header(page)
      .locator('.cord-line')
      .evaluate((el) => {
        const style = getComputedStyle(el);
        return { adjust: style.forcedColorAdjust, background: style.backgroundColor };
      });
    expect(line.adjust).toBe('none');
    expect(line.background).not.toBe('rgba(0, 0, 0, 0)');
  });

  test('a tug switches the theme, floods it and swings the cord', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await waitForHydration(page);
    const toggle = visibleSwitch(page);
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    await expect(page.locator('html')).toHaveClass(/\bdark\b/);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect
      .poll(() => cord(page).evaluate((el) => getComputedStyle(el).animationName))
      .toContain('cord-tug');
  });

  // Clicks during the flood land on the page, not the cord, so the race is driven from the keyboard.
  test('two quick tugs end in a consistent state', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await waitForHydration(page);
    const toggle = visibleSwitch(page);
    await toggle.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Enter');
    await expect
      .poll(async () => {
        const dark = await page.evaluate(() => document.documentElement.classList.contains('dark'));
        return (await toggle.getAttribute('aria-pressed')) === String(dark);
      })
      .toBe(true);
  });

  test('it settles from a short swing on arrival, then hangs still', async ({ page }) => {
    await page.goto('/');
    const timing = await header(page)
      .locator('.cord-sway')
      .evaluate((el) => {
        const style = getComputedStyle(el);
        return {
          name: style.animationName,
          count: style.animationIterationCount,
          seconds: parseFloat(style.animationDuration) * Number(style.animationIterationCount),
        };
      });
    expect(timing.name).toBe('cord-settle');
    expect(Number.isFinite(Number(timing.count))).toBe(true);
    expect(timing.seconds).toBeLessThan(3);
  });

  test('in the dark theme the knob glows like a lit bulb', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    const glow = await header(page)
      .locator('.cord-knob')
      .evaluate((el) => getComputedStyle(el).boxShadow);
    expect(glow).not.toBe('none');
  });

  test('the keyboard reaches it after the top bar links, and its focus is never hidden', async ({
    page,
    browserName,
  }) => {
    await page.goto('/');
    await waitForHydration(page);
    await header(page)
      .locator('nav[aria-label="Site"]')
      .getByRole('link', { name: 'Contact', exact: true })
      .focus();
    await page.keyboard.press(tabKey(browserName));
    await expect(visibleSwitch(page)).toBeFocused();
    expect(await focusEntirelyObscured(page)).toBe(false);
  });

  test('under reduced motion nothing swings, and a tug still switches the theme', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto('/');
    await waitForHydration(page);
    const names = await header(page)
      .locator('.cord-sway, [data-pull-cord]')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
    expect(new Set(names)).toEqual(new Set(['none']));
    await visibleSwitch(page).click();
    await expect(page.locator('html')).toHaveClass(/\bdark\b/);
  });
});

test.describe('below 1024 px', () => {
  test.use({ viewport: { width: 1023, height: 800 }, isMobile: false, hasTouch: false });

  test('the top bar button is the theme switch, and the cord is away', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    await expect(visibleSwitch(page)).toHaveCount(1);
    await expect(visibleSwitch(page).locator('[data-pull-cord]')).toHaveCount(0);
    await expect(cord(page)).toBeHidden();
  });
});

// Final review (C53) #2: the cord and the top bar button switch at the same width whatever the
// browser's default font size, so exactly one theme switch shows. Chromium sets font sizes over CDP.
test.describe('at other default font sizes', { tag: '@chromium-only' }, () => {
  for (const size of [12, 20]) {
    for (const width of [900, 1100]) {
      test(`exactly one theme switch shows at ${size} px text and ${width} px`, async ({
        page,
      }) => {
        const cdp = await page.context().newCDPSession(page);
        await cdp.send('Page.enable');
        await cdp.send('Page.setFontSizes', { fontSizes: { standard: size } });
        await page.setViewportSize({ width, height: 800 });
        await page.goto('/');
        await waitForHydration(page);
        await expect(visibleSwitch(page)).toHaveCount(1);
      });
    }
  }
});
