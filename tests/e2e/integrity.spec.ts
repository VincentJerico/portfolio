import { expect, test } from '@playwright/test';
import { NAV_ITEMS } from '../../src/lib/nav';
import { caseStudySlugs, projectsInOrder } from '../../src/lib/content';
import { findBanned, findDenied } from '../../src/lib/strings';
import { loadDenylist } from '../helpers/denylist';

const NOT_FOUND = '/this-page-does-not-exist';
const ROUTES = [
  ...NAV_ITEMS.map((item) => item.href),
  ...projectsInOrder().map((p) => `/projects/${p.slug}`),
  ...caseStudySlugs().map((slug) => `/work/${slug}`),
  NOT_FOUND,
];
const WIDTHS = [320, 375, 768, 1024, 1440, 2560];
// The browser logs the document's own (intended) 404 status; nothing else may error.
const EXPECTED_404_LOG = 'Failed to load resource: the server responded with a status of 404';
const deny = loadDenylist();

for (const route of ROUTES) {
  const allowed = route === NOT_FOUND ? [EXPECTED_404_LOG] : [];

  test(`${route}: layout, headings and published text`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (err) => errors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !allowed.some((text) => msg.text().startsWith(text))) {
        errors.push(msg.text());
      }
    });
    await page.goto(route);

    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(0);
    }

    const levels = await page.evaluate(() =>
      [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].map((h) => Number(h.tagName[1])),
    );
    expect(levels[0], 'first heading is the h1').toBe(1);
    const skips = levels.filter((level, i) => i > 0 && level > levels[i - 1]! + 1);
    expect(skips, `heading levels ${levels.join(',')}`).toEqual([]);

    // Visible text plus every attribute a reader or crawler can see.
    const published = await page.evaluate(() => {
      const parts = [document.title];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        const parent = walker.currentNode.parentElement;
        if (parent && !parent.closest('script, style'))
          parts.push(walker.currentNode.textContent ?? '');
      }
      for (const el of document.querySelectorAll('[alt], [title], [aria-label], meta[content]')) {
        for (const attr of ['alt', 'title', 'aria-label', 'content']) {
          const value = el.getAttribute(attr);
          if (value) parts.push(value);
        }
      }
      return parts.join('\n');
    });
    expect(findBanned(published)).toEqual([]);
    // Count only, so a failure never prints a private term.
    const leaks = findDenied(published, deny).length;
    expect(leaks === 0, `${leaks} denylisted term(s) published`).toBe(true);
    expect(errors).toEqual([]);
  });
}
