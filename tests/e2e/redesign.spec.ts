import { expect, test } from '../helpers/test';
import { profile, timeline } from '../../src/content';
import { projectsInOrder, visible } from '../../src/lib/content';
import { waitForHydration } from '../helpers/hydration';

test.describe('pull cord', () => {
  // The cord is the desktop theme switch; the drawer carries the theme toggle below 1024px.
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('the light switch flips the theme and the choice persists', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await waitForHydration(page);
    const cord = page.getByRole('button', { name: 'Light switch' });
    await cord.click();
    await expect(page.locator('html')).toHaveClass(/\blight\b/);
    await expect(cord).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(page.locator('html')).toHaveClass(/\blight\b/);
  });

  test('the cord starts above the top edge by more than a tug pulls it down', async ({ page }) => {
    await page.goto('/');
    const string = page.locator('[data-pull-cord] > span').first();
    const top = (await string.boundingBox())!.y;
    // The tug keyframes move the cord down 1.75rem (28px) at most.
    expect(top).toBeLessThan(-28);
  });
});

test.describe('local time', () => {
  test('local time shows Manila time for the profile location', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    const time = page.locator('[data-local-time]').first();
    await expect(time).toHaveText(
      new RegExp(`^Local time \\d{1,2}:\\d{2} (am|pm) · ${profile.location}$`),
    );
  });
});

test.describe('time machine', () => {
  test('one year per group and every timeline entry exactly once', async ({ page }) => {
    await page.goto('/about');
    const machine = page.locator('.time-machine');
    const events = visible(timeline);
    const years = [
      ...new Set(events.map((e) => (e.kind === 'next' ? 'Next' : e.date.slice(0, 4)))),
    ];
    await expect(machine.locator('[data-year-group]')).toHaveCount(years.length);
    for (const year of years) {
      await expect(machine.getByRole('heading', { level: 3, name: year })).toHaveCount(1);
    }
    for (const event of events) {
      await expect(machine.getByText(event.title, { exact: true })).toHaveCount(1);
    }
  });
});

test.describe('time machine years', () => {
  test('every year shows all four digits at every width', async ({ page }) => {
    await page.goto('/about');
    for (const width of [768, 1024, 1280, 1536, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      const clipped = await page
        .locator('.tm-year-window')
        .evaluateAll((windows) =>
          windows.filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => el.textContent),
        );
      expect(clipped, `clipped years at ${width} px`).toEqual([]);
    }
  });
});

test.describe('suite doors', () => {
  test('each project is a door with one report link of touch size', async ({ page }) => {
    await page.goto('/projects');
    await expect(page.locator('main article.suite-door')).toHaveCount(projectsInOrder().length);
    const first = projectsInOrder()[0]!;
    const link = page.getByRole('link', { name: `Read the report for ${first.name}` });
    const box = (await link.boundingBox())!;
    expect(box.height).toBeGreaterThanOrEqual(44);
  });

  test('a click anywhere on a door opens its report', async ({ page }) => {
    await page.goto('/projects');
    await waitForHydration(page);
    const first = projectsInOrder()[0]!;
    await page
      .locator('main article.suite-door')
      .first()
      .click({ position: { x: 30, y: 60 } });
    await expect(page).toHaveURL(new RegExp(`/projects/${first.slug}$`));
  });

  test.describe('hover', () => {
    test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

    test('a scan clears the front to show the result, and nothing rotates', async ({ page }) => {
      await page.goto('/projects');
      const door = page.locator('main article.suite-door').first();
      const front = door.locator('.door-panel');
      await door.hover();
      await expect
        .poll(() => front.evaluate((el) => getComputedStyle(el).clipPath))
        .toMatch(/^inset\(100%/);
      expect(await front.evaluate((el) => getComputedStyle(el).rotate)).toBe('none');
      await expect(door.locator('.door-back').getByText(projectsInOrder()[0]!.hook)).toBeVisible();
    });
  });

  test('the door grid does not overflow at 320 px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/projects');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe('drawn underlines', () => {
  test('timeline links keep a resting underline and draw an accent one on hover', async ({
    page,
  }) => {
    // Reduced motion holds the scroll-linked entrances still, so the row stays under the pointer;
    // the underline still ends drawn.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/about');
    const link = page.locator('.timeline-track a.draw-link').first();
    const sizes = () => link.evaluate((el) => getComputedStyle(el).backgroundSize);
    expect(await sizes()).toMatch(/^0(px|%) 1px, 100% 1px$/);
    await link.hover();
    await expect.poll(sizes).toMatch(/^100% 1px, 100% 1px$/);
  });
});

test.describe('no colour flashes', () => {
  test('cards carry no sweeping highlight and page changes paint no colour band', async ({
    page,
  }) => {
    await page.goto('/');
    const sweeps = await page.evaluate(
      () =>
        [...document.querySelectorAll('main *')].filter((el) => {
          const after = getComputedStyle(el, '::after');
          return after.content !== 'none' && after.backgroundImage.includes('gradient');
        }).length,
    );
    expect(sweeps).toBe(0);
    const rules = await page.evaluate(() =>
      [...document.styleSheets]
        .flatMap((sheet) => {
          try {
            return [...sheet.cssRules].map((rule) => rule.cssText);
          } catch {
            return [];
          }
        })
        .join('\n'),
    );
    expect(rules).not.toMatch(
      /view-transition-image-pair\([^)]*page-curtain[^)]*\)\s*\{[^}]*background/,
    );
  });
});
