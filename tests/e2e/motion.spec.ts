import { expect, test, type Locator, type Page } from '../helpers/test';
import { sameColour, srgb } from '../helpers/colour';
import { pointAt } from '../helpers/pointer';
import { metrics, profile } from '../../src/content';
import { waitForHydration } from '../helpers/hydration';

// C50's one rhythm, kept by the minimal reset (C51): everything that arrives rises 16 px over 400 ms,
// list rows answer the pointer, and nothing moves under reduced motion.

const animationName = (locator: Locator) =>
  locator.evaluate((el) => getComputedStyle(el).animationName);

// C54 moved the grain over the content; 'depth and blending' checks its layer and blend.
test('the paper has a still grain', async ({ page }) => {
  await page.goto('/');
  const grain = await page.locator('[data-paper-grain]').evaluate((el) => {
    const style = getComputedStyle(el);
    return {
      position: style.position,
      pointerEvents: style.pointerEvents,
      image: style.backgroundImage,
      animation: style.animationName,
    };
  });
  expect(grain.position).toBe('fixed');
  expect(grain.pointerEvents).toBe('none');
  expect(grain.image).toContain('data:image/svg+xml');
  expect(grain.animation).toBe('none');
});

test.describe('arrivals', () => {
  test('the poster rises in on the home page', async ({ page }) => {
    await page.goto('/');
    expect(await animationName(page.locator('[data-poster] > .poster-line'))).toBe('rise');
  });

  test('the 404 page arrives like every other page', async ({ page }) => {
    await page.goto('/no-such-page');
    expect(await animationName(page.locator('main header > h1 .letter').first())).toBe('letter');
  });

  test('page titles arrive letter by letter', async ({ page }) => {
    await page.goto('/about');
    const h1 = page.locator('main header h1');
    const letters = h1.locator('.letter');
    await expect(letters).toHaveCount(5);
    expect(await h1.evaluate((el) => el.textContent)).toBe('About');
    // Inline-block letters read as separate words, so the heading must carry its text as its name.
    await expect(h1).toHaveAccessibleName('About');
    // Nothing starts hidden, so the largest paint is never held back by the motion.
    expect(await letters.first().evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    expect(
      await letters.evaluateAll((els) =>
        els.map((el) => getComputedStyle(el).getPropertyValue('--i').trim()),
      ),
    ).toEqual(['0', '1', '2', '3', '4']);
    expect(await animationName(letters.first())).toBe('letter');
    // C53: clearly letter by letter: 45 ms apart, 0.8 s each, on the glide.
    expect(await letters.nth(4).evaluate((el) => getComputedStyle(el).animationDelay)).toBe(
      '0.18s',
    );
    expect(await letters.first().evaluate((el) => getComputedStyle(el).animationDuration)).toBe(
      '0.8s',
    );
    expect(
      await letters.first().evaluate((el) => getComputedStyle(el).animationTimingFunction),
    ).toBe('cubic-bezier(0.16, 1, 0.3, 1)');
  });

  // The poster's lines stay whole text, so the name is the page's largest paint (LCP budget); split into
  // letters, the headline became the largest paint and CI measured it late. It rises in as one.
  // C53: line one slides in from the left and line two from the right, each still whole text.
  test('the poster slides in line by line, its lines unsplit', async ({ page }) => {
    await page.goto('/');
    const poster = page.locator('h1.poster');
    await expect(poster.locator('.letter')).toHaveCount(0);
    const lines = poster.locator('> span:not(.sr-only)');
    expect(await animationName(lines.nth(0))).toBe('poster-left');
    expect(await animationName(lines.nth(1))).toBe('poster-right');
    expect(await lines.nth(0).evaluate((el) => getComputedStyle(el).animationDuration)).toBe(
      '0.9s',
    );
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
    // The theme switch is the pull cord on wide screens (it is tugged, not pressed), so press a button.
    await page.goto('/contact');
    await waitForHydration(page);
    const button = page.getByRole('button', { name: 'Copy email' });
    await button.hover();
    await page.mouse.down();
    await expect.poll(() => button.evaluate((el) => getComputedStyle(el).scale)).toBe('0.96');
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
      // C54 T7: the copy icon swaps to a check through blur and scale; the copy icon blurs away.
      const swap = button.locator('.icon-swap');
      await expect(swap).toHaveAttribute('data-show', 'second');
      const icons = swap.locator('svg');
      await expect
        .poll(() => icons.nth(1).evaluate((el) => getComputedStyle(el).opacity))
        .toBe('1');
      await expect
        .poll(() => icons.nth(0).evaluate((el) => getComputedStyle(el).opacity))
        .toBe('0');
      expect(await icons.nth(0).evaluate((el) => getComputedStyle(el).filter)).toContain('blur');
      expect(
        await icons.nth(1).evaluate((el) => getComputedStyle(el).transitionProperty),
      ).toContain('filter');
      // Review focus 5: copying again while the check shows leaves exactly one icon showing.
      await button.click();
      await expect
        .poll(() =>
          icons.evaluateAll(
            (els) => els.filter((el) => getComputedStyle(el).opacity === '1').length,
          ),
        )
        .toBe(1);
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

// Every engine the suite runs (Chromium, WebKit) has scroll-driven animations; engines without them
// are covered by motion-fallback.spec.ts.
test.describe('scroll-linked', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('the ending grows into a sheet, the CV ring turns and the arrow draws', async ({ page }) => {
    await page.goto('/');
    const contact = page.getByRole('region', { name: 'Contact' });
    expect(await animationName(contact)).toBe('sheet');
    const ring = contact.locator('.cv-ring svg');
    expect(await animationName(ring)).toBe('ring-turn');
    expect(await ring.evaluate((el) => getComputedStyle(el).animationTimeline)).toMatch(
      /^scroll\(root/,
    );
    expect(await animationName(contact.locator('.contact-arrow path'))).toBe('draw');
  });

  test('a rule draws under the top bar once you scroll', async ({ page }) => {
    await page.goto('/');
    const rule = await page.evaluate(() => {
      const style = getComputedStyle(document.querySelector('[data-site-header]')!, '::after');
      return { name: style.animationName, timeline: style.animationTimeline };
    });
    expect(rule.name).toBe('header-rule');
    expect(rule.timeline).toMatch(/^scroll\(root/);
  });

  // Final review #3: the strip drifts, at most a pixel of travel per pixel scrolled.
  test('the skills strip drifts gently with the scroll', async ({ page }) => {
    await page.goto('/');
    const strip = page.locator('.marquee');
    const row = strip.locator('.marquee-row').first();
    await strip.evaluate((el) =>
      window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - window.innerHeight / 2),
    );
    // Scroll-driven styles land a frame or more after the scroll (later on Linux WebKit): read a
    // position only once it holds still across frames.
    const settledLeft = () =>
      row.evaluate(async (el) => {
        const frame = () => new Promise((resolve) => requestAnimationFrame(resolve));
        let last = NaN;
        for (let i = 0; i < 30; i++) {
          await frame();
          await frame();
          const left = el.getBoundingClientRect().left;
          if (left === last) return left;
          last = left;
        }
        return last;
      });
    const x1 = await settledLeft();
    await page.evaluate(() => window.scrollBy(0, 200));
    const x2 = await settledLeft();
    // C53: more travel, still a drift: over a pixel per pixel scrolled, at most 1.5.
    expect(Math.abs(x2 - x1)).toBeGreaterThan(200);
    expect(Math.abs(x2 - x1)).toBeLessThanOrEqual(300);
  });

  test('the skills strip moves with the scroll', async ({ page }) => {
    await page.goto('/');
    const rows = page.locator('.marquee-row');
    expect(await animationName(rows.first())).toBe('marquee');
    expect(await animationName(rows.nth(1))).toBe('marquee-back');
    expect(await rows.first().evaluate((el) => getComputedStyle(el).animationTimeline)).toBe(
      '--strip',
    );
  });
});

test.describe('about', () => {
  const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  test('the intro reads in full and inks in word by word', async ({ page }) => {
    await page.goto('/about');
    const intro = page.locator('.ink-text');
    await expect(intro).toHaveCount(1);
    expect(await intro.evaluate((el) => el.textContent!.replace(/\s+/g, ' ').trim())).toBe(
      profile.intro,
    );
    const words = intro.locator('> span');
    expect(await animationName(words.first())).toBe('ink');
    const delays = await words.evaluateAll((els) =>
      els.slice(0, 3).map((el) => parseFloat(getComputedStyle(el).animationDelay)),
    );
    expect(delays[1]).toBeGreaterThan(delays[0]!);
    expect(delays[2]).toBeGreaterThan(delays[1]!);
  });

  test('each number lands on its recorded value', async ({ page }) => {
    await page.goto('/about');
    const values = page.locator('#numbers .metric-value');
    await expect(values).toHaveCount(metrics.length);
    for (const [i, metric] of metrics.entries()) {
      const value = values.nth(i);
      expect(await value.evaluate((el) => el.textContent)).toBe(metric.value);
      // The rolling digits above each real digit are never read out.
      expect(await value.ariaSnapshot()).toMatch(
        new RegExp(`^- paragraph: "?${escape(metric.value)}"?$`),
      );
    }
  });

  // Final review #1: a scrubbed odometer rests on wrong digits wherever the list is on screen at
  // load, so the digits roll once as each number comes into view and then rest on the data.
  test('the digits roll for 1.2 s, left to right', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/about');
    await waitForHydration(page);
    const value = page.locator('#numbers .metric-value').filter({ hasText: /^108$/ });
    await expect(value.locator('xpath=ancestor::li[1]')).toHaveAttribute('data-roll', '');
    const reels = value.locator('.odo-reel');
    const timing = await reels.evaluateAll((els) =>
      els.map(
        (el) => `${getComputedStyle(el).animationDuration} ${getComputedStyle(el).animationDelay}`,
      ),
    );
    expect(timing).toEqual(['1.2s 0s', '1.2s 0.08s', '1.2s 0.16s']);
  });

  test('the numbers roll once as they come into view, then rest on their values', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/about');
    await waitForHydration(page);
    const items = page.locator('#numbers li');
    const last = items.last();
    expect(await last.getAttribute('data-roll')).toBeNull();
    await last.scrollIntoViewIfNeeded();
    await expect(last).toHaveAttribute('data-roll', '');
    expect(await animationName(last.locator('.odo-reel').first())).toBe('odo');
  });

  test.describe('on a big screen', () => {
    test.use({ viewport: { width: 1920, height: 1080 }, isMobile: false, hasTouch: false });

    test('numbers on screen at load rest on their values without scrolling', async ({ page }) => {
      await page.goto('/about');
      await waitForHydration(page);
      const rolls = () =>
        page
          .locator('#numbers .odo-reel')
          .evaluateAll((els) => els.map((el) => getComputedStyle(el).getPropertyValue('--roll')));
      await expect
        .poll(async () => (await rolls()).every((roll) => Number(roll) === 0), { timeout: 5000 })
        .toBe(true);
    });
  });

  test.describe('on a wide screen', () => {
    test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

    test('the career path slides sideways', async ({ page }) => {
      await page.goto('/about');
      const track = page.locator('.career-track');
      const steps = track.locator('ol > li');
      expect(await animationName(track.locator('ol'))).toBe('career');
      await track.evaluate((el) =>
        window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY),
      );
      await expect.poll(async () => (await steps.first().boundingBox())!.x).toBeLessThan(1280);
      await track.evaluate((el) =>
        window.scrollTo(0, el.getBoundingClientRect().bottom + window.scrollY - window.innerHeight),
      );
      await expect
        .poll(async () => {
          const box = (await steps.last().boundingBox())!;
          return box.x + box.width;
        })
        .toBeLessThanOrEqual(1280);
    });

    test('the checklist piles up as you read', async ({ page }) => {
      await page.goto('/about');
      const list = page.locator('#method ol');
      const items = list.locator('> li');
      await list.evaluate((el) => {
        const first = el.children[0] as HTMLElement;
        const top = el.getBoundingClientRect().top + window.scrollY;
        window.scrollTo(0, top - 56 + first.offsetHeight * 5);
      });
      await expect
        .poll(async () => {
          const a = (await items.nth(0).boundingBox())!;
          const b = (await items.nth(1).boundingBox())!;
          return Math.round(b.y - a.y);
        })
        .toBe(8);
      expect((await items.nth(1).boundingBox())!.y).toBeLessThan(200);
    });
  });

  test.describe('on a phone', () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

    test('the career path is a plain list', async ({ page }) => {
      await page.goto('/about');
      const list = page.locator('.career-track ol');
      expect(await animationName(list)).toBe('none');
      const tops = await list
        .locator('> li')
        .evaluateAll((els) => els.map((el) => el.getBoundingClientRect().top));
      expect(tops).toEqual([...tops].sort((a, b) => a - b));
      expect(new Set(tops).size).toBe(tops.length);
    });
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
    await page.goto('/about');
    expect(await animationName(page.locator('main header h1 .letter').first())).toBe('none');
    const ink = await page.evaluate(() => {
      const el = document.createElement('span');
      el.style.color = 'var(--text)';
      document.body.append(el);
      const rgb = getComputedStyle(el).color;
      el.remove();
      return rgb;
    });
    expect(
      await page
        .locator('.ink-text span')
        .first()
        .evaluate((el) => getComputedStyle(el).color),
    ).toBe(ink);
    await page.goto('/');
    const copy = page.locator('.marquee-row ul[aria-hidden="true"]').first();
    expect(await copy.evaluate((el) => getComputedStyle(el).display)).toBe('none');
    expect(
      await page
        .locator('.marquee-row')
        .first()
        .evaluate((el) => getComputedStyle(el).flexWrap),
    ).toBe('wrap');
    await page.goto('/about');
    expect(await animationName(page.locator('#numbers .odo-reel').first())).toBe('none');
    expect(await animationName(page.locator('.career-track ol'))).toBe('none');
    await page.goto('/');
    const contact = page.getByRole('region', { name: 'Contact' });
    expect(await animationName(contact)).toBe('none');
    expect(await animationName(contact.locator('.cv-ring svg'))).toBe('none');
    expect(await animationName(contact.locator('.contact-arrow path'))).toBe('none');
    expect(
      await page.evaluate(
        () => getComputedStyle(document.querySelector('[data-site-header]')!, '::after').scale,
      ),
    ).toMatch(/^(none|1( 1)?)$/);
    await page.goto('/about');
    expect(
      await page
        .locator('#method ol > li')
        .first()
        .evaluate((el) => getComputedStyle(el).position),
    ).toBe('static');
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
      .locator('main header > :not(h1)')
      .evaluateAll((els) =>
        els.map(
          (el) => `${getComputedStyle(el).animationName} ${getComputedStyle(el).animationDuration}`,
        ),
      );
    expect(new Set(header)).toEqual(new Set(['rise 0.7s']));
    // C53: the glide, and 40 px of travel.
    const label = page.locator('main header > :not(h1)').first();
    expect(await label.evaluate((el) => getComputedStyle(el).animationTimingFunction)).toBe(
      'cubic-bezier(0.16, 1, 0.3, 1)',
    );
    // Read from the stylesheet, not a running animation: on a slow machine the arrival has finished
    // by the time the test looks.
    const rise = await page.evaluate(() => {
      const find = (rules: CSSRuleList): string | undefined => {
        for (const rule of Array.from(rules)) {
          if (rule instanceof CSSKeyframesRule && rule.name === 'rise')
            return (rule.cssRules[0] as CSSKeyframeRule).style.translate;
          if ('cssRules' in rule) {
            const found = find((rule as CSSGroupingRule).cssRules);
            if (found) return found;
          }
        }
        return undefined;
      };
      for (const sheet of Array.from(document.styleSheets)) {
        const found = find(sheet.cssRules);
        if (found) return found;
      }
      return undefined;
    });
    expect(rise).toBe('0 var(--arrive-rise)');
    expect(
      await label.evaluate((el) => getComputedStyle(el).getPropertyValue('--arrive-rise').trim()),
    ).toBe('40px');
    const letters = await page
      .locator('main header > h1 .letter')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
    expect(new Set(letters)).toEqual(new Set(['letter']));
    const sections = await page
      .locator('main section')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName));
    expect(new Set(sections)).toEqual(new Set(['rise']));
    await page.goto('/');
    const row = page.locator('.work-row').first();
    await pointAt(page, row.getByRole('link'));
    await expect
      .poll(() =>
        row.locator('.work-row-link > span').evaluate((el) => getComputedStyle(el).translate),
      )
      .toBe('28px');
    // C53: the row number slides with the name.
    await expect
      .poll(() => row.locator('.work-row-num').evaluate((el) => getComputedStyle(el).translate))
      .toBe('28px');
  });
});

