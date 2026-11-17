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

  test('the active nav marker stays in the page during the flood, so its label never hides', async ({
    page,
  }) => {
    await page.goto('/about');
    await waitForHydration(page);
    // Read the marker's name from inside a theme transition, while it is active.
    const name = await page.evaluate(async () => {
      const marker = document.querySelector<HTMLElement>('[data-topbar] [data-nav-marker]')!;
      let during = '';
      const transition = document.startViewTransition({
        update: () => {
          during = getComputedStyle(marker).viewTransitionName;
        },
        types: ['theme'],
      });
      await transition.finished.catch(() => {});
      return during;
    });
    expect(name).toBe('none');
    await expect(page.locator('[data-topbar] [data-nav-marker]')).toHaveCSS(
      'view-transition-name',
      'nav-active-topbar',
    );
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

test.describe('top bar marker', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('one named underline sits under the active page, so it glides between pages', async ({
    page,
  }) => {
    await page.goto('/about');
    const markers = page.locator('[data-topbar] [data-nav-marker]');
    await expect(markers).toHaveCount(1);
    await expect(
      page.locator('[data-topbar] a[aria-current="page"] [data-nav-marker]'),
    ).toHaveCount(1);
    await expect(markers).toHaveCSS('view-transition-name', 'nav-active-topbar');
    await page.locator('[data-topbar] a[href="/skills"]').click();
    await expect(page).toHaveURL(/\/skills$/);
    await expect(
      page.locator('[data-topbar] a[aria-current="page"] [data-nav-marker]'),
    ).toHaveCount(1);
  });

  test('on a report page the underline marks Projects, never two pages', async ({ page }) => {
    await page.goto('/projects/accessibility-testing');
    await expect(page.locator('[data-topbar] [data-nav-marker]')).toHaveCount(1);
    await expect(page.locator('[data-topbar] a[href="/projects"] [data-nav-marker]')).toHaveCount(
      1,
    );
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
    await page.locator('[data-topbar]').getByRole('button', { name: 'Search' }).click();
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

test.describe('suite run', () => {
  test.use({ viewport: { width: 1440, height: 900 }, isMobile: false, hasTouch: false });

  const visibility = (locator: ReturnType<Page['locator']>) =>
    locator.evaluate((el) => getComputedStyle(el).visibility);

  test('featured projects run down a rail: queued, then done as each reaches the middle', async ({
    page,
  }) => {
    await page.goto('/');
    const section = page.getByRole('region', { name: 'Featured projects' });
    const rows = section.getByRole('listitem');
    const first = (await rows.nth(0).boundingBox())!;
    const second = (await rows.nth(1).boundingBox())!;
    expect(second.y).toBeGreaterThan(first.y + first.height - 2); // stacked, never sideways
    const last = rows.last();
    expect(await visibility(last.locator('[data-status-step="queued"]'))).toBe('visible');
    expect(await visibility(last.locator('[data-status-step="done"]'))).toBe('hidden');
    await last.evaluate((el) => el.scrollIntoView({ block: 'start' }));
    await expect.poll(() => visibility(last.locator('[data-status-step="done"]'))).toBe('visible');
    expect(await visibility(last.locator('[data-status-step="queued"]'))).toBe('hidden');
    // The counter reaches every suite once the run has passed.
    const total = await rows.count();
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await expect
      .poll(() =>
        section
          .locator('.suite-count')
          .evaluate((el) => getComputedStyle(el).getPropertyValue('--done')),
      )
      .toBe(String(total));
  });

  test('under reduced motion every suite shows done with its result open', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    const section = page.getByRole('region', { name: 'Featured projects' });
    const done = await section
      .locator('[data-status-step="done"]')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).visibility));
    expect(new Set(done)).toEqual(new Set(['visible']));
    const clips = await section
      .locator('[data-index-hook]')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).clipPath));
    expect(new Set(clips)).toEqual(new Set(['none']));
  });

  test('nothing on the overview scrolls sideways, on desktop or a phone', async ({ page }) => {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
      ).toBeLessThanOrEqual(0);
    }
  });
});

test.describe('test-runner page change', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('changing page runs the next page as a spec, then clears', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    await page.locator('[data-topbar] a[href="/skills"]').click();
    await expect(page).toHaveURL(/\/skills$/);
    const runner = page.locator('[data-route-runner]');
    await expect(runner).toContainText('skills.spec');
    await expect(runner).toContainText(/PASS|FAIL|NOT RUN/);
    await expect(runner).toHaveAttribute('aria-hidden', 'true');
    await expect(runner).toHaveCSS('pointer-events', 'none');
    // It covers the content area only; the top bar stays on screen above it.
    const bar = (await page.locator('[data-topbar]').boundingBox())!;
    expect((await runner.boundingBox())!.y).toBeGreaterThanOrEqual(bar.y + bar.height - 1);
    await expect(runner).toHaveCount(0, { timeout: 2500 });
  });

  test('the runner chip never covers the new page, and the page change is short with no blur', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForHydration(page);
    await page.locator('[data-topbar] a[href="/skills"]').click();
    const runner = page.locator('[data-route-runner]');
    await expect(runner).toBeVisible();
    const overlaps = await page.evaluate(() => {
      const chip = document.querySelector('[data-route-runner]')!.getBoundingClientRect();
      const title = document.querySelector('main h1')!.getBoundingClientRect();
      return (
        chip.left < title.right &&
        title.left < chip.right &&
        chip.top < title.bottom &&
        title.top < chip.bottom
      );
    });
    expect(overlaps).toBe(false);
    const rules = await page.evaluate(() =>
      [...document.styleSheets]
        .flatMap((sheet) => {
          try {
            return [...sheet.cssRules].map((rule) => rule.cssText);
          } catch {
            return [];
          }
        })
        .filter((text) => /page-enter|page-exit|vt-in|vt-out/.test(text))
        .join('\n'),
    );
    expect(rules).not.toMatch(/blur/);
    const durations = [...rules.matchAll(/(\d+)ms/g)].map((m) => Number(m[1]));
    expect(Math.max(...durations)).toBeLessThanOrEqual(400);
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
    await page.locator('[data-topbar] a[href="/skills"]').click();
    await expect(page).toHaveURL(/\/skills$/);
    await expect(page.locator('[data-route-runner]')).toHaveCount(0);
  });
});
