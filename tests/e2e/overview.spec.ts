import { expect, test } from '../helpers/test';
import { metrics, profile } from '../../src/content';
import { projectsInOrder, testedAreas } from '../../src/lib/content';
import { categoryLabel } from '../../src/lib/labels';
import { waitForHydration } from '../helpers/hydration';

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

  test('the masthead states location, tested areas and CI coverage from the data', async ({
    page,
  }) => {
    const mast = page.getByRole('region', { name: 'At a glance' });
    const ci = metrics.find((m) => m.id === 'ci-repos')!;
    const values = mast.locator('dd');
    await expect(values.nth(0)).toHaveText(profile.location);
    await expect(values.nth(1)).toHaveText(testedAreas().join(' · '));
    await expect(values.nth(2)).toContainText(ci.value);
    await expect(values.nth(2)).toContainText(ci.label);
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

  test('each index row shows its suite number, category and result', async ({ page }) => {
    const featured = projectsInOrder().filter((p) => p.featured);
    const rows = page.getByRole('region', { name: 'Featured projects' }).getByRole('listitem');
    await expect(rows).toHaveCount(featured.length);
    for (const [i, project] of featured.entries()) {
      await expect(rows.nth(i)).toContainText(`suite ${String(project.order).padStart(2, '0')}`);
      await expect(rows.nth(i)).toContainText(categoryLabel(project.category));
      await expect(rows.nth(i)).toContainText(project.hook);
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

  test('how I test is a checklist of the 12 areas, readable at every width', async ({ page }) => {
    const section = page.getByRole('region', { name: 'How I test' });
    const items = section.getByRole('listitem');
    await expect(section.locator('svg.cov-map')).toHaveCount(0);
    for (const width of [375, 1280]) {
      await page.setViewportSize({ width, height: 900 });
      await expect(items).toHaveCount(12);
      await expect(items.first()).toBeVisible();
      await expect(items.last()).toBeVisible();
      await expect(section.locator('[data-qa-check]')).toHaveCount(12);
    }
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

test.describe('hero runner block', () => {
  test('is decorative and repeats only facts shown as text in the run summary', async ({
    page,
  }) => {
    await page.goto('/');
    const block = page.locator('[data-runner-hero]');
    await expect(block).toHaveAttribute('aria-hidden', 'true');
    await expect(block).toContainText('$ npx playwright test --project=vincent');
    const values = await block.locator('[data-metric-value]').allTextContents();
    expect(values.length).toBeGreaterThanOrEqual(4);
    const summary = page.getByRole('region', { name: 'Run summary' });
    for (const value of values) await expect(summary).toContainText(value);
  });

  test('is fully shown without animation under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const lastLine = page.locator('[data-runner-hero] [data-line]').last();
    await expect(lastLine).toBeVisible();
    const clip = await lastLine.evaluate((el) => getComputedStyle(el).clipPath);
    expect(['none', 'inset(0px)']).toContain(clip);
  });
});

test.describe('portrait card', () => {
  test('flips to its fixture data and back, exposing only the face on show', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    const flip = page.getByRole('button', { name: 'Flip card' });
    const back = page.getByTestId('portrait-back');
    const portrait = page.getByRole('img', { name: profile.fullName });

    await expect(flip).toHaveAttribute('aria-pressed', 'false');
    await expect(back).toHaveAttribute('inert', '');
    await flip.click();
    await expect(flip).toHaveAttribute('aria-pressed', 'true');
    await expect(back).not.toHaveAttribute('inert');
    await expect(back).toContainText(profile.location);
    await expect(portrait.locator('xpath=ancestor::figure')).toHaveAttribute('inert', '');
    await flip.click();
    await expect(back).toHaveAttribute('inert', '');
  });
});

test.describe('content motion', () => {
  const animations = () =>
    [
      ...document.querySelectorAll<HTMLElement>(
        'main section, main header > *, main .timeline-track > li, main tbody > tr',
      ),
    ].map((el) => getComputedStyle(el).animationName);

  test('sections, headers, list items and rows are still under reduced motion', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/projects/accessibility-testing');
    const names = await page.evaluate(animations);
    expect(names.length).toBeGreaterThan(0);
    expect(names.filter((name) => name !== 'none')).toEqual([]);
  });
});
