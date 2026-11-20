import { expect, test, type Page } from '../helpers/test';
import { waitForHydration } from '../helpers/hydration';
import { bringToCentre } from '../helpers/pointer';
import { settleTransitions } from '../helpers/transitions';

// The signatures the minimal reset keeps (C51): the theme flood, a project row flying into its report
// title, and an evidence thumbnail growing into its full view.

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

/** Records the pseudo-elements each view transition animates, as it becomes ready. */
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

/** Records the CSS animation names on view-transition pseudo-elements, as each transition is ready. */
async function recordSheetAnimations(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __vtNames: string[] };
    w.__vtNames = [];
    const start = document.startViewTransition?.bind(document);
    if (!start) return;
    document.startViewTransition = ((arg: never) => {
      const transition = start(arg);
      transition.ready
        .then(() => {
          for (const animation of document.getAnimations()) {
            if (
              (animation.effect as KeyframeEffect | null)?.pseudoElement &&
              'animationName' in animation
            )
              w.__vtNames.push(
                `${(animation as CSSAnimation).animationName} ${(animation.effect as KeyframeEffect).getComputedTiming().duration}`,
              );
          }
        })
        .catch(() => {});
      return transition;
    }) as typeof document.startViewTransition;
  });
}
const sheetAnimations = (page: Page) =>
  page.evaluate(() => (window as unknown as { __vtNames: string[] }).__vtNames);

const darkToggle = (page: Page) =>
  page.locator('[data-site-header]').getByRole('button', { name: 'Dark theme' });

test.describe('theme flood', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('the switch floods the page with the new theme', async ({ page }) => {
    await recordTransitions(page);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await waitForHydration(page);
    await darkToggle(page).click();
    await expect(page.locator('html')).toHaveClass(/\bdark\b/);
    expect((await transitions(page)).some((types) => types.includes('theme'))).toBe(true);
  });

  test('under reduced motion the theme switches with no transition', async ({ page }) => {
    await recordTransitions(page);
    await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
    await page.goto('/');
    await waitForHydration(page);
    await darkToggle(page).click();
    await expect(page.locator('html')).toHaveClass(/\bdark\b/);
    expect((await transitions(page)).some((types) => types.includes('theme'))).toBe(false);
  });
});

test.describe('project to report', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('a home row flies its name into the report title', async ({ page }) => {
    await recordMorphs(page);
    await page.goto('/');
    await waitForHydration(page);
    const row = page
      .getByRole('region', { name: 'Projects', exact: true })
      .getByRole('heading', { level: 3 })
      .first()
      .getByRole('link');
    const href = (await row.getAttribute('href'))!;
    const slug = href.split('/').pop()!;
    // Click it where a person would, in the middle of the screen, not mid-rise at the bottom edge.
    await bringToCentre(row);
    await row.click();
    await expect(page).toHaveURL(new RegExp(`${href}$`));
    await expect
      .poll(() =>
        page.evaluate(() => (window as unknown as { __morphs: string[] }).__morphs.join('|')),
      )
      .toMatch(new RegExp(`project-title-${slug}`));
  });
});

test.describe('evidence grows into its dialog', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

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

test.describe('page change', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('a page change slides the new page up over the old', async ({ page }) => {
    await recordSheetAnimations(page);
    await page.goto('/');
    await waitForHydration(page);
    await page
      .locator('[data-site-header] nav[aria-label="Site"]')
      .getByRole('link', { name: 'About' })
      .click();
    await expect(page).toHaveURL(/\/about$/);
    // C53: the sheet takes 0.7 s, so it is seen sliding up.
    await expect
      .poll(() => sheetAnimations(page))
      .toEqual(expect.arrayContaining(['vt-sheet 700', 'vt-sink 700']));
  });

  test('under reduced motion a page change does not slide', async ({ page }) => {
    await recordSheetAnimations(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await waitForHydration(page);
    await page
      .locator('[data-site-header] nav[aria-label="Site"]')
      .getByRole('link', { name: 'About' })
      .click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator('main header h1')).toHaveAccessibleName('About');
    const names = await sheetAnimations(page);
    expect(names.some((name) => name.startsWith('vt-'))).toBe(false);
  });
});

// Final review (C53) #3: the top bar is its own transition group, painted above the pages, so the old
// page never slides over it; and the theme flood's circle covers it like the rest of the page.
test.describe('the top bar in transitions', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  const recordScripted = (page: Page) =>
    page.addInitScript(() => {
      const w = window as unknown as { __pseudo: string[]; __headerZ: string[] };
      w.__pseudo = [];
      w.__headerZ = [];
      const animate = Element.prototype.animate;
      Element.prototype.animate = function (keyframes, options) {
        const pseudo = typeof options === 'object' ? options?.pseudoElement : undefined;
        if (pseudo) w.__pseudo.push(pseudo);
        return animate.call(this, keyframes, options);
      };
      const start = document.startViewTransition?.bind(document);
      if (!start) return;
      document.startViewTransition = ((arg: never) => {
        const transition = start(arg);
        transition.ready
          .then(() =>
            w.__headerZ.push(
              getComputedStyle(document.documentElement, '::view-transition-group(site-header)')
                .zIndex,
            ),
          )
          .catch(() => {});
        return transition;
      }) as typeof document.startViewTransition;
    });

  test('a page change keeps the top bar above the sliding pages', async ({ page }) => {
    await recordScripted(page);
    await page.goto('/');
    await waitForHydration(page);
    await page
      .locator('[data-site-header] nav[aria-label="Site"]')
      .getByRole('link', { name: 'About' })
      .click();
    await expect(page).toHaveURL(/\/about$/);
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __headerZ: string[] }).__headerZ))
      .toEqual(['1']);
  });

  test('the theme flood covers the top bar too', async ({ page }) => {
    await recordScripted(page);
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await waitForHydration(page);
    await darkToggle(page).click();
    await expect(page.locator('html')).toHaveClass(/\bdark\b/);
    await expect
      .poll(() => page.evaluate(() => (window as unknown as { __pseudo: string[] }).__pseudo))
      .toEqual(
        expect.arrayContaining([
          '::view-transition-new(root)',
          '::view-transition-new(site-header)',
        ]),
      );
  });
});
