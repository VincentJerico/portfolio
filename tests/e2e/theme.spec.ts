import { expect, test } from '../helpers/test';

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

  test('follows a dark OS preference', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveClass(/\bdark\b/);
  });

  test('the light switch flips the theme, exposes aria-pressed and persists across reload', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    // From 1024px up the pull cord is the only theme switch; aria-pressed means the light is on.
    const cord = page.getByRole('button', { name: 'Light switch' });
    await expect(cord).toHaveAttribute('aria-pressed', 'false');
    await cord.click();
    await expect(page.locator('html')).toHaveClass(/\blight\b/);
    await expect(cord).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/\blight\b/);
    await expect(page.getByRole('button', { name: 'Light switch' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('the sidebar has no theme toggle of its own', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('aside').getByRole('button', { name: 'Dark theme' })).toHaveCount(0);
  });
});

test.describe('theme without JavaScript', () => {
  test.use({ javaScriptEnabled: false, colorScheme: 'light' });

  test('falls back to the dark tokens', async ({ page }) => {
    await page.goto('/');
    const bg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--bg').trim().toLowerCase(),
    );
    expect(bg).toBe('#0b0f14');
  });
});

test.describe('theme switch appearance before hydration', () => {
  test.use({ javaScriptEnabled: false, colorScheme: 'dark' });

  test('shows the on state when the page renders dark', async ({ page }) => {
    await page.goto('/');
    // The drawer's switch is closed (not laid out), so read the knob's offset from its style:
    // off hugs the left edge, on moves it 1rem right.
    const shift = await page
      .locator('#site-drawer [data-switch-knob]')
      .evaluate((knob) => getComputedStyle(knob).translate);
    expect(shift).toMatch(/^16px/);
  });
});
