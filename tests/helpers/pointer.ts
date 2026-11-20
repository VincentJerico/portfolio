import type { Locator, Page } from '@playwright/test';

/** Scrolls an element to the middle of the screen and waits for the scroll-driven styles to land. */
export async function bringToCentre(target: Locator) {
  await target.evaluate(async (el) => {
    el.scrollIntoView({ block: 'center' });
    const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
    await frame();
    await frame();
  });
}

/**
 * Points at an element the way a person does, once the page is ready for it (C53):
 * - after smooth scrolling has started (starting it resets Chrome's hover state);
 * - with the element in the middle of the screen, where list rows have finished rising: at the bottom
 *   edge a row is still sliding up 40 px, so part of it sits below the fold and the next row can take
 *   the pointer (seen on CI);
 * - then hover and move 1 px, as a real pointer is never perfectly still.
 */
export async function pointAt(page: Page, target: Locator) {
  await page.waitForFunction(
    () =>
      document.documentElement.classList.contains('lenis') ||
      !matchMedia('(pointer: fine) and (prefers-reduced-motion: no-preference)').matches,
  );
  await bringToCentre(target);
  await target.hover();
  const box = (await target.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2 + 1, box.y + box.height / 2);
}
