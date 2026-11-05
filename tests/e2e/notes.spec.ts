import { expect, test } from '../helpers/test';
import { expectNoViolations } from '../helpers/a11y';
import { waitForHydration } from '../helpers/hydration';
import { visibleNotes } from '../../src/content/notes';

// The test build (E2E_SELFTEST=1) shows the selftest note; a production build shows no notes at all.
const [note] = visibleNotes();

test('the notes index lists the selftest note and the sidebar links to Notes', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/notes');
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('link', { name: note!.title })).toHaveAttribute(
    'href',
    `/notes/${note!.slug}`,
  );
  await expect(page.getByText(note!.summary)).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: 'Site' }).getByRole('link', { name: 'Notes' }),
  ).toBeVisible();
});

test('a note renders its MDX: one h1, a heading, a list, a link and code', async ({ page }) => {
  await page.goto(`/notes/${note!.slug}`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(note!.title);
  const article = page.locator('article');
  await expect(article.getByRole('heading', { level: 2, name: 'What it covers' })).toBeVisible();
  await expect(article.locator('ul > li')).toHaveCount(2);
  await expect(article.getByRole('link', { name: 'quality page' })).toHaveAttribute(
    'href',
    '/quality',
  );
  await expect(article.locator('code')).toHaveText('inline code');
});

test('an unknown note is a 404', async ({ page }) => {
  expect((await page.goto('/notes/does-not-exist'))?.status()).toBe(404);
});

test('a note has no horizontal overflow at 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(`/notes/${note!.slug}`);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} theme`, () => {
    test.use({ colorScheme: scheme });
    for (const route of ['/notes', `/notes/${note!.slug}`]) {
      test(`${route} has no WCAG violations`, async ({ page }, testInfo) => {
        await page.goto(route);
        await waitForHydration(page);
        await expectNoViolations(page, testInfo);
      });
    }
  });
}
