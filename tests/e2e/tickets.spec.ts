import { expect, test } from '@playwright/test';
import { projectBySlug } from '../../src/lib/content';

const a11y = projectBySlug('accessibility-testing')!;

test('a ticket shows the quoted source fields', async ({ page }) => {
  await page.goto('/projects/accessibility-testing');
  const ticket = page.locator('#ticket-F-1');
  await ticket.locator('summary').click();
  for (const term of [
    'Steps to reproduce',
    'Actual',
    'Impact',
    'Recommendation',
    'Tracked by',
    'Status',
  ]) {
    await expect(ticket.getByText(term, { exact: true })).toBeVisible();
  }
});

test('a deep link to a ticket opens it and brings it into view', async ({ page }) => {
  await page.goto('/projects/accessibility-testing#ticket-F-7');
  const ticket = page.locator('#ticket-F-7');
  await expect(ticket).toHaveAttribute('open', '');
  await expect(ticket).toBeInViewport();
});

test('following a findings-table ID opens that ticket', async ({ page }) => {
  await page.goto('/projects/accessibility-testing');
  await page
    .getByRole('region', { name: 'Findings index' })
    .getByRole('link', { name: 'F-3' })
    .click();
  await expect(page.locator('#ticket-F-3')).toHaveAttribute('open', '');
});

test('a severity count in the run summary opens every ticket of that severity', async ({
  page,
}) => {
  await page.goto('/projects/accessibility-testing');
  const serious = a11y.findings.filter((f) => f.severity === 'serious');
  await page
    .getByRole('region', { name: 'Run summary' })
    .getByRole('link', { name: /serious/i })
    .click();
  await expect(page.locator('[data-ticket-severity="serious"][open]')).toHaveCount(serious.length);
  await expect(page.locator('[data-ticket-severity="critical"][open]')).toHaveCount(0);
  await expect(page.locator(`#ticket-${serious[0]!.id}`)).toBeInViewport();
});
