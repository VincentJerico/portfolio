import { expect, test } from '../helpers/test';
import { navItems } from '../../src/lib/nav-items';
import { projectsInOrder } from '../../src/lib/content';
import { qualityReport as report } from '../../src/lib/quality-report';
import { runSummaryLine, siteStatus } from '../../src/lib/quality';

const CHIP = { pass: 'PASS', fail: 'FAIL', 'not-run': 'not run' } as const;
// A sample report must never read as passing; a real one shows exactly what CI recorded.
const statusText = {
  summary: runSummaryLine(report),
  chip: CHIP[siteStatus(report)],
  never: report.sample ? /passing|PASS/ : /not run yet/,
};

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

test('sidebar statuses come from the committed report, never a pass it did not earn', async ({
  page,
}) => {
  await page.goto('/');
  const sidebar = page.locator('aside');
  await expect(sidebar).toContainText(statusText.summary);
  await expect(sidebar).not.toContainText(statusText.never);
  await expect(sidebar.getByRole('link', { name: /Site checks/ })).toContainText(statusText.chip);
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
