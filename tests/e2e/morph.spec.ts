import { expect, test, type Page } from '../helpers/test';
import { waitForHydration } from '../helpers/hydration';

/** Records the types of every view transition the page starts. */
async function recordTransitions(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __vt: string[][] };
    w.__vt = [];
    const start = document.startViewTransition?.bind(document);
    if (!start) return;
    document.startViewTransition = ((arg: unknown) => {
      const types =
        arg && typeof arg === 'object' && 'types' in arg
          ? [...((arg as { types: string[] }).types ?? [])]
          : [];
      w.__vt.push(types);
      return start(arg as never);
    }) as typeof document.startViewTransition;
  });
}
const transitions = (page: Page) =>
  page.evaluate(() => (window as unknown as { __vt: string[][] }).__vt);

test.describe('theme flood', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('the light switch floods the page with the new theme from the cord', async ({ page }) => {
    await recordTransitions(page);
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await waitForHydration(page);
    await page.getByRole('button', { name: 'Light switch' }).click();
    await expect(page.locator('html')).toHaveClass(/\blight\b/);
    expect((await transitions(page)).some((types) => types.includes('theme'))).toBe(true);
  });

  test('under reduced motion the theme switches with no transition', async ({ page }) => {
    await recordTransitions(page);
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.goto('/');
    await waitForHydration(page);
    await page.getByRole('button', { name: 'Light switch' }).click();
    await expect(page.locator('html')).toHaveClass(/\blight\b/);
    expect((await transitions(page)).some((types) => types.includes('theme'))).toBe(false);
  });
});
