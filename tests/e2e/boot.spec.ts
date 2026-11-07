import { expect, test } from '../helpers/test';

test.describe('first-visit boot', () => {
  test.use({ skipBoot: false });

  test('runs on the first page of a session, never blocks a click, then stays away', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-boot', '');
    await expect(page.locator('[data-boot-overlay]')).toHaveCSS('pointer-events', 'none');
    await page.getByRole('link', { name: 'View projects' }).click();
    await expect(page).toHaveURL(/\/projects$/);
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveAttribute('data-boot', /.*/);
  });

  test('never runs under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('html')).not.toHaveAttribute('data-boot', /.*/);
  });

  test('is gone from view once it finishes', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-boot-overlay]')).toBeHidden({ timeout: 3000 });
  });
});
