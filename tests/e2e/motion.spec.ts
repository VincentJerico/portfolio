import { expect, test, type Locator } from '../helpers/test';
import { waitForHydration } from '../helpers/hydration';

// C50's one rhythm, kept by the minimal reset (C51): everything that arrives rises 16 px over 400 ms,
// list rows answer the pointer, and nothing moves under reduced motion.

const animationName = (locator: Locator) =>
  locator.evaluate((el) => getComputedStyle(el).animationName);

test.describe('arrivals', () => {
  test('the poster rises in on the home page', async ({ page }) => {
    await page.goto('/');
    expect(await animationName(page.locator('[data-poster] > .poster-line'))).toBe('rise');
  });

  test('the 404 page arrives like every other page', async ({ page }) => {
    await page.goto('/no-such-page');
    expect(await animationName(page.locator('main header > h1'))).toBe('rise');
  });

  test('sections rise in with the shared rise as they scroll in', async ({ page }) => {
    await page.goto('/skills');
    expect(await animationName(page.locator('main section').first())).toBe('rise');
  });

  test('quality scores show with a bar filled to the score', async ({ page }) => {
    await page.goto('/quality');
    const table = page.getByRole('region', { name: /Lighthouse/ });
    const bar = table.locator('.score-bar').first();
    const fill = await bar.evaluate((el) => Number(el.style.getPropertyValue('--v')));
    expect(fill).toBeGreaterThan(0);
    expect(fill).toBeLessThanOrEqual(1);
  });

  test('resume entries rise in on screen without a compositor layer each', async ({ page }) => {
    await page.goto('/resume');
    expect(await animationName(page.locator('.resume-list > li').first())).toBe('rise-var');
  });
});

test.describe('answers', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('buttons press in while held', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    const toggle = page.locator('[data-site-header]').getByRole('button', { name: 'Dark theme' });
    await toggle.hover();
    await page.mouse.down();
    await expect.poll(() => toggle.evaluate((el) => getComputedStyle(el).scale)).toBe('0.96');
    await page.mouse.up();
  });

  test('a case study row morphs into its page title', async ({ page }) => {
    await page.goto('/work');
    const link = page.locator('.work-row-link').first();
    await expect(link).toHaveAttribute('data-morph');
  });
});

test.describe('changes of shape', () => {
  test('form errors rise in under their fields', async ({ page }) => {
    await page.goto('/contact');
    await waitForHydration(page);
    await page.getByRole('button', { name: 'Send message' }).click();
    const alert = page.locator('form').getByRole('alert');
    await expect(alert).toBeVisible();
    expect(await animationName(alert)).toBe('rise');
    await expect(page.locator('form')).toHaveAttribute('data-status', 'invalid');
  });

  // Clipboard permissions can be granted in Chromium only.
  test(
    'a copy button shows a check, reports it, then resets',
    { tag: '@chromium-only' },
    async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await page.goto('/contact');
      await waitForHydration(page);
      const button = page.getByRole('button', { name: 'Copy email' });
      await button.click();
      await expect(page.getByRole('status').filter({ hasText: 'Copied' })).toBeVisible();
      expect(await animationName(button.locator('svg'))).toBe('rise');
      await expect(page.getByText('Copied to clipboard')).toHaveCount(0, { timeout: 5000 });
    },
  );

  test('the phone menu links arrive in turn', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/');
    await waitForHydration(page);
    await page
      .locator('[data-site-header]')
      .getByRole('button', { name: 'Menu', exact: true })
      .click();
    const item = page.getByRole('dialog', { name: 'Site menu' }).locator('nav > ul > li').nth(1);
    expect(await animationName(item)).toBe('rise');
  });
});

test.describe('reduced motion', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('none of it moves', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    expect(await animationName(page.locator('[data-poster] > .poster-line'))).toBe('none');
    expect(await animationName(page.locator('.work-row').first())).toBe('none');
    await page.goto('/resume');
    expect(await animationName(page.locator('.resume-list > li').first())).toBe('none');
  });
});

test.describe('lists that change', () => {
  test.use({ viewport: { width: 1280, height: 900 }, isMobile: false, hasTouch: false });

  test('filtering moves the rows that stay, lifts away the ones that go, and raises the count', async ({
    page,
  }) => {
    await page.goto('/projects');
    await waitForHydration(page);
    // Record every row animation the filter starts (they are short, so read them as they begin).
    await page.evaluate(() => {
      const w = window as unknown as { __moves: string[] };
      w.__moves = [];
      const original = Element.prototype.animate;
      Element.prototype.animate = function (keyframes, options) {
        const frames = keyframes as Keyframe[];
        const ghost = Boolean(this.parentElement?.hasAttribute('inert'));
        const first = (frames[0] ?? {}) as { translate?: string };
        w.__moves.push(ghost ? 'ghost' : first.translate === '0 16px' ? 'enter' : 'move');
        return original.call(this, keyframes, options);
      };
    });
    await page.getByRole('button', { name: 'Security', exact: true }).click();
    await expect(page.locator('main li[data-slug]:not([inert] *)')).toHaveCount(1);
    const moves = await page.evaluate(() => (window as unknown as { __moves: string[] }).__moves);
    expect(moves).toContain('ghost');
    const roll = page.getByRole('status').filter({ hasText: 'Showing' }).locator('.count-roll');
    expect(await animationName(roll)).toBe('rise');
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __moves: string[] }).__moves))
      .toEqual(expect.arrayContaining(['enter', 'move']));
    // The removed rows' copies leave once they have lifted away.
    await expect(page.locator('[inert] > li')).toHaveCount(0);
  });
});

test.describe('one rhythm', () => {
  test.use({ viewport: { width: 1280, height: 860 }, isMobile: false, hasTouch: false });

  test('arrivals share one rise and one timing; rows share one hover', async ({ page }) => {
    await page.goto('/about');
    const header = await page
      .locator('main header > *')
      .evaluateAll((els) =>
        els.map(
          (el) => `${getComputedStyle(el).animationName} ${getComputedStyle(el).animationDuration}`,
        ),
      );
    expect(new Set(header)).toEqual(new Set(['rise 0.4s']));
    const sections = await page
      .locator('main section')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
    expect(new Set(sections)).toEqual(new Set(['rise']));
    await page.goto('/');
    const row = page.locator('.work-row').first();
    await row.getByRole('link').hover();
    await expect
      .poll(() =>
        row.locator('.work-row-link > span').evaluate((el) => getComputedStyle(el).translate),
      )
      .toBe('12px');
  });
});
