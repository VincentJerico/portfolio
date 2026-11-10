import { expect, test } from '../helpers/test';
import { profile, skills } from '../../src/content';

test.describe('client work', () => {
  test('lists the role, the confidentiality note and three case studies', async ({ page }) => {
    await page.goto('/work');
    await expect(page.locator('main')).toContainText(
      'Client names, data and screenshots are withheld.',
    );
    await expect(page.getByRole('link', { name: /^Read the case study/ })).toHaveCount(3);
    await expect(page.locator('main img')).toHaveCount(0);
  });

  test('the in-progress case study says so and has no images', async ({ page }) => {
    await page.goto('/work/retail-operations-platform');
    await expect(page.locator('h1')).toHaveText('Fine-jewelry retail operations platform');
    await expect(page.locator('main')).toContainText('Currently testing');
    await expect(page.locator('main img')).toHaveCount(0);
  });

  test('an unknown case study is a 404', async ({ page }) => {
    const response = await page.goto('/work/unknown');
    expect(response?.status()).toBe(404);
  });
});

test('skills shows every group with evidence and a separate learning group', async ({ page }) => {
  await page.goto('/skills');
  const proven = skills.filter((s) => !s.learning);
  await expect(page.getByRole('heading', { level: 2, name: 'Learning' })).toBeVisible();
  for (const group of proven) {
    await expect(
      page.getByRole('heading', { level: 3, name: group.group, exact: true }),
    ).toBeVisible();
  }
});

test.describe('about', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/about');
  });

  test('has the anchored sections', async ({ page }) => {
    for (const id of ['certifications', 'method', 'timeline']) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
  });

  test('career path marks the internship done, the present role current, the rest next', async ({
    page,
  }) => {
    // docs/01-PORTFOLIO-DATA.md: "Current role | Software QA/QC Engineer at BossLabs.AI".
    const steps = page.getByRole('list', { name: 'Career path' }).getByRole('listitem');
    await expect(steps).toHaveCount(4);
    await expect(steps.nth(0)).toContainText('done');
    await expect(steps.nth(1)).toContainText('current');
    await expect(steps.nth(2)).toContainText('next');
    await expect(steps.nth(3)).toContainText('next');
  });

  test('never shows the GPA', async ({ page }) => {
    await expect(page.locator('main')).not.toContainText('1.80');
  });

  test('links the capstone report', async ({ page }) => {
    await expect(page.getByRole('link', { name: /LegataLink/ }).first()).toHaveAttribute(
      'href',
      '/projects/legatalink',
    );
  });
});

test.describe('contact', () => {
  // Both projects run Chromium, where clipboard permissions can be granted.
  test('copies the email and confirms it', { tag: '@chromium-only' }, async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/contact');
    await expect(page.locator('main')).toContainText(profile.email);
    await page.getByRole('button', { name: 'Copy email' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Copied' })).toHaveText(
      'Copied to clipboard',
    );
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(profile.email);
  });

  test('reports a failed copy instead of a false success', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: () => Promise.reject(new Error('denied')) },
      });
    });
    await page.goto('/contact');
    await page.getByRole('button', { name: 'Copy email' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Copy' })).toHaveText(
      'Copy failed — select the address instead',
    );
  });
});
