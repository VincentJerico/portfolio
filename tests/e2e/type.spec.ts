import { expect, test, type Page } from '../helpers/test';

// C55, Vincent's second list (2026-11-22): type details.

/** Each letter's left edge, relative to the first, in the title and in a kerned copy of its text. */
async function letterOffsets(page: Page) {
  return page.locator('main header h1').evaluate((h1) => {
    const letters = [...h1.querySelectorAll<HTMLElement>('.letter')];
    const first = letters[0]!.getBoundingClientRect().left;
    const split = letters.map((el) => el.getBoundingClientRect().left - first);
    const style = getComputedStyle(h1);
    const copy = document.createElement('span');
    for (const prop of [
      'font-family',
      'font-weight',
      'font-size',
      'font-variation-settings',
      'letter-spacing',
      'font-kerning',
    ])
      copy.style.setProperty(prop, style.getPropertyValue(prop));
    copy.style.cssText += ';position:absolute;white-space:nowrap;top:0;left:0';
    document.body.append(copy);
    const text = h1.textContent ?? '';
    const width = (t: string) => {
      copy.textContent = t;
      return copy.getBoundingClientRect().width;
    };
    // Letter i is the i-th non-space character; in kerned text it starts where the text up to and
    // including it ends, less its own advance (widths are fractional; text-range rects are not).
    const index = [...text].flatMap((char, i) => (char.trim() ? [i] : []));
    const kerned = index.map((i) => width(text.slice(0, i + 1)) - width(text[i]!));
    kerned.forEach((_, i, all) => (all[i] = kerned[i]! - kerned[0]!));
    copy.remove();
    return { split, kerned };
  });
}

test.describe('type', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  for (const path of ['/projects', '/work', '/quality']) {
    test(`D1: a title's rising letters land on their kerned places (${path})`, async ({ page }) => {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      // Wait until the arrival has finished.
      await expect
        .poll(() =>
          page
            .locator('main header h1')
            .evaluate((el) =>
              el.getAnimations({ subtree: true }).every((a) => a.playState === 'finished'),
            ),
        )
        .toBe(true);
      await expect(page.locator('main header h1')).toHaveCSS('font-kerning', 'normal');
      const { split, kerned } = await letterOffsets(page);
      split.forEach((x, i) =>
        expect(
          Math.abs(x - kerned[i]!),
          `letter ${i}: ${split.map((v) => v.toFixed(2))} vs ${kerned.map((v) => v.toFixed(2))}`,
        ).toBeLessThan(0.75),
      );
    });
  }

  test('D3: numbers that change or line up use tabular figures', async ({ page }) => {
    for (const [path, selector] of [
      ['/about', '.metric-value'],
      ['/quality', 'main table td'],
      ['/projects/accessibility-testing', 'main dl dd'],
    ] as const) {
      await page.goto(path);
      await expect(page.locator(selector).first(), `${path} ${selector}`).toHaveCSS(
        'font-variant-numeric',
        /tabular-nums/,
      );
    }
  });

  test('D3: the local time keeps its width from 1:05 am to 12:34 pm', async ({ page }) => {
    const widthAt = async (utc: string) => {
      await page.clock.setFixedTime(new Date(utc));
      await page.goto('/');
      const time = page.locator('[data-local-time] span').first();
      await expect(time).not.toBeEmpty();
      return time.evaluate((el) => el.getBoundingClientRect().width);
    };
    // Manila is UTC+8.
    const short = await widthAt('2026-01-01T17:05:00Z'); // 1:05 am
    const long = await widthAt('2026-01-01T04:34:00Z'); // 12:34 pm
    expect(Math.abs(short - long)).toBeLessThan(0.5);
  });

  // One tracking and leading scale: [selector, letter spacing in em, line height as a ratio].
  const scale: [string, string, number, number | null][] = [
    ['/about', 'main header h1', -0.02, 0.9],
    ['/about', 'main h2', -0.02, 1.05],
    ['/', '.poster', -0.01, 0.8],
    ['/', '.work-row-name', -0.02, 1.05],
    ['/', '.contact-email', -0.02, null],
    ['/resume', 'main h3', 0, 1.3],
    ['/about', 'main .label-mono', 0, 1.4],
    ['/quality', 'main p.text-lg', 0, 1.45],
  ];
  for (const [path, selector, track, lead] of scale) {
    test(`D5/D9: ${selector} on ${path} follows the scale`, async ({ page }) => {
      await page.goto(path);
      const measured = await page
        .locator(selector)
        .first()
        .evaluate((el) => {
          const st = getComputedStyle(el);
          const size = parseFloat(st.fontSize);
          // "normal" letter spacing parses to NaN, which is 0.
          return {
            track: (parseFloat(st.letterSpacing) || 0) / size,
            lead: parseFloat(st.lineHeight) / size,
          };
        });
      expect(measured).toEqual({
        track: expect.closeTo(track, 3),
        lead: lead === null ? expect.anything() : expect.closeTo(lead, 2),
      });
    });
  }

  test('D7: inline mono takes the text size and matches its x-height', async ({ page }) => {
    await page.goto('/projects/accessibility-testing');
    const code = page.locator('main p code').first();
    const [own, parent, adjust] = await code.evaluate((el) => [
      getComputedStyle(el).fontSize,
      getComputedStyle(el.parentElement!).fontSize,
      getComputedStyle(el).fontSizeAdjust,
    ]);
    expect(own).toBe(parent);
    expect(adjust).toMatch(/0\.52/);
  });

  test('D12: headings balance their lines and paragraphs avoid a lone last word', async ({
    page,
  }) => {
    await page.goto('/about');
    for (const selector of ['main header h1', 'main h2'])
      await expect(page.locator(selector).first()).toHaveCSS('text-wrap-style', 'balance');
    await expect(page.locator('main p').first()).toHaveCSS('text-wrap-style', 'pretty');
  });

  for (const path of [
    '/about',
    '/resume',
    '/contact',
    '/quality',
    '/projects/accessibility-testing',
  ]) {
    test(`D15: no paragraph runs past 75 characters a line (${path})`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(path);
      const wide = await page.locator('main p').evaluateAll((ps) =>
        ps
          .filter((p) => p.checkVisibility() && (p.textContent ?? '').length > 80)
          .map((p) => {
            const zero = document.createElement('span');
            zero.textContent = '0';
            zero.style.cssText = 'position:absolute;visibility:hidden';
            p.append(zero);
            const ch = zero.getBoundingClientRect().width;
            zero.remove();
            return {
              text: (p.textContent ?? '').slice(0, 40),
              chars: Math.round(p.getBoundingClientRect().width / ch),
            };
          })
          .filter((p) => p.chars > 75),
      );
      expect(wide).toEqual([]);
    });
  }
});
