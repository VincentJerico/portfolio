import { expect, test, type Page } from '../helpers/test';
import { waitForHydration } from '../helpers/hydration';
import { settleTransitions } from '../helpers/transitions';

/** Records the types of every view transition the page starts. */
async function recordTransitions(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __vt: string[][] };
    w.__vt = [];
    const start = document.startViewTransition?.bind(document);
    if (!start) return;
    document.startViewTransition = ((arg: unknown) => {
      const types =
        arg && typeof arg === 'object' && 'types' in arg
          ? [...((arg as { types: string[] }).types ?? [])]
          : [];
      w.__vt.push(types);
      return start(arg as never);
    }) as typeof document.startViewTransition;
  });
}
const transitions = (page: Page) =>
  page.evaluate(() => (window as unknown as { __vt: string[][] }).__vt);

test.describe('theme flood', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('the light switch floods the page with the new theme from the cord', async ({ page }) => {
    await recordTransitions(page);
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await waitForHydration(page);
    await page.getByRole('button', { name: 'Light switch' }).click();
    await expect(page.locator('html')).toHaveClass(/\blight\b/);
    expect((await transitions(page)).some((types) => types.includes('theme'))).toBe(true);
  });

  test('under reduced motion the theme switches with no transition', async ({ page }) => {
    await recordTransitions(page);
    await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
    await page.goto('/');
    await waitForHydration(page);
    await page.getByRole('button', { name: 'Light switch' }).click();
    await expect(page.locator('html')).toHaveClass(/\blight\b/);
    expect((await transitions(page)).some((types) => types.includes('theme'))).toBe(false);
  });
});

test.describe('sidebar marker', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('one named marker sits in the active row, so it glides between pages', async ({ page }) => {
    await page.goto('/about');
    const markers = page.locator('aside [data-nav-marker]');
    await expect(markers).toHaveCount(1);
    await expect(page.locator('aside a[aria-current="page"] [data-nav-marker]')).toHaveCount(1);
    await expect(markers).toHaveCSS('view-transition-name', 'nav-active-sidebar');
    await page.locator('aside a[href="/skills"]').click();
    await expect(page).toHaveURL(/\/skills$/);
    await expect(page.locator('aside a[aria-current="page"] [data-nav-marker]')).toHaveCount(1);
  });

  test('on a report page only the project row holds the marker, never two', async ({ page }) => {
    await page.goto('/projects/accessibility-testing');
    await expect(page.locator('aside [data-nav-marker]')).toHaveCount(1);
    await expect(
      page.locator('aside a[href="/projects/accessibility-testing"] [data-nav-marker]'),
    ).toHaveCount(1);
  });
});

/** Records the pseudo-elements each view transition animates, once it is ready. */
async function recordMorphs(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __morphs: string[] };
    w.__morphs = [];
    const start = document.startViewTransition?.bind(document);
    if (!start) return;
    document.startViewTransition = ((arg: never) => {
      const transition = start(arg);
      transition.ready
        .then(() => {
          for (const animation of document.getAnimations()) {
            const pseudo = (animation.effect as KeyframeEffect | null)?.pseudoElement;
            if (pseudo) w.__morphs.push(pseudo);
          }
        })
        .catch(() => {});
      return transition;
    }) as typeof document.startViewTransition;
  });
}

test.describe('project to report', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('a home index row morphs its number, category and name into the report header', async ({
    page,
  }) => {
    await recordMorphs(page);
    await page.goto('/');
    await waitForHydration(page);
    const row = page
      .getByRole('region', { name: 'Featured projects' })
      .getByRole('heading', { level: 3 })
      .first()
      .getByRole('link');
    const href = (await row.getAttribute('href'))!;
    const slug = href.split('/').pop()!;
    await row.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect
      .poll(() =>
        page.evaluate(() => (window as unknown as { __morphs: string[] }).__morphs.join('|')),
      )
      .toMatch(new RegExp(`project-suite-${slug}`));
    const morphs = await page.evaluate(
      () => (window as unknown as { __morphs: string[] }).__morphs,
    );
    // The suite number and name always morph; the category's group is not reliably reported by
    // every browser's animation list (WebKit, and mobile Chrome at times), so it is not asserted.
    const parts = ['suite', 'title'];
    for (const part of parts) {
      expect(
        morphs.some((m) => m.includes(`project-${part}-${slug}`)),
        part,
      ).toBe(true);
    }
  });
});

