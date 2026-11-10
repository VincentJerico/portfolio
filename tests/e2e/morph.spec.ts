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

test.describe('sidebar marker', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('one named marker sits in the active row, so it glides between pages', async ({ page }) => {
    await page.goto('/about');
    const markers = page.locator('aside [data-nav-marker]');
    await expect(markers).toHaveCount(1);
    await expect(page.locator('aside a[aria-current="page"] [data-nav-marker]')).toHaveCount(1);
    await expect(markers).toHaveCSS('view-transition-name', 'nav-active-sidebar');
    await page.locator('aside a[href="/skills"]').click();
    await expect(page).toHaveURL(/\/skills$/);
    await expect(page.locator('aside a[aria-current="page"] [data-nav-marker]')).toHaveCount(1);
  });

  test('on a report page only the project row holds the marker, never two', async ({ page }) => {
    await page.goto('/projects/accessibility-testing');
    await expect(page.locator('aside [data-nav-marker]')).toHaveCount(1);
    await expect(
      page.locator('aside a[href="/projects/accessibility-testing"] [data-nav-marker]'),
    ).toHaveCount(1);
  });
});
