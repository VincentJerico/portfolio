import { expect, test } from '../helpers/test';
import { focusEntirelyObscured } from '../helpers/a11y';
import { waitForHydration } from '../helpers/hydration';
import { tabKey } from '../helpers/keys';

test.use({ viewport: { width: 1280, height: 900 } });

test('every input has a visible label, never a placeholder alone (F-6)', async ({ page }) => {
  await page.goto('/');
  await waitForHydration(page);
  await page.keyboard.press('ControlOrMeta+k');
  const inputs = page.locator('input, textarea, select');
  await expect(inputs.first()).toBeVisible();
  const unlabelled = await inputs.evaluateAll((els) =>
    els
      .filter((el) => (el as HTMLElement).checkVisibility())
      .filter((el) => {
        const labels = (el as HTMLInputElement).labels;
        return (
          !labels ||
          ![...labels].some((label) => label.checkVisibility() && label.textContent?.trim())
        );
      })
      .map((el) => el.outerHTML.slice(0, 80)),
  );
  expect(unlabelled).toEqual([]);
});

test('controls activate with Enter and Space (F-1)', async ({ page }) => {
  await page.goto('/projects');
  await waitForHydration(page);
  const security = page.getByRole('button', { name: 'Security', exact: true });
  await security.focus();
  await page.keyboard.press('Space');
  await expect(security).toHaveAttribute('aria-pressed', 'true');
  const all = page.getByRole('button', { name: 'All', exact: true });
  await all.focus();
  await page.keyboard.press('Enter');
  await expect(all).toHaveAttribute('aria-pressed', 'true');

  const toggle = page.locator('aside').getByRole('button', { name: 'Dark theme' });
  const before = await toggle.getAttribute('aria-pressed');
  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(toggle).not.toHaveAttribute('aria-pressed', before!);
});

test('reduced motion turns transitions off', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  const duration = await page
    .locator('aside a[aria-current="page"]')
    .evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration));
  expect(duration).toBeLessThan(0.02);
});

test('focus is never entirely obscured while tabbing a report page (F-7)', async ({
  page,
  browserName,
}) => {
  await page.goto('/projects/accessibility-testing');
  await waitForHydration(page);
  for (let i = 0; i < 50; i++) {
    await page.keyboard.press(tabKey(browserName));
    expect(await focusEntirelyObscured(page), `Tab ${i + 1}`).toBe(false);
  }
});

// Links are checked over HTTP from the prerendered HTML: rendering 20 pages in a browser adds nothing
// to "does this link resolve" and outran the test timeout on CI WebKit.
test('every internal link reachable from the overview resolves', async ({ request, baseURL }) => {
  const origin = new URL(baseURL!).origin;
  const seen = new Set<string>(['/']);
  const queue = ['/'];
  const broken: string[] = [];
  while (queue.length) {
    const html = await (await request.get(queue.shift()!)).text();
    const hrefs = [...html.matchAll(/<a\s[^>]*?href="([^"]*)"/g)]
      .map((m) => new URL(m[1]!.replaceAll('&amp;', '&'), origin))
      .filter((u) => u.origin === origin)
      .map((u) => u.pathname);
    for (const href of hrefs.filter((h) => !seen.has(h))) {
      seen.add(href);
      const response = await request.get(href);
      const isPage = (response.headers()['content-type'] ?? '').includes('text/html');
      broken.push(...(response.status() >= 400 ? [`${response.status()} ${href}`] : []));
      queue.push(...(response.status() < 400 && isPage ? [href] : []));
    }
  }
  expect(broken).toEqual([]);
  expect(seen.size).toBeGreaterThan(15);
});

test('page changes cross-fade, in-page filter updates do not (P5)', async ({ page }) => {
  await page.addInitScript(() => {
    const original = document.startViewTransition?.bind(document);
    (window as unknown as { __vt: number }).__vt = 0;
    if (original) {
      document.startViewTransition = ((arg: Parameters<typeof original>[0]) => {
        (window as unknown as { __vt: number }).__vt += 1;
        return original(arg);
      }) as typeof document.startViewTransition;
    }
  });
  await page.goto('/projects');
  await waitForHydration(page);
  await page.getByRole('button', { name: 'Security', exact: true }).click();
  await expect(page).toHaveURL(/category=security/);
  expect(await page.evaluate(() => (window as unknown as { __vt: number }).__vt)).toBe(0);
  await page.locator('aside').getByRole('link', { name: 'Skills', exact: true }).click();
  await expect(page).toHaveURL(/\/skills$/);
  await expect
    .poll(() => page.evaluate(() => (window as unknown as { __vt: number }).__vt))
    .toBeGreaterThan(0);
});