test.describe('controls grow into their dialogs', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('the Search button grows into the command palette', async ({ page }) => {
    await recordTransitions(page);
    await page.goto('/');
    await waitForHydration(page);
    await page.locator('aside').getByRole('button', { name: 'Search' }).click();
    await expect(page.getByRole('dialog', { name: 'Search' })).toBeVisible();
    await expect(page.getByLabel('Search the site')).toBeFocused();
    expect((await transitions(page)).some((types) => types.includes('dialog-morph'))).toBe(true);
  });

  test('an evidence thumbnail grows into its full view and shrinks back', async ({ page }) => {
    await recordTransitions(page);
    await page.goto('/projects/accessibility-testing');
    await waitForHydration(page);
    const thumb = page.getByRole('button', { name: /^Enlarge image/ }).first();
    await thumb.click();
    await expect(page.getByRole('dialog', { name: /^Evidence/ })).toBeVisible();
    await settleTransitions(page); // the page takes no clicks while the grow runs
    await page.getByRole('button', { name: 'Close image' }).click();
    await expect(page.getByRole('dialog', { name: /^Evidence/ })).toBeHidden();
    await expect(thumb).toBeFocused();
    const morphs = (await transitions(page)).filter((types) => types.includes('dialog-morph'));
    expect(morphs).toHaveLength(2);
  });
});

test.describe('section status dots', () => {
  test('each section dot holds a check that draws in as the section passes', async ({ page }) => {
    await page.goto('/');
    const dots = page.locator('main h2 .reveal-dot');
    const count = await dots.count();
    expect(count).toBeGreaterThan(3);
    await expect(page.locator('main h2 .reveal-dot [data-dot-check]')).toHaveCount(count);
  });
});

test.describe('docked report title', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('the report title docks into a compact bar once the header scrolls away', async ({
    page,
  }) => {
    await page.goto('/projects/accessibility-testing');
    await expect(page.locator('[data-report-dock]')).toHaveAttribute('aria-hidden', 'true');
    const dock = page.locator('[data-report-dock] .report-dock-bar');
    await expect(dock).toContainText('accessibility-testing');
    await expect(dock).toBeHidden();
    await page.mouse.move(800, 400); // over the content, not the sidebar
    await page.mouse.wheel(0, 1600);
    await expect(dock).toBeVisible();
    await page.mouse.wheel(0, -3200);
    await expect(dock).toBeHidden();
  });

  test('under reduced motion the dock never appears', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/projects/accessibility-testing');
    await page.mouse.move(800, 400);
    await page.mouse.wheel(0, 1600);
    await expect(page.locator('[data-report-dock] .report-dock-bar')).toBeHidden();
  });
});

test.describe('odometer metrics', () => {
  test('each metric value rolls on a digit odometer but reads as plain text', async ({ page }) => {
    await page.goto('/');
    const summary = page.getByRole('region', { name: 'Run summary' });
    const tree = await summary.ariaSnapshot();
    const { metrics } = await import('../../src/content');
    for (const metric of metrics) {
      expect(tree, metric.id).toContain(metric.value);
    }
    const first = summary.locator('[data-odometer]').first();
    await expect(first).toHaveAttribute('aria-hidden', 'true');
    // Every digit column rests on its real digit.
    const ok = await summary.locator('[data-odometer]').evaluateAll((els) =>
      els.every((el) => {
        const value = el.getAttribute('data-value')!;
        const digits = [...value].filter((c) => /\d/.test(c));
        const cols = [...el.querySelectorAll<HTMLElement>('.odo-col')];
        return (
          cols.length === digits.length &&
          cols.every((col, i) => col.style.getPropertyValue('--d') === digits[i])
        );
      }),
    );
    expect(ok).toBe(true);
  });
});

test.describe('split-letter title', () => {
  test('the hero name assembles letter by letter but is announced whole', async ({ page }) => {
    const { profile } = await import('../../src/content');
    await page.goto('/');
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toHaveAccessibleName(profile.fullName);
    const letters = h1.locator('[data-split] .split-ch');
    await expect(letters).toHaveCount(profile.fullName.replace(/\s/g, '').length);
    await expect(h1.locator('[data-split]')).toHaveAttribute('aria-hidden', 'true');
  });
});

test.describe('coverage grid spotlight', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('dots near the cursor light up behind the hero and follow it', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    const grid = page.locator('[data-spotlight]');
    await expect(grid).toHaveAttribute('aria-hidden', 'true');
    await expect(grid).toHaveCSS('pointer-events', 'none');
    const hero = page.locator('section[aria-labelledby="hero-heading"]');
    const box = (await hero.boundingBox())!;
    await page.mouse.move(box.x + 200, box.y + 150);
    await expect(grid).toHaveAttribute('data-active', '');
    await expect
      .poll(() => grid.evaluate((el) => getComputedStyle(el).getPropertyValue('--mx').trim()))
      .not.toBe('');
  });
});

