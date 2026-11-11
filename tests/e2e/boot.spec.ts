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

test.describe('first-visit boot cleanup', () => {
  test.use({ skipBoot: false });

  test('clears its flag when done, so printing or a motion change never replays it', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-boot', '');
    await expect(page.locator('html')).not.toHaveAttribute('data-boot', /.*/, { timeout: 4000 });
  });

  test('ends at once on the first key press, so focus is never hidden behind it', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-boot', '');
    await page.keyboard.press('Tab');
    await expect(page.locator('html')).not.toHaveAttribute('data-boot', /.*/, { timeout: 300 });
  });
});

test.describe('first-visit boot shutter', () => {
  test.use({ skipBoot: false });

  test('opens like a shutter: two halves part along the hairline', async ({ page }) => {
    await page.goto('/');
    const overlay = page.locator('[data-boot-overlay]');
    await expect(overlay.locator('.boot-half')).toHaveCount(2);
    await expect(overlay).toBeHidden({ timeout: 3000 });
  });

  test('covers the content area and leaves the sidebar on screen', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const overlay = page.locator('[data-boot-overlay]');
    const box = (await overlay.boundingBox())!;
    const sidebar = (await page.locator('aside').first().boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(sidebar.x + sidebar.width - 1);
  });
});
