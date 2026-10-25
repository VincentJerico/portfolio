import { expect, test } from '@playwright/test';
import { education, profile } from '../../src/content';
import { loadDenylist } from '../helpers/denylist';
import { pdfText } from '../helpers/pdf-text';

test('resume shows the GPA with its scale note and a PDF download', async ({ page }) => {
  await page.goto('/resume');
  await expect(page.locator('h1')).toHaveText(profile.fullName);
  await expect(page.locator('main')).toContainText(education[0]!.gpa!);
  await expect(page.getByRole('link', { name: 'Download PDF' })).toHaveAttribute(
    'href',
    profile.cvPdf,
  );
});

test('print layout drops the site chrome and prints black on white', async ({ page }) => {
  await page.goto('/resume');
  await page.emulateMedia({ media: 'print' });
  await expect(page.locator('aside')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeHidden();
  await expect(page.getByRole('link', { name: 'Download PDF' })).toBeHidden();
  const colors = await page.evaluate(() => {
    const style = getComputedStyle(document.body);
    return { color: style.color, background: style.backgroundColor };
  });
  expect(colors).toEqual({ color: 'rgb(0, 0, 0)', background: 'rgb(255, 255, 255)' });
});

test('the generated CV is a 1-2 page PDF', async ({ request }) => {
  const response = await request.get(profile.cvPdf);
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/pdf');
  const body = (await response.body()).toString('latin1');
  const pages = body.match(/\/Type\s*\/Page(?!s)/g)?.length ?? 0;
  expect(pages).toBeGreaterThanOrEqual(1);
  expect(pages).toBeLessThanOrEqual(2);
});

test('the CV text reads cleanly for parsers and carries no private data', async ({ request }) => {
  const text = await pdfText(new Uint8Array(await (await request.get(profile.cvPdf)).body()));
  expect(text).toContain(profile.fullName);
  expect(text).toContain(profile.email);
  expect(text).not.toMatch(/(\+63|0)9\d{2}[\s-]?\d{3}[\s-]?\d{4}/);
  const lower = text.toLowerCase();
  const leaked = loadDenylist().filter((term) => lower.includes(term.toLowerCase()));
  // Assert on a boolean so a failure never prints the private terms.
  expect(leaked.length === 0, `${leaked.length} denylisted term(s) in the CV`).toBe(true);
});