// C52 move 9: smooth scrolling for mouse and trackpad only; touch, keyboard, reduced motion and open
// dialogs keep native scrolling.
test.describe('smooth scrolling', () => {
  const smooth = (page: Page) =>
    page.evaluate(() => document.documentElement.classList.contains('lenis'));
  // The component decides on an idle callback; once one has run here, its decision is made.
  const afterIdle = (page: Page) =>
    page.evaluate(
      () =>
        new Promise<void>((resolve) =>
          (window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 200)))(() =>
            window.setTimeout(resolve, 50),
          ),
        ),
    );
  const frames = (page: Page, count: number) =>
    page.evaluate(
      (n) =>
        new Promise<void>((resolve) => {
          const tick = () => (n-- > 0 ? requestAnimationFrame(tick) : resolve());
          tick();
        }),
      count,
    );
  const atBottom = (page: Page) =>
    page.evaluate(
      () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2,
    );

  test.describe('with a mouse', () => {
    test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

    test('the wheel glides, and still reaches the bottom', async ({ page }) => {
      await page.goto('/');
      await waitForHydration(page);
      await expect.poll(() => smooth(page)).toBe(true);
      await page.mouse.move(640, 400);
      await page.mouse.wheel(0, 30000);
      await expect.poll(() => atBottom(page), { timeout: 10_000 }).toBe(true);
    });

    test('the keyboard still scrolls natively', async ({ page }) => {
      await page.goto('/');
      await waitForHydration(page);
      await expect.poll(() => smooth(page)).toBe(true);
      await page.keyboard.press('End');
      await expect.poll(() => atBottom(page), { timeout: 10_000 }).toBe(true);
    });
  });

  test.describe('with a narrow mouse window', () => {
    test.use({ viewport: { width: 700, height: 800 }, isMobile: false, hasTouch: false });

    test('an open menu keeps the page still under the wheel', async ({ page }) => {
      await page.goto('/');
      await waitForHydration(page);
      await expect.poll(() => smooth(page)).toBe(true);
      await page
        .locator('[data-site-header]')
        .getByRole('button', { name: 'Menu', exact: true })
        .click();
      await expect(page.getByRole('dialog', { name: 'Site menu' })).toBeVisible();
      const before = await page.evaluate(() => window.scrollY);
      await page.mouse.move(350, 400);
      await page.mouse.wheel(0, 2000);
      await frames(page, 30);
      expect(await page.evaluate(() => window.scrollY)).toBe(before);
    });
  });

  test.describe('in a narrow mouse window', () => {
    test.use({ viewport: { width: 420, height: 800 }, isMobile: false, hasTouch: false });

    // Final review #4: a sideways trackpad swipe over a wide table scrolls the table, not the page.
    test('a sideways swipe over a wide table scrolls the table', async ({ page }) => {
      await page.goto('/quality');
      await waitForHydration(page);
      await expect.poll(() => smooth(page)).toBe(true);
      const scroller = page.locator('main .overflow-x-auto').first();
      await scroller.scrollIntoViewIfNeeded();
      const max = await scroller.evaluate((el) => el.scrollWidth - el.clientWidth);
      expect(max).toBeGreaterThan(0);
      const box = (await scroller.boundingBox())!;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.wheel(120, 8);
      // Natively, the table takes the whole sideways swipe (up to its end).
      await expect.poll(() => scroller.evaluate((el) => el.scrollLeft)).toBe(Math.min(120, max));
    });
  });

  test.describe('on a touch screen', () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

    test('scrolling stays native', async ({ page }) => {
      await page.goto('/');
      await waitForHydration(page);
      await afterIdle(page);
      expect(await smooth(page)).toBe(false);
    });
  });

  test('reduced motion keeps native scrolling', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await waitForHydration(page);
    await afterIdle(page);
    expect(await smooth(page)).toBe(false);
  });
});

