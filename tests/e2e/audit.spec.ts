import { expect, test } from '../helpers/test';
import { profile } from '../../src/content';
import { projectsInOrder } from '../../src/lib/content';

// Fixes from the 2026-11-10 AI-slop audit of the live site.
test.describe('audit fixes', () => {
  test('the career path marks the present role as current, apart from done and next', async ({
    page,
  }) => {
    await page.goto('/about');
    const path = page.getByRole('list', { name: 'Career path' });
    const step = (label: string) => path.getByRole('listitem').filter({ hasText: label });
    await expect(step('IT Support Intern')).toHaveAttribute('data-state', 'done');
    await expect(step(profile.role)).toHaveAttribute('data-state', 'current');
    await expect(step(profile.role)).toContainText('current');
    await expect(step(profile.role)).not.toContainText('done');
    await expect(step('SDET')).toHaveAttribute('data-state', 'next');
  });

  test('a report lists each tool once, as a static wrapping list', async ({ page }) => {
    const project = projectsInOrder().find((p) => p.slug === 'security-testing')!;
    await page.goto(`/projects/${project.slug}`);
    const tools = page.getByRole('list', { name: `${project.name} tools` });
    await expect(tools.getByRole('listitem')).toHaveText(project.stack);
    await expect(page.locator('[data-marquee]')).toHaveCount(0);
    for (const tool of project.stack) {
      await expect(page.locator('main').getByText(tool, { exact: true })).toHaveCount(1);
    }
  });

  test('/about does not repeat the homepage intro or the projects tagline', async ({ page }) => {
    await page.goto('/about');
    const main = page.locator('main');
    await expect(main).not.toContainText(profile.intro);
    await expect(main).not.toContainText(profile.tagline);
    await page.goto('/projects');
    await expect(page.locator('main')).toContainText(profile.tagline);
  });

  test('the homepage has no rotating word box', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-flip-card]')).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Next area' })).toHaveCount(0);
  });
});

// An endless animation on a property the compositor cannot run (box-shadow, colour, size) repaints on
// the main thread every frame for as long as the page is open, and shows up as blocking time.
test.describe('endless animations', () => {
  const COMPOSITED = new Set([
    'transform',
    'translate',
    'scale',
    'rotate',
    'opacity',
    'offset',
    'easing',
    'composite',
    'computedOffset',
  ]);

  for (const route of ['/', '/projects', '/about', '/skills', '/projects/accessibility-testing']) {
    test(`on ${route} they animate only compositor properties`, async ({ page }) => {
      await page.goto(route);
      const offenders = await page.evaluate(
        (allowed) => {
          const ok = new Set(allowed);
          return document
            .getAnimations()
            .filter((a) => a.effect?.getTiming().iterations === Infinity)
            .flatMap((a) =>
              (a.effect as KeyframeEffect)
                .getKeyframes()
                .flatMap((frame) => Object.keys(frame))
                .filter((key) => !ok.has(key))
                .map((key) => `${(a as CSSAnimation).animationName ?? 'animation'}: ${key}`),
            );
        },
        [...COMPOSITED],
      );
      expect(offenders).toEqual([]);
    });
  }
});
