import { expect, test } from '@playwright/test';

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

  test('toggle flips the theme, exposes aria-pressed and persists across reload', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Dark theme' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await toggle.click();
    await expect(page.locator('html')).toHaveClass(/\blight\b/);
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/\blight\b/);
    await expect(page.getByRole('button', { name: 'Dark theme' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
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
    const shift = await page.locator('aside [data-switch-knob]').evaluate((knob) => {
      const track = knob.parentElement!.getBoundingClientRect();
      const box = knob.getBoundingClientRect();
      // Off: knob hugs the left edge (2px inset). On: it sits in the right half.
      return box.left - track.left;
    });
    expect(shift).toBeGreaterThan(8);
  });
});
