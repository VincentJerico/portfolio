import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, type TestInfo } from '@playwright/test';

export const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

/** Scans the page with axe (spec 12.3) and attaches the full JSON to the report. */
export async function expectNoViolations(page: Page, testInfo: TestInfo) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  await testInfo.attach('axe-results.json', {
    body: JSON.stringify(results, null, 2),
    contentType: 'application/json',
  });
  expect(
    results.violations.map(
      (v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
    ),
  ).toEqual([]);
}

/** Port of isFocusEntirelyObscured() from accessibility-testing (SC 2.4.11, no axe rule). */
export async function focusEntirelyObscured(page: Page): Promise<boolean> {
  return page.evaluate(async () => {
    // Let the browser finish scrolling the newly focused element into view first: something truly
    // hidden stays hidden, but a scroll still in progress is not a defect (C54, seen on CI WebKit).
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const el = document.activeElement;
    if (!el || el === document.body) return false;
    const r = el.getBoundingClientRect();
    // Focus somewhere off screen (moved by a transform the browser can't scroll to) is hidden too (C54).
    if (r.bottom <= 0 || r.right <= 0 || r.top >= innerHeight || r.left >= innerWidth) return true;
    const points = [
      [r.left + r.width / 2, r.top + r.height / 2],
      [r.left + 1, r.top + 1],
      [r.right - 1, r.top + 1],
      [r.left + 1, r.bottom - 1],
      [r.right - 1, r.bottom - 1],
    ];
    return points.every(([x, y]) => {
      const hit = document.elementFromPoint(x!, y!);
      return hit !== null && hit !== el && !el.contains(hit);
    });
  });
}
