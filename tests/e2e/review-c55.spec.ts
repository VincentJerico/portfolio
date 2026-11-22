import { expect, test } from '../helpers/test';
import { waitForHydration } from '../helpers/hydration';

// C55 final review: one test per finding fixed.
test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

test('the page keeps hash jumps clear of the top bar and its scrollbar room', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('html')).toHaveCSS('scroll-padding-top', '72px');
  await expect(page.locator('html')).toHaveCSS('scrollbar-gutter', 'stable');
});

test('typing in the project search never pushes the page down', async ({ page }) => {
  await page.goto('/projects');
  await waitForHydration(page);
  const status = page.getByRole('status').filter({ hasText: 'Showing' });
  const top = () => status.evaluate((el) => el.getBoundingClientRect().top + scrollY);
  const before = await top();
  await page.getByRole('combobox', { name: 'Search projects' }).fill('testing');
  await expect(page.getByRole('listbox', { name: 'Matching projects' })).toBeVisible();
  expect(await top()).toBe(before);
});

test('a match in the list opens on a plain click (voice control, switch access)', async ({
  page,
}) => {
  await page.goto('/projects');
  await waitForHydration(page);
  await page.getByRole('combobox', { name: 'Search projects' }).fill('testing');
  const option = page.getByRole('option').first();
  const slug = (await option.getAttribute('data-match'))!;
  await option.dispatchEvent('click');
  await expect(page).toHaveURL(new RegExp(`/projects/${slug}$`));
});

test('work rows print their hook, not a blank gap', async ({ page }) => {
  await page.emulateMedia({ media: 'print' });
  await page.goto('/');
  await expect(page.locator('.work-row-hook').first()).toHaveCSS('clip-path', 'none');
});

test('the cord names its pull on its own paper, never over the text beside it', async ({
  page,
}) => {
  await page.goto('/about');
  await page.locator('.pull-cord-button').focus();
  const label = page.locator('.cord-label');
  await expect(label).toHaveCSS('opacity', '1');
  const bg = await label.evaluate((el) => getComputedStyle(el).backgroundColor);
  expect(bg).not.toMatch(/rgba\(0, 0, 0, 0\)|transparent/);
});
