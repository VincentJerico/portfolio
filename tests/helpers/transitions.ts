import type { Page } from '@playwright/test';

/** Waits until no view transition is animating: the page takes no clicks while one runs. */
export async function settleTransitions(page: Page) {
  await page.waitForFunction(
    () =>
      !document
        .getAnimations()
        .some((a) =>
          (a.effect as KeyframeEffect | null)?.pseudoElement?.includes('view-transition'),
        ),
  );
}
