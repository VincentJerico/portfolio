import { expect, test } from '@playwright/test';
import { metrics, profile } from '../../src/content';
import { projectsInOrder } from '../../src/lib/content';

test.describe('overview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('hero names Vincent and offers the three actions', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText(profile.fullName);
    const main = page.locator('main');
    await expect(main.getByRole('link', { name: 'View projects' })).toHaveAttribute(
      'href',
      '/projects',
    );
    await expect(main.getByRole('link', { name: 'Download CV' })).toHaveAttribute(
      'href',
      profile.cvPdf,
    );
    await expect(main.getByRole('link', { name: 'Email me' })).toHaveAttribute(
      'href',
      `mailto:${profile.email}`,
    );
  });

  test('run summary shows every metric with its source', async ({ page }) => {
    const summary = page.getByRole('region', { name: 'Run summary' });
    const sources = summary.getByRole('link', { name: /^source/ });
    await expect(sources).toHaveCount(metrics.length);
    for (const [i, metric] of metrics.entries()) {
      await expect(sources.nth(i)).toHaveAttribute('href', metric.source.href);
    }
  });

  test('featured projects appear in order and link to their reports', async ({ page }) => {
    const featured = projectsInOrder().filter((p) => p.featured);
    const section = page.getByRole('region', { name: 'Featured projects' });
    const reports = section.getByRole('link', { name: /^Read the report/ });
    await expect(reports).toHaveCount(featured.length);
    for (const [i, project] of featured.entries()) {
      await expect(reports.nth(i)).toHaveAttribute('href', `/projects/${project.slug}`);
    }
  });

  test('how I test lists the 12 checklist areas', async ({ page }) => {
    const section = page.getByRole('region', { name: 'How I test' });
    await expect(section.getByRole('listitem')).toHaveCount(12);
    await expect(section.getByRole('link', { name: /method/i })).toHaveAttribute(
      'href',
      '/about#method',
    );
  });

  test('timeline shows the latest six events, newest first', async ({ page }) => {
    const section = page.getByRole('region', { name: 'Timeline' });
    const items = section.getByRole('listitem');
    await expect(items).toHaveCount(6);
    await expect(items.first()).toContainText('Published performance-testing (k6)');
  });

  test('client work teaser links the three case studies', async ({ page }) => {
    const section = page.getByRole('region', { name: 'Client work' });
    await expect(section.getByRole('link', { name: /^Read the case study/ })).toHaveCount(3);
  });

  test('never mentions LinkedIn while it is unset', async ({ page }) => {
    await expect(page.locator('body')).not.toContainText('LinkedIn');
  });
});
