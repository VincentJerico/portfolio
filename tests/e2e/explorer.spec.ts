import { expect, test } from '@playwright/test';
import { navItems } from '../../src/lib/nav-items';
import { projectsInOrder } from '../../src/lib/content';

test.use({ viewport: { width: 1280, height: 900 } });

test('sidebar is a nav of nested lists whose link names equal the page names', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Site' });
  await expect(nav.locator(':scope > ul > li')).toHaveCount(navItems().length);
  for (const { label } of navItems()) {
    await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible();
  }
});

test('Projects folder expands to one spec per project', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Site' });
  const folder = nav.getByRole('button', { name: 'Project specs' });
  await expect(folder).toHaveAttribute('aria-expanded', 'false');
  await folder.click();
  await expect(folder).toHaveAttribute('aria-expanded', 'true');
  for (const project of projectsInOrder()) {
    await expect(nav.getByRole('link', { name: project.name, exact: true })).toBeVisible();
  }
});

test('with the sample report every status reads "not run", never passing', async ({ page }) => {
  await page.goto('/');
  const sidebar = page.locator('aside');
  await expect(sidebar).toContainText('not run yet');
  await expect(sidebar.getByText('not run', { exact: true }).first()).toBeAttached();
  await expect(sidebar).not.toContainText(/passing|PASS/);
  await expect(sidebar.getByRole('link', { name: /Site checks/ })).toContainText('not run');
});

test('coverage counts the pages this visitor has opened', async ({ page }) => {
  await page.goto('/');
  const line = page.locator('aside').getByText(/You've covered/);
  await expect(line).toHaveText(`You've covered 1 of ${navItems().length} pages`);
  await page.locator('aside').getByRole('link', { name: 'About', exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(line).toHaveText(`You've covered 2 of ${navItems().length} pages`);
});

test('coverage still works for the visit when localStorage throws', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('blocked');
      },
    });
  });
  await page.goto('/');
  await page.locator('aside').getByRole('link', { name: 'Skills', exact: true }).click();
  await expect(page.locator('aside').getByText(/You've covered 2 of/)).toBeVisible();
});
