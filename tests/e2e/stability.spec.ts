import { expect, test } from '@playwright/test';

// Spec 12.5: CLS <= 0.05. Measured on a cold load with a throttled CPU, where hydration is late.
test('projects grid does not shift when the page hydrates', async ({ page, browserName }) => {
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
});
