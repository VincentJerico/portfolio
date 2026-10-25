import { expect, test, type Page } from '@playwright/test';
import { waitForHydration } from '../helpers/hydration';

const SUMMARY = /^\d+ passed, \d+ failed(, \d+ not measured)? in \d+(\.\d+)?s$/;

/** The focused element's label, if the runner panel covers it completely; otherwise nothing. */
async function focusHiddenUnderPanel(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    const sheet = document.querySelector('[data-runner-panel]');
    if (!el || !sheet || sheet.contains(el)) return [];
    const r = el.getBoundingClientRect();
    const p = sheet.getBoundingClientRect();
    const inside = r.top >= p.top && r.bottom <= p.bottom && r.left >= p.left && r.right <= p.right;
    return inside ? [el.textContent?.trim().slice(0, 40) || el.tagName] : [];
  });
}

/** Clicks a visible trigger; on phones without one in the page, opens the menu drawer first. */
async function openRunner(page: Page) {
  const visible = page
    .getByRole('button', { name: 'Run tests on this page' })
    .filter({ visible: true });
  if ((await visible.count()) === 0) {
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
  }
  await visible.first().click();
}

async function runSuite(page: Page) {
  await openRunner(page);
  const panel = page.getByRole('region', { name: 'Test run' });
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
  await expect(
    page.getByRole('button', { name: 'Run tests on this page' }).filter({ visible: true }).first(),
  ).toBeVisible();
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
    await expect(panel.locator('[data-check="Security headers"]')).toContainText(/PASS/);
  });
}

test('focus moves into the panel and returns to the trigger on close', async ({ page }) => {
  await page.goto('/projects');
  await page.setViewportSize({ width: 1280, height: 800 });
  const trigger = page
    .getByRole('button', { name: 'Run tests on this page' })
    .filter({ visible: true })
    .first();
  await trigger.focus();
  await page.keyboard.press('Enter');
  const panel = page.getByRole('region', { name: 'Test run' });
  await expect(panel).toBeVisible();
  expect(await panel.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('a run started from the mobile menu still scans the page (no inert page)', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/projects');
  await waitForHydration(page);
  await page.evaluate(() => {
    const img = document.createElement('img');
    img.src = '/images/profile/vincent-portrait.jpg';
    document.querySelector('main')!.append(img);
  });
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await page
    .locator('#site-drawer')
    .getByRole('button', { name: 'Run tests on this page' })
    .click();
  const panel = page.getByRole('region', { name: 'Test run' });
  await expect(panel.getByRole('status')).toHaveText(SUMMARY, { timeout: 20_000 });
  await expect(page.locator('#site-drawer')).toBeHidden();
  // Name the rule: a generic FAIL could come from another rule while axe skips most of the page.
  await expect(panel.locator('[data-check="Accessibility"]')).toContainText('image-alt');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeFocused();
});

test('a double click opens a single panel', async ({ page }) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Run tests on this page' })
    .filter({ visible: true })
    .first()
    .dblclick();
  await expect(page.getByRole('region', { name: 'Test run' })).toHaveCount(1);
});

test('closing mid-run leaves no errors behind', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(err.message));
  await page.goto('/');
  await openRunner(page);
  await page.keyboard.press('Escape');
  // Give the abandoned run time to finish in the background, then check nothing threw.
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 3000)));
  expect(errors).toEqual([]);
});

test('self-test: the checks fail when the page is broken', async ({ page }) => {
  await page.goto('/about');
  await waitForHydration(page);
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
  const a11y = panel.locator('[data-check="Accessibility"]');
  await expect(a11y).toContainText('image-alt');
  await expect(a11y).toContainText('color-contrast');
  await expect(panel.locator('[data-check="Images"]')).toContainText(/FAIL/);
  await expect(panel.locator('[data-check="Document structure"]')).toContainText(/FAIL/);
});

test.describe('one runner per page', () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test('a second trigger reuses the open panel instead of starting another run', async ({
    page,
  }) => {
    await page.goto('/');
    await page.locator('aside').getByRole('button', { name: 'Run tests on this page' }).click();
    await page.locator('main').getByRole('button', { name: 'Run tests on this page' }).click();
    await expect(page.getByRole('region', { name: 'Test run' })).toHaveCount(1);
    const panel = page.getByRole('region', { name: 'Test run' });
    await expect(panel.getByRole('status')).toHaveText(SUMMARY, { timeout: 20_000 });
    await expect(panel).not.toContainText('could not run');
  });

  test('the panel closes when the visitor navigates away', async ({ page }) => {
    await page.goto('/');
    await page.locator('aside').getByRole('button', { name: 'Run tests on this page' }).click();
    await expect(page.getByRole('region', { name: 'Test run' }).getByRole('status')).toHaveText(
      SUMMARY,
      { timeout: 20_000 },
    );
    await page.locator('aside').getByRole('link', { name: 'Skills', exact: true }).click();
    await expect(page).toHaveURL(/\/skills$/);
    await expect(page.getByRole('region', { name: 'Test run' })).toHaveCount(0);
  });

  test('performance is not measured after an in-app navigation', async ({ page }) => {
    await page.goto('/');
    await page.locator('aside').getByRole('link', { name: 'Skills', exact: true }).click();
    await expect(page).toHaveURL(/\/skills$/);
    await page.locator('aside').getByRole('button', { name: 'Run tests on this page' }).click();
    const perf = page
      .getByRole('region', { name: 'Test run' })
      .locator('[data-check="Performance"]');
    await expect(perf).toContainText('Not measured', { timeout: 20_000 });
    await expect(perf).not.toContainText('PASS');
  });

  test('no focused element hides entirely under the open panel', async ({ page }) => {
    await page.goto('/projects/accessibility-testing');
    await page.locator('aside').getByRole('button', { name: 'Run tests on this page' }).click();
    const panel = page.getByRole('region', { name: 'Test run' });
    await expect(panel.getByRole('status')).toHaveText(SUMMARY, { timeout: 20_000 });
    const hidden: string[] = [];
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab');
      hidden.push(...(await focusHiddenUnderPanel(page)));
    }
    expect(hidden).toEqual([]);
  });

  test('a dialog opened mid-scan makes the accessibility result "not measured", never PASS', async ({
    page,
  }) => {
    await page.goto('/');
    // Hold back axe-core's download so the scan is still running when the dialog opens.
    await page.route('**/_next/static/chunks/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 600));
      await route.continue();
    });
    await page.locator('aside').getByRole('button', { name: 'Run tests on this page' }).click();
    await page.evaluate(() => {
      const dialog = document.createElement('dialog');
      dialog.textContent = 'interrupting dialog';
      document.body.append(dialog);
      setTimeout(() => dialog.showModal(), 300);
    });
    const a11y = page
      .getByRole('region', { name: 'Test run' })
      .locator('[data-check="Accessibility"]');
    await expect(a11y).toContainText('Not measured', { timeout: 20_000 });
  });
});
