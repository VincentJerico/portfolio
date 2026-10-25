import { expect, test, type Page } from '@playwright/test';

const SUMMARY = /^\d+ passed, \d+ failed in \d+(\.\d+)?s$/;

async function runSuite(page: Page) {
  await page.getByRole('button', { name: 'Run tests on this page' }).first().click();
  const panel = page.getByRole('dialog', { name: 'Test run' });
  await expect(panel).toBeVisible();
  await expect(panel.getByRole('status')).toHaveText(SUMMARY, { timeout: 20_000 });
  return panel;
}

test('axe-core is not downloaded until the visitor runs the suite', async ({ page }) => {
  const bodies: string[] = [];
  page.on('response', async (res) => {
    if (res.request().resourceType() === 'script') bodies.push(await res.text());
  });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Run tests on this page' }).first()).toBeVisible();
  expect(bodies.some((b) => b.includes('axe-core'))).toBe(false);
  await runSuite(page);
  expect(bodies.some((b) => b.includes('axe-core'))).toBe(true);
});

for (const route of ['/', '/projects', '/projects/accessibility-testing']) {
  test(`all six checks report on ${route}`, async ({ page }) => {
    await page.goto(route);
    const panel = await runSuite(page);
    for (const name of [
      'Accessibility',
      'Document structure',
      'Images',
      'Links',
      'Security headers',
      'Performance',
    ]) {
      await expect(panel.locator(`[data-check="${name}"]`)).toHaveCount(1);
    }
    await expect(panel.locator('[data-check="Accessibility"]')).toContainText(/PASS/);
  });
}

test('focus moves into the panel and returns to the trigger on close', async ({ page }) => {
  await page.goto('/projects');
  const trigger = page.getByRole('button', { name: 'Run tests on this page' }).first();
  await trigger.focus();
  await page.keyboard.press('Enter');
  const panel = page.getByRole('dialog', { name: 'Test run' });
  await expect(panel).toBeVisible();
  expect(await panel.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('a double click opens a single panel', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Run tests on this page' }).first().dblclick();
  await expect(page.getByRole('dialog', { name: 'Test run' })).toHaveCount(1);
});

test('closing mid-run leaves no errors behind', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  await page.goto('/');
  await page.getByRole('button', { name: 'Run tests on this page' }).first().click();
  await page.keyboard.press('Escape');
  // Give the abandoned run time to finish in the background, then check nothing threw.
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 3000)));
  expect(errors).toEqual([]);
});

test('self-test: the checks fail when the page is broken', async ({ page }) => {
  await page.goto('/about');
  await page.evaluate(() => {
    const img = document.createElement('img');
    img.src = '/images/profile/vincent-portrait.jpg';
    img.width = 10;
    img.height = 10;
    const faint = document.createElement('p');
    faint.textContent = 'Planted low-contrast text';
    faint.style.color = '#cccccc';
    faint.style.background = '#ffffff';
    const h4 = document.createElement('h4');
    h4.textContent = 'Planted skipped heading';
    document.querySelector('main')!.append(img, faint, h4);
  });
  const panel = await runSuite(page);
  await expect(panel.locator('[data-check="Accessibility"]')).toContainText(/FAIL/);
  await expect(panel.locator('[data-check="Images"]')).toContainText(/FAIL/);
  await expect(panel.locator('[data-check="Document structure"]')).toContainText(/FAIL/);
});
