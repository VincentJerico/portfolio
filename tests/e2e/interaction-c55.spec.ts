import { expect, test } from '../helpers/test';
import { waitForHydration } from '../helpers/hydration';

// C55, Vincent's second list (2026-11-22): interaction details.

test.describe('interaction', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  for (const [outcome, settle] of [
    ['slow', 'resolve'],
    ['refused', 'reject'],
  ] as const) {
    test(`D6: the copy button answers at once, even when the clipboard is ${outcome}`, async ({
      page,
    }) => {
      await page.addInitScript((how) => {
        Object.defineProperty(navigator, 'clipboard', {
          value: {
            writeText: () =>
              new Promise<void>((resolve, reject) =>
                setTimeout(
                  () => (how === 'resolve' ? resolve() : reject(new Error('denied'))),
                  1000,
                ),
              ),
          },
        });
      }, settle);
      await page.goto('/contact');
      await waitForHydration(page);
      const button = page.getByRole('button', { name: 'Copy email' });
      await button.click();
      const swap = button.locator('.icon-swap');
      // The check shows before the clipboard has answered.
      await expect(swap).toHaveAttribute('data-show', 'second', { timeout: 300 });
      await expect(swap).toHaveAttribute('data-show', outcome === 'slow' ? 'second' : 'first', {
        timeout: 2000,
      });
      await expect(page.getByRole('status').filter({ hasText: /Cop/ })).toHaveText(
        outcome === 'slow' ? 'Copied to clipboard' : /Copy failed/,
      );
    });
  }

  test('D17: the project search is a combobox with a list of matches', async ({ page }) => {
    await page.goto('/projects');
    await waitForHydration(page);
    const search = page.getByRole('combobox', { name: 'Search projects' });
    await expect(search).toHaveAttribute('aria-expanded', 'false');
    await search.fill('testing');
    await expect(search).toHaveAttribute('aria-expanded', 'true');
    const options = page.getByRole('listbox', { name: 'Matching projects' }).getByRole('option');
    const count = await options.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(6);
    await search.press('ArrowDown');
    const first = options.first();
    await expect(search).toHaveAttribute(
      'aria-activedescendant',
      (await first.getAttribute('id'))!,
    );
    await expect(first).toHaveAttribute('aria-selected', 'true');
    const slug = (await first.getAttribute('data-match'))!;
    await search.press('Enter');
    await expect(page).toHaveURL(new RegExp(`/projects/${slug}$`));
  });

  test('D17: Escape closes the list first, then clears the search', async ({ page }) => {
    await page.goto('/projects');
    await waitForHydration(page);
    const search = page.getByRole('combobox', { name: 'Search projects' });
    await search.fill('testing');
    await search.press('Escape');
    await expect(search).toHaveAttribute('aria-expanded', 'false');
    await expect(search).toHaveValue('testing');
    await search.press('Escape');
    await expect(search).toHaveValue('');
  });

  test('D19: About shows three certifications until asked for the rest', async ({ page }) => {
    await page.goto('/about');
    const section = page.locator('#certifications');
    const all = await section.locator('li').count();
    expect(all).toBeGreaterThan(3);
    await expect(section.locator('li:visible')).toHaveCount(3);
    await section.getByText(`Show all ${all} certifications`).click();
    await expect(section.locator('li:visible')).toHaveCount(all);
  });

  test('D19: report and Quality tables open on demand, with every row inside', async ({ page }) => {
    for (const path of ['/projects/accessibility-testing', '/quality']) {
      await page.goto(path);
      const tables = page.locator('main details table');
      expect(await tables.count(), path).toBeGreaterThan(0);
      const rows = await page.locator('main details table tr').count();
      await expect(tables.first()).toBeHidden();
      for (const summary of await page.locator('main details > summary').all())
        await summary.click();
      await expect(tables.first()).toBeVisible();
      await expect(page.locator('main details table tr')).toHaveCount(rows);
    }
  });

  test('D19: print shows every disclosure open', async ({ page }) => {
    await page.emulateMedia({ media: 'print' });
    await page.goto('/about');
    const section = page.locator('#certifications');
    await expect(section.locator('li:visible')).toHaveCount(await section.locator('li').count());
  });

  test('D11: theme-color follows the paper and the slate', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('meta[name="theme-color"][media*="light"]')).toHaveAttribute(
      'content',
      '#efe9de',
    );
    await expect(page.locator('meta[name="theme-color"][media*="dark"]')).toHaveAttribute(
      'content',
      '#151c26',
    );
  });
});
