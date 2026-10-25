import { expect, type Page } from '@playwright/test';

/**
 * Waits until React has hydrated the page. The theme toggle only exposes aria-pressed once hydrated,
 * so it is a reliable signal. Tests that inject DOM or need client state must wait for it: on slow
 * machines hydration can discard nodes added before it finishes.
 */
export async function waitForHydration(page: Page) {
  await expect(
    page.locator('button[aria-pressed]').filter({ hasText: 'Dark theme' }).first(),
  ).toHaveAttribute('aria-pressed', /^(true|false)$/);
}
