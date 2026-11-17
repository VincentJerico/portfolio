import { expect, test, type Page } from '../helpers/test';
import { caseStudySlugs, projectsInOrder, testedAreaLinks } from '../../src/lib/content';

// Everything that leads somewhere can be reached and hit, at every size.

const PAGES = [
  '/',
  '/projects',
  ...projectsInOrder().map((project) => `/projects/${project.slug}`),
  '/work',
  ...caseStudySlugs().map((slug) => `/work/${slug}`),
  '/skills',
  '/about',
  '/resume',
  '/quality',
  '/contact',
];

/**
 * Links and buttons whose clickable area (the element plus any hit-area pseudo-element) is under
 * 24 by 24 px. Links inside a running sentence are exempt, as WCAG 2.5.8 allows.
 */
function smallTargets(page: Page) {
  return page.evaluate(() => {
    const out: string[] = [];
    const scope = 'main, [data-topbar], [data-statusbar], body > header';
    for (const el of document.querySelectorAll<HTMLElement>(`:is(${scope}) :is(a[href], button)`)) {
      const rect = el.getBoundingClientRect();
      if (!rect.width || !rect.height || el.closest('[aria-hidden="true"], .sr-only')) continue;
      const parent = el.parentElement!;
      const inSentence =
        parent.tagName === 'P' &&
        parent.textContent!.trim().length > el.textContent!.trim().length + 20;
      if (inSentence) continue;
      const before = getComputedStyle(el, '::before');
      const grows = before.content !== 'none' && before.position === 'absolute';
      const px = (value: string) => Math.min(0, parseFloat(value) || 0);
      const height = rect.height - (grows ? px(before.top) + px(before.bottom) : 0);
      const width = rect.width - (grows ? px(before.left) + px(before.right) : 0);
      if (height < 24 || width < 24) {
        const name = (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30);
        out.push(`${name} (${Math.round(width)}x${Math.round(height)})`);
      }
    }
    return out;
  });
}

for (const [label, viewport] of [
  ['phone', { width: 375, height: 800 }],
  ['desktop', { width: 1280, height: 800 }],
] as const) {
  test.describe(`targets on ${label}`, () => {
    test.use({ viewport });

    test('every link and button is at least 24 by 24 px to hit, and nothing scrolls sideways', async ({
      page,
    }) => {
      test.slow(); // every page
      for (const path of PAGES) {
        await page.goto(path);
        expect(await smallTargets(page), path).toEqual([]);
        expect(
          await page.evaluate(
            () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
          ),
          `${path} scrolls sideways`,
        ).toBeLessThanOrEqual(0);
      }
    });
  });
}

test('each testing area on the overview opens the projects filtered to it', async ({ page }) => {
  await page.goto('/');
  const strip = page.getByRole('region', { name: 'At a glance' });
  const areas = testedAreaLinks();
  for (const area of areas) {
    await expect(strip.getByRole('link', { name: area.label, exact: true })).toHaveAttribute(
      'href',
      area.href,
    );
  }
  await strip.getByRole('link', { name: areas[0]!.label, exact: true }).click();
  await expect(page).toHaveURL(new RegExp(`/projects\\?category=`));
  await expect(page.getByRole('button', { name: areas[0]!.label, exact: true })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('every project on the resume links to its report', async ({ page }) => {
  await page.goto('/resume');
  for (const project of projectsInOrder()) {
    await expect(page.getByRole('link', { name: project.name, exact: true })).toHaveAttribute(
      'href',
      `/projects/${project.slug}`,
    );
  }
});
