import type { Locator, Page } from '@playwright/test';

/**
 * Points at an element the way a person does: hover, then a 1 px move. With smooth scrolling on,
 * headless Chrome sometimes drops the hover state after Playwright's own scroll-into-view until the
 * pointer moves again; a real pointer is never perfectly still, so the extra move is what a visitor
 * already does (C53).
 */
export async function pointAt(page: Page, target: Locator) {
  await target.hover();
  const box = (await target.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2 + 1, box.y + box.height / 2);
}
