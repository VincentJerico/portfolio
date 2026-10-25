import { expect, test } from '@playwright/test';
import { projectBySlug, projectsInOrder } from '../../src/lib/content';
import { severityCounts } from '../../src/lib/labels';

const all = projectsInOrder();

test.describe('projects index', () => {
  test('filter narrows the grid, syncs the URL and announces the count', async ({ page }) => {
    await page.goto('/projects');
    const cards = page.locator('main article');
    await expect(cards).toHaveCount(all.length);
    const status = page.getByRole('status').filter({ hasText: 'Showing' });

    await page.getByRole('button', { name: 'Security', exact: true }).click();
    await expect(cards).toHaveCount(1);
    await expect(page).toHaveURL(/\?category=security$/);
    await expect(status).toHaveText(`Showing 1 of ${all.length} projects`);
    await expect(page.getByRole('button', { name: 'Security', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await page.getByRole('button', { name: 'All', exact: true }).click();
    await expect(cards).toHaveCount(all.length);
    await expect(page).toHaveURL(/\/projects$/);
  });

  test('an unknown category shows everything with All pressed', async ({ page }) => {
    await page.goto('/projects?category=nope');
    await expect(page.locator('main article')).toHaveCount(all.length);
    await expect(page.getByRole('button', { name: 'All', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('a category in the URL is applied on load', async ({ page }) => {
    await page.goto('/projects?category=performance');
    await expect(page.locator('main article')).toHaveCount(1);
  });
});

test.describe('projects index without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('shows every project and no filter buttons', async ({ page }) => {
    await page.goto('/projects?category=security');
    await expect(page.locator('main article')).toHaveCount(all.length);
    await expect(page.getByRole('button', { name: 'Security', exact: true })).toHaveCount(0);
  });
});

test.describe('test report pages', () => {
  for (const project of all) {
    test(`${project.slug} renders as a report`, async ({ page }) => {
      const response = await page.goto(`/projects/${project.slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveText(project.name);
      await expect(page.locator('main')).not.toContainText('`');
    });
  }

  test('severity counts in the run summary equal the rendered tickets', async ({ page }) => {
    const project = projectBySlug('accessibility-testing')!;
    await page.goto(`/projects/${project.slug}`);
    const summary = page.getByRole('region', { name: 'Run summary' });
    for (const { severity, count } of severityCounts(project.findings)) {
      await expect(summary.getByText(new RegExp(`^${count}\\s*${severity}$`, 'i'))).toBeVisible();
      await expect(page.locator(`[data-ticket-severity="${severity}"]`)).toHaveCount(count);
    }
  });

  test('evidence opens in a dialog that traps focus and returns it', async ({ page }) => {
    await page.goto('/projects/accessibility-testing');
    const thumb = page.getByRole('button', { name: /^Enlarge image/ }).first();
    await thumb.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(thumb).toBeFocused();
  });

  test('clicking the backdrop closes the dialog and refocuses the thumbnail', async ({ page }) => {
    await page.goto('/projects/accessibility-testing');
    const thumb = page.getByRole('button', { name: /^Enlarge image/ }).first();
    await thumb.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(thumb).toBeFocused();
  });

  test('LegataLink is a team project with a live link and no repo', async ({ page }) => {
    await page.goto('/projects/legatalink');
    const summary = page.getByRole('region', { name: 'Run summary' });
    await expect(summary).toContainText('Team project');
    await expect(summary.getByRole('link', { name: /^Live site/ })).toBeVisible();
    await expect(summary.getByRole('link', { name: /^Repo/ })).toHaveCount(0);
  });

  test('prev and next links walk the display order', async ({ page }) => {
    await page.goto('/projects/security-testing');
    const nav = page.getByRole('navigation', { name: 'More projects' });
    await expect(nav.getByRole('link', { name: /accessibility-testing/ })).toHaveAttribute(
      'href',
      '/projects/accessibility-testing',
    );
    await expect(nav.getByRole('link', { name: /performance-testing/ })).toHaveAttribute(
      'href',
      '/projects/performance-testing',
    );
  });
});
