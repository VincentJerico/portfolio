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

test('the top bar is a nav whose link names equal the page names', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Site' });
  await expect(nav.locator(':scope > ul > li')).toHaveCount(navItems().length);
  for (const { label } of navItems()) {
    await expect(nav.getByRole('link', { name: label, exact: true })).toBeVisible();
  }
});

test('the Projects menu lists one spec per project', async ({ page }) => {
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

test('status bar statuses come from the committed report, never a pass it did not earn', async ({
  page,
}) => {
  await page.goto('/');
  const bar = page.locator('[data-statusbar]');
  await expect(bar).toContainText(statusText.summary);
  await expect(bar).not.toContainText(statusText.never);
  await expect(bar.getByRole('link', { name: /Site checks/ })).toContainText(statusText.chip);
});

test('coverage counts the pages this visitor has opened', async ({ page }) => {
  await page.goto('/');
  const line = page.locator('[data-statusbar]').getByText(/You've covered/);
  await expect(line).toHaveText(`You've covered 1 of ${navItems().length} pages`);
  await page.locator('[data-topbar]').getByRole('link', { name: 'About', exact: true }).click();
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
  await page.locator('[data-topbar]').getByRole('link', { name: 'Skills', exact: true }).click();
  await expect(page.locator('[data-statusbar]').getByText(/You've covered 2 of/)).toBeVisible();
});

test('the top bar is plain text links, with no status lights', async ({ page }) => {
  await page.goto('/');
  const nav = page.locator('[data-topbar] nav');
  await expect(nav.locator('.rounded-full:not([data-nav-marker])')).toHaveCount(0);
});

test('resting the mouse on Projects opens its menu; moving away closes it', async ({ page }) => {
  await page.goto('/');
  const menu = page.locator('[data-topbar] .topnav-menu');
  await expect(menu).toBeHidden();
  await page.locator('[data-topbar] a[href="/projects"]').hover();
  await expect(menu).toBeVisible();
  await expect(page.getByRole('button', { name: 'Project specs' })).toHaveAttribute(
    'aria-expanded',
    'true',
  );
  await page.mouse.move(640, 600);
  await expect(menu).toBeHidden();
});

test('the status bar is icons that name themselves, with a tooltip on hover', async ({ page }) => {
  await page.goto('/');
  const bar = page.locator('[data-statusbar]');
  for (const name of ['Run tests on this page', 'Bug Hunt']) {
    await expect(bar.getByRole('button', { name })).toBeVisible();
  }
  for (const name of [/Site checks/, 'GitHub', 'Email']) {
    await expect(bar.getByRole('link', { name })).toBeVisible();
  }
  const run = bar.getByRole('button', { name: 'Run tests on this page' });
  await run.hover();
  await expect
    .poll(() => run.evaluate((el) => getComputedStyle(el, '::after').visibility))
    .toBe('visible');
  // Minimal: no visible sentence, just the coverage count.
  await expect(bar.getByText(/^\d+\/\d+$/)).toBeVisible();
});
