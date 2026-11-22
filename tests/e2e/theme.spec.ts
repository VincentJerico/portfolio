import { expect, test } from '../helpers/test';
import { sameColour, srgb } from '../helpers/colour';

test.describe('theme', () => {
  test('follows a light OS preference on first paint without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
    page.on('pageerror', (err) => errors.push(err.message));
    await page.emulateMedia({ colorScheme: 'light' });
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        document.documentElement.dataset.classAtDcl = document.documentElement.className;
      });
    });
    await page.goto('/');
    // Read the class as it was before any later script could fix it, so a flash would fail.
    await expect(page.locator('html')).toHaveAttribute('data-class-at-dcl', /\blight\b/);
    expect(errors).toEqual([]);
  });

  test('follows a dark OS preference on first paint', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.addInitScript(() => {
      document.addEventListener('DOMContentLoaded', () => {
        document.documentElement.dataset.classAtDcl = document.documentElement.className;
      });
    });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-class-at-dcl', /\bdark\b/);
  });

  test('the switch in the top bar flips the theme, exposes aria-pressed and persists', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const toggle = page
      .locator('[data-site-header]')
      .getByRole('button', { name: 'Dark theme', exact: true });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    await expect(page.locator('html')).toHaveClass(/\bdark\b/);
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/\bdark\b/);
    await expect(
      page.locator('[data-site-header]').getByRole('button', { name: 'Dark theme', exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');
  });
});

test.describe('theme without JavaScript', () => {
  test.use({ javaScriptEnabled: false, colorScheme: 'dark' });

  test('falls back to the paper tokens (C51)', async ({ page }) => {
    await page.goto('/');
    const bg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--bg').trim().toLowerCase(),
    );
    expect(sameColour(await srgb(page, bg), [239, 233, 222])).toBe(true);
  });
});
