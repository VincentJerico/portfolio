import { test } from '../helpers/test';
import { navItems } from '../../src/lib/nav-items';
import { caseStudySlugs, projectsInOrder } from '../../src/lib/content';
import { expectNoViolations } from '../helpers/a11y';
import { waitForHydration } from '../helpers/hydration';

const ROUTES = [
  ...navItems().map((i) => i.href),
  ...projectsInOrder().map((p) => `/projects/${p.slug}`),
  ...caseStudySlugs().map((s) => `/work/${s}`),
  '/this-page-does-not-exist',
];

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} theme`, () => {
    test.use({ colorScheme: scheme });
    for (const route of ROUTES) {
      test(`${route} has no WCAG violations`, async ({ page }, testInfo) => {
        await page.goto(route);
        await waitForHydration(page);
        await expectNoViolations(page, testInfo);
      });
    }
  });
}
