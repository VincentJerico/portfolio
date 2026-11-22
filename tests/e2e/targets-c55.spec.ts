import { expect, test } from '../helpers/test';
import { waitForHydration } from '../helpers/hydration';

// C55, Vincent's second list (2026-11-22): layout shift, touch targets, safe areas, affordances.

test.describe('desktop', () => {
  test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

  test('D4: hovering down the work list shifts nothing', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    const rows = page.locator('main .work-row');
    await rows.nth(1).scrollIntoViewIfNeeded();
    await page.evaluate(() => {
      const w = window as unknown as { __shift: number };
      w.__shift = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries())
          w.__shift += (entry as unknown as { value: number }).value;
      }).observe({ type: 'layout-shift' });
    });
    for (const i of [0, 1, 2]) {
      const box = (await rows.nth(i).boundingBox())!;
      await page.mouse.move(box.x + 100, box.y + 20, { steps: 4 });
      await expect
        .poll(() =>
          rows
            .nth(i)
            .locator('.work-row-hook')
            .evaluate((el) => getComputedStyle(el).clipPath),
        )
        .toBe('inset(0px)');
    }
    expect(await page.evaluate(() => (window as unknown as { __shift: number }).__shift)).toBe(0);
  });

  test('D4: a form error never moves the send button', async ({ page }) => {
    await page.goto('/contact');
    await waitForHydration(page);
    const send = page.getByRole('button', { name: 'Send message' });
    // Its place in the layout: offsetTop ignores the scroll and the section's scroll-linked rise.
    const top = () =>
      send.evaluate((el) => {
        let y = 0;
        for (
          let node = el as HTMLElement | null;
          node;
          node = node.offsetParent as HTMLElement | null
        )
          y += node.offsetTop;
        return y;
      });
    const before = await top();
    await send.click();
    await expect(page.getByText(/enter your name|name is required/i).first()).toBeVisible();
    expect(await top()).toBe(before);
  });

  test('D8: the cord fills its gutter and the nav links are 44 px targets', async ({ page }) => {
    await page.goto('/about');
    // The cord fills the 40 px side gutter: C53 keeps it off the content beside it.
    const cord = (await page.locator('.pull-cord-button').boundingBox())!;
    expect(cord.width).toBeGreaterThanOrEqual(40);
    for (const link of await page.locator('[data-site-header] .nav-link').all()) {
      const box = (await link.boundingBox())!;
      expect(box.width, await link.innerText()).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });

  test('D16: every button and summary points', async ({ page }) => {
    await page.goto('/projects/accessibility-testing');
    const cursors = await page
      .locator('button, summary')
      .evaluateAll((els) => [
        ...new Set(
          els.filter((el) => el.checkVisibility()).map((el) => getComputedStyle(el).cursor),
        ),
      ]);
    expect(cursors).toEqual(['pointer']);
  });

  test('D16: a focused work row shows its arrow; the focused cord shows its name', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForHydration(page);
    const row = page.locator('main .work-row').first();
    await row.locator('.work-row-link').focus();
    await expect(row.locator('.work-row-arrow')).toBeVisible();
    await expect(row.locator('.work-row-arrow')).toHaveCSS('opacity', '1');
    await page.locator('.pull-cord-button').focus();
    await expect(page.locator('.cord-label')).toBeVisible();
    await expect(page.locator('.cord-label')).toHaveText(/^(Dark|Light)$/);
    await expect(page.locator('.cord-label')).toHaveCSS('opacity', '1');
  });

  test('D2: labels centre on their cap height where the browser can', async ({ page }) => {
    await page.goto('/');
    for (const selector of ['.cv-ring-label', 'main a.button, main button'])
      await expect(page.locator(selector).first(), selector).toHaveCSS(
        'text-box-trim',
        'trim-both',
      );
  });
});

test('D13: the page reaches the screen edges and pads by the safe area', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute(
    'content',
    /viewport-fit=cover/,
  );
});

test('D13: safe-area insets pad the gutters and the open menu @chromium-only', async ({ page }) => {
  await page.setViewportSize({ width: 740, height: 390 });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send(
    'Emulation.setSafeAreaInsetsOverride' as never,
    { insets: { top: 0, left: 47, right: 47, bottom: 21 } } as never,
  );
  await page.goto('/');
  await waitForHydration(page);
  const pad = await page
    .locator('main .shell')
    .first()
    .evaluate((el) => [
      parseFloat(getComputedStyle(el).paddingLeft),
      parseFloat(getComputedStyle(el).paddingRight),
    ]);
  expect(pad[0]).toBeGreaterThanOrEqual(47);
  expect(pad[1]).toBeGreaterThanOrEqual(47);
  await page.getByRole('button', { name: 'Menu' }).click();
  const bottom = await page
    .getByRole('dialog')
    .evaluate((el) => parseFloat(getComputedStyle(el).paddingBottom));
  expect(bottom).toBeGreaterThanOrEqual(21);
});

test.describe('touch', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('D8: certification and LinkedIn links are 44 px tall on touch screens', async ({ page }) => {
    for (const [path, selector] of [
      ['/about', '#certifications a'],
      ['/resume', 'main a[href*="linkedin"]'],
    ] as const) {
      await page.goto(path);
      for (const link of await page.locator(selector).all()) {
        const box = (await link.boundingBox())!;
        expect(box.height, `${path} ${await link.innerText()}`).toBeGreaterThanOrEqual(44);
      }
    }
  });
});
