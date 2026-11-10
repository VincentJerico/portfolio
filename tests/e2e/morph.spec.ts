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
      .toMatch(new RegExp(`project-suite-${slug}.*|project-cat-${slug}`));
    const morphs = await page.evaluate(
      () => (window as unknown as { __morphs: string[] }).__morphs,
    );
    for (const part of ['suite', 'cat', 'title']) {
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
