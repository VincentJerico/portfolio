import { expect, test } from '../helpers/test';
import { waitForHydration } from '../helpers/hydration';

// C55, Vincent's second list (2026-11-22): motion details.

test.describe('the phone menu', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('D10: the menu grows from its button', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    const button = page.getByRole('button', { name: 'Menu' });
    const box = (await button.boundingBox())!;
    await button.click();
    const dialog = page.getByRole('dialog', { name: 'Site menu' });
    await expect(dialog).toBeVisible();
    // A quarter of the way through: the point under the button is the menu, the far corner not yet.
    const early = await dialog.evaluate(
      (el, at) => {
        const grow = el
          .getAnimations()
          .find((a) => (a as CSSTransition).transitionProperty === 'clip-path');
        if (!grow) return 'no circle';
        grow.pause();
        grow.currentTime = Number(grow.effect!.getComputedTiming().duration) / 4;
        const under = document.elementFromPoint(at.x, at.y);
        const corner = document.elementFromPoint(4, innerHeight - 4);
        // Inside the menu's content, not its backdrop (a hit on the backdrop returns the dialog itself).
        const inMenu = (hit: Element | null) => hit !== null && hit !== el && el.contains(hit);
        return { underButton: inMenu(under), corner: inMenu(corner) };
      },
      { x: box.x + box.width / 2, y: box.y + box.height / 2 },
    );
    expect(early).toEqual({ underButton: true, corner: false });
  });

  test('D18: closing the menu mid-way reverses its links instead of jumping', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    await page.getByRole('button', { name: 'Menu' }).click();
    const kinds = await page
      .getByRole('dialog', { name: 'Site menu' })
      .locator('nav > ul > li')
      .first()
      .evaluate((el) => el.getAnimations().map((a) => a.constructor.name));
    // Transitions reverse from where they are; keyframe animations restart.
    expect(kinds).toEqual(['CSSTransition']);
  });
});

test.describe('groups', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  for (const [path, selector] of [
    ['/projects/accessibility-testing', '#evidence ~ * li[id^="evidence-"], li[id^="evidence-"]'],
    ['/projects/accessibility-testing', '[data-ticket-severity]'],
  ] as const) {
    test(`D14: a group arrives one after another, 40 px of scroll apart (${selector})`, async ({
      page,
    }) => {
      await page.goto(path);
      const starts = await page.locator(selector).evaluateAll((els) =>
        els.map((el) => {
          const item = el.closest('.stagger > *') ?? el;
          return getComputedStyle(item).animationRangeStart;
        }),
      );
      expect(starts.length).toBeGreaterThan(1);
      expect(starts).toEqual(starts.map((_, i) => `cover ${Math.min(i, 6) * 40}px`));
    });
  }
});