// C54 bugs B1–B4, B8, B9 (the reviews' deferred list).
test.describe('bugs left from the motion reviews', () => {
  for (const [width, height] of [
    [1440, 2400],
    [1080, 1920],
  ] as const) {
    test(`B1: the ending finishes even on a ${width}×${height} window`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/');
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
      const contact = page.getByRole('region', { name: 'Contact' });
      await expect
        .poll(() => contact.evaluate((el) => getComputedStyle(el).clipPath))
        .not.toMatch(/round [1-9]/);
      await expect
        .poll(() =>
          contact
            .locator('.contact-arrow path')
            .evaluate((el) => parseFloat(getComputedStyle(el).strokeDashoffset)),
        )
        .toBe(0);
    });
  }

  test('B1: the arrow still draws as it rises, not all at once', async ({ page }) => {
    await page.goto('/');
    const arrow = page.getByRole('region', { name: 'Contact' }).locator('.contact-arrow');
    // 120 px of scroll after the arrow's top crosses the bottom edge: half of its 240 px draw.
    await arrow.evaluate((el) =>
      window.scrollTo(0, el.getBoundingClientRect().top + scrollY - innerHeight + 120),
    );
    await expect
      .poll(() =>
        arrow.locator('path').evaluate((el) => parseFloat(getComputedStyle(el).strokeDashoffset)),
      )
      .toBeGreaterThan(0.3);
    expect(
      await arrow
        .locator('path')
        .evaluate((el) => parseFloat(getComputedStyle(el).strokeDashoffset)),
    ).toBeLessThan(0.7);
  });

  test('B2: on a phone the growing ending never clips its heading', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const contact = page.getByRole('region', { name: 'Contact' });
    await contact.evaluate((el) =>
      window.scrollTo(
        0,
        el.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.85,
      ),
    );
    // Hit-testing honours clip-path: if the card's inset clipped the heading's first letter, the
    // point just inside its left edge would not land on the heading.
    const onHeading = await contact.evaluate(async (el) => {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const heading = el.querySelector('h2')!;
      const box = heading.getBoundingClientRect();
      const hit = document.elementFromPoint(box.left + 2, box.top + box.height / 2);
      return hit !== null && heading.contains(hit);
    });
    expect(onHeading).toBe(true);
  });

  for (const [width, height] of [
    [1280, 800],
    [844, 390],
  ] as const) {
    test(`B3: the career strip has not moved when it pins at ${width}×${height}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      await page.goto('/about');
      await waitForHydration(page);
      await page.evaluate(() => document.fonts.ready);
      const track = page.locator('.career-track');
      // Where the first step sits before the strip is reached, and where it sits as the strip pins (its
      // top at the 56 px top bar): measured on screen, since the computed translate is a calc().
      const moved = await track.evaluate(async (el) => {
        const frame = () =>
          new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
        // The section around the strip also rises as it scrolls in, so one scroll lands short or long:
        // step until the strip's top really sits where it should.
        const placeTop = async (y: number) => {
          for (let i = 0; i < 8; i++) {
            const delta = el.getBoundingClientRect().top - y;
            if (Math.abs(delta) < 0.5) return;
            window.scrollBy(0, delta);
            await frame();
          }
        };
        const first = el.querySelector('ol > li')!;
        await placeTop(300);
        const before = first.getBoundingClientRect().left;
        await placeTop(56);
        return first.getBoundingClientRect().left - before;
      });
      expect(Math.abs(moved)).toBeLessThanOrEqual(1);
    });
  }

  test('B4: under reduced motion a title can break inside a long word', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/about');
    expect(
      await page
        .locator('main header h1 .word')
        .first()
        .evaluate((el) => getComputedStyle(el).whiteSpace),
    ).toBe('normal');
  });

  test('B8: the cord keeps a halo in the page colour', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    expect(
      await page
        .locator('[data-site-header] [data-pull-cord]')
        .evaluate((el) => getComputedStyle(el).filter),
    ).toContain('drop-shadow');
  });

  test('B9: the phone menu links rise the short way', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 800 });
    await page.goto('/');
    await waitForHydration(page);
    await page
      .locator('[data-site-header]')
      .getByRole('button', { name: 'Menu', exact: true })
      .click();
    const item = page.getByRole('dialog', { name: 'Site menu' }).locator('nav > ul > li').first();
    expect(
      await item.evaluate((el) => getComputedStyle(el).getPropertyValue('--arrive-rise').trim()),
    ).toBe('16px');
  });

  test('B7: the CV ring draws its text on its own path, fitted to the circle', async ({ page }) => {
    await page.goto('/');
    const fit = await page.locator('.cv-ring svg').evaluate((svg) => {
      const textPath = svg.querySelector('textPath')!;
      const id = (textPath.getAttribute('href') ?? '').slice(1);
      const path = svg.querySelector(`[id="${CSS.escape(id)}"]`);
      return { id, inside: path !== null, fitted: Number(textPath.getAttribute('textLength')) };
    });
    expect(fit.id).not.toBe('cv-ring-path');
    expect(fit.inside).toBe(true);
    expect(fit.fitted).toBe(Math.round(2 * Math.PI * 80 * 0.99));
  });
});

// C54 T1, T5, T6, T9: matched radii, matched icon weight, masked edges.
test.describe('polish', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('T1: an evidence thumbnail and its dialog curve concentric with the button inside', async ({
    page,
  }) => {
    await page.goto('/projects/accessibility-testing');
    await waitForHydration(page);
    const thumb = page.getByRole('button', { name: /^Enlarge image/ }).first();
    const concentric = (outer: string, inner: string) =>
      thumb.page().evaluate(
        ([o, i]) => {
          const a = document.querySelector(o)!;
          const b = document.querySelector(i)!;
          const ra = a.getBoundingClientRect();
          const rb = b.getBoundingClientRect();
          const inset = Math.min(rb.top - ra.top, ra.right - rb.right);
          return {
            outer: parseFloat(getComputedStyle(a).borderTopRightRadius),
            inner: parseFloat(getComputedStyle(b).borderTopRightRadius),
            inset,
          };
        },
        [outer, inner] as const,
      );
    const t = await concentric('li[id^="evidence-"] button', 'li[id^="evidence-"] button svg');
    expect(t.outer).toBeCloseTo(t.inner + t.inset, 0);
    await thumb.click();
    await expect(page.getByRole('dialog', { name: /^Evidence/ })).toBeVisible();
    const d = await concentric('dialog[open]', 'dialog[open] button[aria-label="Close image"]');
    expect(d.outer).toBeCloseTo(d.inner + d.inset, 0);
  });

  test('T5: icons draw strokes matched to the text beside them', async ({ page }) => {
    await page.goto('/contact');
    const stroke = await page
      .getByRole('button', { name: 'Copy email' })
      .locator('svg')
      .first()
      .evaluate((el) => ({
        width: getComputedStyle(el).strokeWidth,
        effect: getComputedStyle(el.firstElementChild!).vectorEffect,
      }));
    expect(stroke).toEqual({ width: '1.25px', effect: 'non-scaling-stroke' });
    await page.goto('/');
    const arrow = await page.locator('.contact-arrow').evaluate((svg) => {
      const heading = svg.parentElement!.querySelector('h2')!;
      const path = svg.querySelector('path')!;
      return {
        stroke: parseFloat(getComputedStyle(path).strokeWidth),
        stem: parseFloat(getComputedStyle(heading).fontSize) * 0.11,
        effect: getComputedStyle(path).vectorEffect,
      };
    });
    expect(Math.abs(arrow.stroke - arrow.stem)).toBeLessThanOrEqual(0.5);
    expect(arrow.effect).toBe('non-scaling-stroke');
  });

  test('T6: the skills strip and the career strip fade out at their edges', async ({ page }) => {
    await page.goto('/');
    expect(
      await page.locator('.marquee').evaluate((el) => getComputedStyle(el).maskImage),
    ).toContain('linear-gradient');
    await page.goto('/about');
    expect(
      await page.locator('.career-sticky').evaluate((el) => getComputedStyle(el).maskImage),
    ).toContain('linear-gradient');
    // Wrapped (reduced motion), nothing is masked, so the first and last skills stay whole.
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    expect(await page.locator('.marquee').evaluate((el) => getComputedStyle(el).maskImage)).toBe(
      'none',
    );
  });
});

// C54 T8, T10 (and B6): dark mode depth; the grain over every surface; thumbnails blended on paper.
test.describe('depth and blending', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  const token = (page: Page, name: string) =>
    page.evaluate(
      (n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(),
      name,
    );

  test('T8: in the dark theme the top bar and dialogs rise in lighter layers', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    const header = await page
      .locator('[data-site-header]')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(
      sameColour(await srgb(page, header), await srgb(page, await token(page, '--surface'))),
    ).toBe(true);
    await page.goto('/projects/accessibility-testing');
    await waitForHydration(page);
    await page
      .getByRole('button', { name: /^Enlarge image/ })
      .first()
      .click();
    const dialog = page.getByRole('dialog', { name: /^Evidence/ });
    await expect(dialog).toBeVisible();
    const style = await dialog.evaluate((el) => ({
      bg: getComputedStyle(el).backgroundColor,
      shadow: getComputedStyle(el).boxShadow,
    }));
    expect(
      sameColour(await srgb(page, style.bg), await srgb(page, await token(page, '--surface-2'))),
    ).toBe(true);
    expect(style.shadow).toContain('inset');
  });

  test('T8: in the light theme the paper stays flat', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const header = await page
      .locator('[data-site-header]')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(sameColour(await srgb(page, header), await srgb(page, await token(page, '--bg')))).toBe(
      true,
    );
  });

  for (const [scheme, blend] of [
    ['light', 'multiply'],
    ['dark', 'screen'],
  ] as const) {
    test(`T10: the grain lies over every surface, blended ${blend} in ${scheme}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme: scheme });
      await page.goto('/');
      const grain = await page.locator('[data-paper-grain]').evaluate((el) => ({
        z: Number(getComputedStyle(el).zIndex),
        blend: getComputedStyle(el).mixBlendMode,
        events: getComputedStyle(el).pointerEvents,
      }));
      const headerZ = await page
        .locator('[data-site-header]')
        .evaluate((el) => Number(getComputedStyle(el).zIndex));
      expect(grain.z).toBeGreaterThan(headerZ);
      expect(grain.blend).toBe(blend);
      expect(grain.events).toBe('none');
    });
  }

  test('T10: evidence thumbnails blend into the paper; the full view stays true', async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/projects/accessibility-testing');
    await waitForHydration(page);
    const thumb = page.getByRole('button', { name: /^Enlarge image/ }).first();
    expect(await thumb.locator('img').evaluate((el) => getComputedStyle(el).mixBlendMode)).toBe(
      'multiply',
    );
    await thumb.click();
    const full = page.getByRole('dialog', { name: /^Evidence/ }).locator('img');
    await expect(full).toBeVisible();
    expect(await full.evaluate((el) => getComputedStyle(el).mixBlendMode)).toBe('normal');
    await page.keyboard.press('Escape');
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.reload();
    expect(
      await page
        .getByRole('button', { name: /^Enlarge image/ })
        .first()
        .locator('img')
        .evaluate((el) => getComputedStyle(el).mixBlendMode),
    ).toBe('normal');
  });

  test('T10: print has no grain and no blending', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light', media: 'print' });
    await page.goto('/projects/accessibility-testing');
    await expect(page.locator('[data-paper-grain]')).toBeHidden();
    expect(
      await page
        .getByRole('button', { name: /^Enlarge image/ })
        .first()
        .locator('img')
        .evaluate((el) => getComputedStyle(el).mixBlendMode),
    ).toBe('normal');
  });
});
