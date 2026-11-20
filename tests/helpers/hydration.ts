import { expect, type Page } from '@playwright/test';

/**
 * Waits until the page is ready to use: React has hydrated it, and smooth scrolling has started
 * wherever it runs (a fine pointer with motion allowed). The top bar's theme switch only exposes
 * aria-pressed once hydrated, and it is in the page at every viewport, so it is a reliable signal.
 * Smooth scrolling starts when the browser is idle, a moment later; acting before it races the page's
 * own setup (on CI a click in that moment once failed to navigate, C53). Tests that inject DOM or need
 * client state must wait for this: on slow machines hydration can discard nodes added before it ends.
 */
export async function waitForHydration(page: Page) {
  await expect(
    page.locator('[data-site-header] button[aria-pressed]').filter({ hasText: 'Dark' }).first(),
  ).toHaveAttribute('aria-pressed', /^(true|false)$/);
  await page.waitForFunction(
    () =>
      document.documentElement.classList.contains('lenis') ||
      !matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches,
  );
}
