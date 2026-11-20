import type { Locator, Page } from '@playwright/test';

/**
 * Points at an element the way a person does, once the page is ready for it. Smooth scrolling starts
 * when the browser is idle, and starting it resets Chrome's hover state; a test that hovers in that
 * moment loses the hover (seen on CI). So wait until smooth scrolling runs wherever it will (a fine
 * pointer with motion allowed), then hover and move 1 px, as a real pointer is never perfectly still
 * (C53).
 */
export async function pointAt(page: Page, target: Locator) {
  await page.waitForFunction(
    () =>
      document.documentElement.classList.contains('lenis') ||
      !matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches,
  );
  await target.hover();
  const box = (await target.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2 + 1, box.y + box.height / 2);
}
