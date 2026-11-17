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

  test('a reading-progress line runs under the top bar', async ({ page }) => {
    await page.goto('/projects/accessibility-testing');
    const line = page.locator('[data-scroll-progress]');
    expect(await animationName(line)).toBe('scroll-fill');
    const box = (await line.boundingBox())!;
    const bar = (await page.locator('[data-topbar]').boundingBox())!;
    expect(box.y).toBeGreaterThanOrEqual(bar.y + bar.height - 1);
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

  test('the Projects menu drops open and its links leave the tab order when shut', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForHydration(page);
    const nav = page.getByRole('navigation', { name: 'Site' });
    const folder = nav.getByRole('button', { name: 'Project specs' });
    await folder.click();
    const list = page.locator('[data-topbar] .topnav-menu');
    expect(await animationName(list)).toBe('reveal-in');
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

test.describe('lists that change', () => {
  test.use({ viewport: { width: 1280, height: 900 }, isMobile: false, hasTouch: false });

  test('filtering moves the cards that stay, shrinks away the ones that go, and rolls the count', async ({
    page,
  }) => {
    await page.goto('/projects');
    await waitForHydration(page);
    // Record every card animation the filter starts (they are short, so read them as they begin).
    await page.evaluate(() => {
      const w = window as unknown as { __moves: string[] };
      w.__moves = [];
      const original = Element.prototype.animate;
      Element.prototype.animate = function (keyframes, options) {
        const frames = keyframes as Keyframe[];
        const ghost = Boolean(this.parentElement?.hasAttribute('inert'));
        w.__moves.push(ghost ? 'ghost' : Object.keys(frames[0] ?? {}).join('+'));
        return original.call(this, keyframes, options);
      };
    });
    await page.getByRole('button', { name: 'Security', exact: true }).click();
    await expect(page.locator('main article:not([inert] *)')).toHaveCount(1);
    const moves = await page.evaluate(() => (window as unknown as { __moves: string[] }).__moves);
    expect(moves).toContain('ghost');
    const roll = page.getByRole('status').filter({ hasText: 'Showing' }).locator('.count-roll');
    expect(await animationName(roll)).toBe('count-roll');
    await page.getByRole('button', { name: 'All', exact: true }).click();
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __moves: string[] }).__moves))
      .toEqual(expect.arrayContaining(['translate+scale']));
    // The removed cards' copies leave once they have shrunk away.
    await expect(page.locator('[inert] > li')).toHaveCount(0);
  });

  test('the palette shrinks back into the Search button it grew from', async ({ page }) => {
    await page.addInitScript(() => {
      const w = window as unknown as { __vt: string[][] };
      w.__vt = [];
      const start = document.startViewTransition?.bind(document);
      if (!start) return;
      document.startViewTransition = ((arg: unknown) => {
        w.__vt.push([...((arg as { types?: string[] })?.types ?? [])]);
        return start(arg as never);
      }) as typeof document.startViewTransition;
    });
    await page.goto('/');
    await waitForHydration(page);
    const search = page.locator('[data-topbar]').getByRole('button', { name: /Search/ });
    await search.click();
    const dialog = page.getByRole('dialog', { name: 'Search' });
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    const types = await page.evaluate(() => (window as unknown as { __vt: string[][] }).__vt);
    expect(types.filter((t) => t.includes('dialog-morph'))).toHaveLength(2);
    await expect(search).toBeFocused();
  });

  test('palette results cascade in and the highlight glides between them', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    await page.keyboard.press('ControlOrMeta+k');
    const option = page.getByRole('option').first();
    await expect(option).toBeVisible();
    expect(await animationName(option)).toBe('reveal-in');
    const marker = page.locator('.palette-marker');
    const before = await marker.evaluate((el) => el.style.translate);
    await page.keyboard.press('ArrowDown');
    await expect.poll(() => marker.evaluate((el) => el.style.translate)).not.toBe(before);
  });
});

test.describe('inspector on scroll', () => {
  test.use({ viewport: { width: 1280, height: 860 }, isMobile: false, hasTouch: false });

  const after = (locator: Locator) =>
    locator.evaluate((el) => {
      const style = getComputedStyle(el, '::after');
      return { lock: style.getPropertyValue('--lock').trim(), content: style.content };
    });

  test('a card is inspected as it crosses the middle of the screen, and stays inspected', async ({
    page,
  }) => {
    await page.goto('/skills');
    const card = page.locator('.skill-card').last();
    expect((await after(card)).lock).toBe('0'); // not reached yet
    await card.evaluate((el) => {
      const top = el.getBoundingClientRect().top + scrollY;
      scrollTo(0, top - innerHeight * 0.3);
    });
    await expect.poll(async () => (await after(card)).lock).toBe('1');
    expect((await after(card)).content).toContain('inspected');
  });

  test('section headings end in full ink once scrolled past', async ({ page }) => {
    await page.goto('/');
    const words = page.getByRole('heading', { name: 'Featured projects' }).locator('.light-word');
    await expect(words).toHaveCount(2);
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    const ink = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--text').trim(),
    );
    const colors = await words.evaluateAll((els) => els.map((el) => getComputedStyle(el).color));
    const probe = await page.evaluate((value) => {
      const el = document.createElement('span');
      el.style.color = value;
      document.body.append(el);
      const rgb = getComputedStyle(el).color;
      el.remove();
      return rgb;
    }, ink);
    expect(new Set(colors)).toEqual(new Set([probe]));
  });

  test('under reduced motion nothing is drawn and headings are full ink', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/skills');
    expect((await after(page.locator('.skill-card').first())).content).toBe('none');
    await page.goto('/');
    expect(await animationName(page.locator('.light-word').first())).toBe('none');
  });
});
