import { expect, test } from '../helpers/test';

// Spec 12.5: CLS <= 0.05. Measured on a cold load with a throttled CPU, where hydration is late.
test(
  'projects grid does not shift when the page hydrates',
  { tag: '@chromium-only' },
  async ({ page, browserName }) => {
    expect(browserName).toBe('chromium');
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 6 });
    await page.addInitScript(() => {
      (window as unknown as { __cls: number }).__cls = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as (PerformanceEntry & {
          value: number;
          hadRecentInput: boolean;
        })[]) {
          if (!entry.hadRecentInput) (window as unknown as { __cls: number }).__cls += entry.value;
        }
      }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto('/projects');
    await expect(page.getByRole('button', { name: 'All', exact: true })).toBeVisible();
    const cls = await page.evaluate(() => (window as unknown as { __cls: number }).__cls);
    expect(cls).toBeLessThanOrEqual(0.05);
  },
);

// Lighthouse simulates LCP with the first paint's small network graph only when the first contentful
// paint is already the largest one; a frame later, it charges every font and script that had loaded
// (about +2 s on a slow phone). Chrome sometimes paints a frame once the CSS is in but before it has
// parsed the body, so nothing contentful may paint there on its own. This holds the parser at that point.
test(
  'the first contentful paint is the largest one, even when the body is parsed late',
  { tag: '@chromium-only' },
  async ({ page }) => {
    await page.route('**/hold-parser.js', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 300));
      await route.fulfill({ contentType: 'text/javascript', body: '' });
    });
    await page.route('**/projects', async (route) => {
      if (route.request().resourceType() !== 'document') return route.fallback();
      const response = await route.fetch();
      const html = await response.text();
      const afterThemeScript =
        html.indexOf('</script>', html.indexOf('<body')) + '</script>'.length;
      await route.fulfill({
        response,
        body: `${html.slice(0, afterThemeScript)}<script src="/hold-parser.js"></script>${html.slice(afterThemeScript)}`,
      });
    });
    await page.goto('/projects');
    const paints = await page.evaluate(
      () =>
        new Promise<{ fcp?: number; lcp?: number }>((resolve) => {
          new PerformanceObserver((list) => {
            resolve({
              fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime,
              lcp: list.getEntries().at(-1)?.startTime,
            });
          }).observe({ type: 'largest-contentful-paint', buffered: true });
        }),
    );
    expect(paints.fcp).toBeGreaterThan(300);
    expect(paints.lcp).toBe(paints.fcp);
  },
);