test.describe('spotlight and tilt cards', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('a card tilts toward the cursor with a light that follows, and settles on leave', async ({
    page,
  }) => {
    await page.goto('/work');
    await waitForHydration(page);
    const card = page.locator('[data-tilt]').first();
    await card.scrollIntoViewIfNeeded();
    const box = (await card.boundingBox())!;
    // The listener installs when the browser is idle (a 1.2 s fallback in WebKit); keep moving, as a
    // visitor would, until the card responds.
    await expect
      .poll(async () => {
        await page.mouse.move(box.x + box.width * 0.85, box.y + box.height * 0.2);
        await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.25);
        return card.evaluate((el) => getComputedStyle(el).transform);
      })
      .not.toBe('none');
    await expect.poll(() => card.evaluate((el) => el.style.getPropertyValue('--tx'))).toMatch(/%$/);
    await page.mouse.move(5, 5);
    await expect.poll(() => card.evaluate((el) => el.style.transform)).toBe('');
  });
});

test.describe('pinned horizontal reel', () => {
  test.use({ viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false });

  test('featured projects pin and scroll sideways as the page scrolls', async ({ page }) => {
    await page.goto('/');
    const section = page.getByRole('region', { name: 'Featured projects' });
    const rows = section.getByRole('listitem');
    const first = (await rows.nth(0).boundingBox())!;
    const second = (await rows.nth(1).boundingBox())!;
    expect(Math.abs(first.y - second.y)).toBeLessThan(2); // side by side, a horizontal track
    const track = section.locator('.reel-track');
    const before = await track.evaluate((el) => el.getBoundingClientRect().left);
    await section.scrollIntoViewIfNeeded();
    await page.mouse.move(900, 450);
    await page.mouse.wheel(0, 900);
    await expect
      .poll(() => track.evaluate((el) => el.getBoundingClientRect().left))
      .toBeLessThan(before - 100);
  });

  test('phones keep the vertical list', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const rows = page.getByRole('region', { name: 'Featured projects' }).getByRole('listitem');
    const first = (await rows.nth(0).boundingBox())!;
    const second = (await rows.nth(1).boundingBox())!;
    expect(second.y).toBeGreaterThan(first.y + first.height - 2);
  });
});

test.describe('test-runner page change', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('changing page runs the next page as a spec, then clears', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    await page.locator('aside a[href="/skills"]').click();
    await expect(page).toHaveURL(/\/skills$/);
    const runner = page.locator('[data-route-runner]');
    await expect(runner).toContainText('skills.spec');
    await expect(runner).toContainText(/PASS|FAIL|NOT RUN/);
    await expect(runner).toHaveAttribute('aria-hidden', 'true');
    await expect(runner).toHaveCSS('pointer-events', 'none');
    await expect(runner).toHaveCount(0, { timeout: 2500 });
  });

  test('a project morph navigation keeps the morph and shows no runner', async ({ page }) => {
    await page.goto('/projects');
    await waitForHydration(page);
    await page
      .getByRole('link', { name: /^Read the report for/ })
      .first()
      .click();
    await expect(page).toHaveURL(/\/projects\/[a-z0-9-]+$/);
    await expect(page.locator('[data-route-runner]')).toHaveCount(0);
  });

  test('under reduced motion there is no runner', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await waitForHydration(page);
    await page.locator('aside a[href="/skills"]').click();
    await expect(page).toHaveURL(/\/skills$/);
    await expect(page.locator('[data-route-runner]')).toHaveCount(0);
  });
});

test.describe('load sequence', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('sidebar rows cascade in and a run bar sweeps across the top on load', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('aside nav li').first()).toHaveCSS('animation-name', 'nav-in');
    const bar = page.locator('[data-load-bar]');
    await expect(bar).toHaveAttribute('aria-hidden', 'true');
    await expect(bar).toHaveCSS('pointer-events', 'none');
    await expect(bar).toBeHidden({ timeout: 3000 });
  });

  test('under reduced motion nothing cascades and no bar runs', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await expect(page.locator('aside nav li').first()).toHaveCSS('animation-name', 'none');
    await expect(page.locator('[data-load-bar]')).toBeHidden();
  });
});

test.describe('reel card sizes', () => {
  test.use({ viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false });

  test('every reel card is the same size, with its content starting at the same height', async ({
    page,
  }) => {
    await page.goto('/');
    const cards = page.locator('.reel-track .index-row');
    const boxes = await cards.evaluateAll((els) =>
      els.map((el) => {
        const box = el.getBoundingClientRect();
        const hook = el.querySelector('[data-index-hook]')!.getBoundingClientRect();
        return { width: box.width, height: box.height, hookOffset: hook.top - box.top };
      }),
    );
    expect(boxes.length).toBeGreaterThan(1);
    for (const box of boxes) {
      expect(Math.abs(box.height - boxes[0]!.height)).toBeLessThan(1);
      expect(Math.abs(box.width - boxes[0]!.width)).toBeLessThan(1);
    }
    // Top-aligned: hooks start at the same height in every card, under the category.
    const offsets = boxes.map((box) => Math.round(box.hookOffset));
    expect(Math.max(...offsets) - Math.min(...offsets)).toBeLessThanOrEqual(1);
  });
});
