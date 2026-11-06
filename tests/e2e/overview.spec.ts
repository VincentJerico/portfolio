import { expect, test } from '../helpers/test';
import { metrics, profile } from '../../src/content';
import { projectsInOrder } from '../../src/lib/content';
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

test.describe('cursor swarm', () => {
  const drawn = () => {
    const canvas = document.querySelector<HTMLCanvasElement>('canvas[data-cursor-swarm]')!;
    const { data } = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);
    return data.some((value) => value !== 0);
  };

  test('renders only for a fine pointer, hidden from assistive tech', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    const fine = await page.evaluate(() => matchMedia('(pointer: fine)').matches);
    const swarm = page.locator('canvas[data-cursor-swarm]');
    await expect(swarm).toHaveCount(Number(fine));
    await expect(page.locator('canvas[data-cursor-swarm]:not([aria-hidden="true"])')).toHaveCount(
      0,
    );
  });

  test.describe('with a mouse', () => {
    test.use({ hasTouch: false, isMobile: false });

    test(
      'gathers around the mouse and clears once it leaves',
      { tag: '@chromium-only' },
      async ({ page }) => {
        await page.goto('/');
        await waitForHydration(page);
        const box = (await page.locator('section[aria-labelledby="hero-heading"]').boundingBox())!;
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 8 });
        await expect.poll(() => page.evaluate(drawn)).toBe(true);
        await page.mouse.move(box.x + box.width / 2, Math.max(1, box.y - 8), { steps: 4 });
        await expect.poll(() => page.evaluate(drawn), { timeout: 5000 }).toBe(false);
      },
    );
  });

  test('is not rendered under reduced motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await waitForHydration(page);
    await expect(page.locator('canvas[data-cursor-swarm]')).toHaveCount(0);
  });
});
