import { expect, test, type Locator } from '../helpers/test';
import { waitForHydration } from '../helpers/hydration';

// "No dead areas" (docs/superpowers/plans/2026-11-15-no-dead-areas.md): every part arrives, answers or
// changes shape, and holds still under reduced motion.

const animationName = (locator: Locator) =>
  locator.evaluate((el) => getComputedStyle(el).animationName);

test.describe('arrivals', () => {
  test('the home hero text rises in, and the dot field behind it keeps its own motion', async ({
    page,
  }) => {
    await page.goto('/');
    const headline = page.locator('[data-hero-text] > p').first();
    expect(await animationName(headline)).toBe('header-rise');
    const fieldChildren = await page
      .locator('[data-spotlight] > *')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
    expect(fieldChildren).not.toContain('header-rise');
  });

  test('the 404 page arrives like every other page', async ({ page }) => {
    await page.goto('/no-such-page');
    expect(await animationName(page.locator('main header > h1'))).toBe('line-rise');
  });

  test('skills cards pop their chips in and turn their status to a check as they scroll in', async ({
    page,
  }) => {
    await page.goto('/skills');
    const card = page.locator('.skill-card').first();
    expect(await animationName(card.locator('.chip').first())).toBe('chip-pop');
    expect(await animationName(card.locator('.skill-check svg'))).toBe('check-pop');
  });

  test('quality scores roll on the odometer with a bar filled to the score', async ({ page }) => {
    await page.goto('/quality');
    const table = page.getByRole('region', { name: /Lighthouse/ });
    await expect(table.locator('[data-odometer]').first()).toBeAttached();
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

  test('a reading-progress line runs along the top of the content area', async ({ page }) => {
    await page.goto('/projects/accessibility-testing');
    const line = page.locator('[data-scroll-progress]');
    expect(await animationName(line)).toBe('scroll-fill');
    const box = (await line.boundingBox())!;
    const sidebar = (await page.locator('aside').first().boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(sidebar.x + sidebar.width - 1);
  });

  test('buttons press in while held', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    const search = page.getByRole('button', { name: /Search/ }).first();
    await search.hover();
    await page.mouse.down();
    await expect.poll(() => search.evaluate((el) => getComputedStyle(el).scale)).toBe('0.96');
    await page.mouse.up();
    await page.keyboard.press('Escape');
  });

  test('cards on the quieter pages lift under the pointer', async ({ page }) => {
    await page.goto('/skills');
    const card = page.locator('.skill-card').first();
    await card.hover();
    await expect.poll(() => card.evaluate((el) => getComputedStyle(el).translate)).toBe('0px -5px');
  });

  test('the project folder slides shut and its links leave the tab order', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    const nav = page.getByRole('navigation', { name: 'Site' });
    const folder = nav.getByRole('button', { name: 'Project specs' });
    await folder.click();
    const list = page.locator('aside .nav-folder');
    await expect(list.getByRole('link').first()).toBeVisible();
    await folder.click();
    await expect(list.getByRole('link').first()).toBeHidden();
    await expect(list).toHaveAttribute('hidden', '');
  });

  test('a case study card morphs into its page title', async ({ page }) => {
    await page.goto('/work');
    const link = page.getByRole('link', { name: /Read the case study/ }).first();
    await expect(link).toHaveAttribute('data-morph');
  });
});

test.describe('changes of shape', () => {
  test('the Menu icon folds into a close X while the drawer is open', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/');
    await waitForHydration(page);
    const menu = page.getByRole('button', { name: 'Menu' });
    await menu.click();
    const top = menu.locator('.menu-icon line').first();
    await expect.poll(() => top.evaluate((el) => getComputedStyle(el).rotate)).toBe('45deg');
  });

  test('form errors slide open and the fields in error shake once', async ({ page }) => {
    await page.goto('/contact');
    await waitForHydration(page);
    await page.getByRole('button', { name: 'Send message' }).click();
    const alert = page.locator('form').getByRole('alert');
    await expect(alert).toBeVisible();
    expect(await animationName(alert)).toBe('reveal-in');
    await expect(page.locator('form')).toHaveAttribute('data-status', 'invalid');
    expect(await animationName(page.locator('[aria-invalid="true"]').first())).toBe('field-shake');
  });

  // Clipboard permissions can be granted in Chromium only.
  test(
    'a copy button pops a check, reports it, then resets',
    { tag: '@chromium-only' },
    async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']);
      await page.goto('/contact');
      await waitForHydration(page);
      const button = page.getByRole('button', { name: 'Copy email' });
      await button.click();
      await expect(page.getByRole('status').filter({ hasText: 'Copied' })).toBeVisible();
      expect(await animationName(button.locator('svg'))).toBe('pop-in');
      await expect(page.getByText('Copied to clipboard')).toHaveCount(0, { timeout: 5000 });
    },
  );

  test('the run-checks sheet slides up and its results stream in', async ({ page }) => {
    await page.goto('/quality');
    await waitForHydration(page);
    await page
      .getByRole('button', { name: /Run tests on this page/ })
      .first()
      .click();
    const panel = page.locator('[data-runner-panel]');
    await expect(panel).toBeVisible();
    expect(await animationName(panel)).toBe('sheet-up');
    const row = panel.locator('li[data-check]').first();
    await expect(row).toBeVisible({ timeout: 15000 });
    expect(await animationName(row)).toBe('reveal-in');
  });
});

test.describe('reduced motion', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('none of it moves', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/skills');
    expect(await animationName(page.locator('.skill-card .chip').first())).toBe('none');
    await expect(page.locator('[data-scroll-progress]')).toBeHidden();
    await page.goto('/resume');
    expect(await animationName(page.locator('.resume-list > li').first())).toBe('none');
  });
});
