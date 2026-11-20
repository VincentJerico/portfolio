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
    expect((await visibleSwitch(page).boundingBox())!.height).toBeGreaterThanOrEqual(44);
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

  test('two quick tugs end in a consistent state', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await waitForHydration(page);
    const toggle = visibleSwitch(page);
    await toggle.click();
    await toggle.click();
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
