import { expect, test } from '../helpers/test';
import { waitForHydration } from '../helpers/hydration';

// C56 (Vincent, 2026-11-22: "add a cool page loader", then "Intro on first visit"): a paper intro
// counts to 100 and lifts away, once per visit, without holding the page back.
test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

test('the intro counts to 100 over the page, then lifts away', async ({ page }) => {
  await page.goto('/');
  const intro = page.locator('[data-intro]');
  await expect(intro).toBeVisible();
  await expect(intro).toHaveAttribute('aria-hidden', 'true');
  await expect(intro).toHaveCSS('pointer-events', 'none');
  // The page is there underneath from the start: the title is already in the document and painted.
  await expect(page.locator('[data-poster]')).toBeVisible();
  await expect(intro).toHaveCSS('animation-name', /intro-lift/);
  await expect(intro).toBeHidden({ timeout: 4000 });
});

test('a page change does not replay the intro', async ({ page }) => {
  await page.goto('/');
  await waitForHydration(page);
  await expect(page.locator('[data-intro]')).toBeHidden({ timeout: 4000 });
  const link = page
    .locator('[data-site-header] nav[aria-label="Site"]')
    .getByRole('link', { name: 'About' });
  const box = (await link.boundingBox())!;
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect(page).toHaveURL(/\/about$/);
  // Gone from the page with the first change, so the new page's title rises at once.
  await expect(page.locator('[data-intro]')).toHaveCount(0);
  await expect(page.locator('main header h1 .letter').first()).toHaveCSS('animation-delay', '0s');
});

test('the title waits for the intro to lift before it rises', async ({ page }) => {
  await page.goto('/about');
  const delay = await page
    .locator('main header h1 .letter')
    .first()
    .evaluate((el) => parseFloat(getComputedStyle(el).animationDelay));
  expect(delay).toBeGreaterThanOrEqual(1);
});

test('under reduced motion there is no intro', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('[data-intro]')).toBeHidden();
});

test('print has no intro', async ({ page }) => {
  await page.emulateMedia({ media: 'print' });
  await page.goto('/');
  await expect(page.locator('[data-intro]')).toBeHidden();
});
