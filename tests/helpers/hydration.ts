import { expect, type Page } from '@playwright/test';

/**
 * Waits until React has hydrated the page. The top bar's theme switch only exposes aria-pressed once
 * hydrated, and it shows at every viewport, so it is a reliable signal. Tests that inject DOM or need
 * client state must wait for it: on slow machines hydration can discard nodes added before it finishes.
 */
export async function waitForHydration(page: Page) {
  await expect(
    page.locator('[data-site-header] button[aria-pressed]').filter({ hasText: 'Dark' }).first(),
  ).toHaveAttribute('aria-pressed', /^(true|false)$/);
}
