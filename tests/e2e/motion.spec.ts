import { expect, test, type Locator, type Page } from '../helpers/test';
import { metrics, profile } from '../../src/content';
import { waitForHydration } from '../helpers/hydration';

// C50's one rhythm, kept by the minimal reset (C51): everything that arrives rises 16 px over 400 ms,
// list rows answer the pointer, and nothing moves under reduced motion.

const animationName = (locator: Locator) =>
  locator.evaluate((el) => getComputedStyle(el).animationName);

test('the paper has a still grain behind the content', async ({ page }) => {
  await page.goto('/');
  const grain = await page.evaluate(() => {
    const style = getComputedStyle(document.body, '::before');
    return {
      position: style.position,
      zIndex: style.zIndex,
      pointerEvents: style.pointerEvents,
      image: style.backgroundImage,
      animation: style.animationName,
    };
  });
  expect(grain.position).toBe('fixed');
  expect(grain.zIndex).toBe('-1');
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
    expect(await letters.nth(4).evaluate((el) => getComputedStyle(el).animationDelay)).toBe(
      '0.112s',
    );
  });

  test("the poster's letters rise in each line", async ({ page }) => {
    await page.goto('/');
    const lines = page.locator('.poster > span:not(.sr-only)');
    await expect(lines).toHaveCount(2);
    for (const line of await lines.all()) {
      expect(await line.locator('.letter').count()).toBeGreaterThan(0);
    }
    expect(await animationName(lines.first().locator('.letter').first())).toBe('letter');
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

  test('the skills strip moves with the scroll', async ({ page }) => {
    await page.goto('/');
    const rows = page.locator('.marquee-row');
    expect(await animationName(rows.first())).toBe('marquee');
    expect(await animationName(rows.nth(1))).toBe('marquee-back');
    expect(await rows.first().evaluate((el) => getComputedStyle(el).animationTimeline)).toMatch(
      /^scroll\(root/,
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

  test('the numbers roll on one timeline for the list', async ({ page }) => {
    await page.goto('/about');
    const list = page.locator('#numbers ul');
    expect(await list.evaluate((el) => getComputedStyle(el).viewTimelineName)).toBe('--numbers');
    const reel = page.locator('#numbers .odo-reel').first();
    expect(await animationName(reel)).toBe('odo');
    expect(await reel.evaluate((el) => getComputedStyle(el).animationTimeline)).toBe('--numbers');
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
    expect(new Set(header)).toEqual(new Set(['rise 0.4s']));
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
    await row.getByRole('link').hover();
    await expect
      .poll(() =>
        row.locator('.work-row-link > span').evaluate((el) => getComputedStyle(el).translate),
      )
      .toBe('12px');
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
