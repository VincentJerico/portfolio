import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { plantedBugs } from '../../src/content';

test.use({ viewport: { width: 1280, height: 900 } });

type Box = { x: number; y: number; width: number; height: number };
const boxesOverlap = (a: Box, b: Box) =>
  a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;

const banner = (page: Page) => page.getByRole('region', { name: 'Bug Hunt' });

async function inspectByKeyboard(page: Page, targetId: string) {
  const button = page.locator(`[data-hunt-id="${targetId}"] [data-hunt-inspect]`);
  await button.focus();
  await page.keyboard.press('Enter');
}

test('is off by default: no banner, no inspect buttons', async ({ page }) => {
  await page.goto('/');
  await expect(banner(page)).toHaveCount(0);
  await expect(page.locator('[data-hunt-inspect]')).toHaveCount(0);
});

test('?bughunt=1 turns it on with a counter', async ({ page }) => {
  await page.goto('/?bughunt=1');
  await expect(banner(page)).toContainText(
    'Bug Hunt mode: 5 bugs are planted on this site. Find them.',
  );
  await expect(page.locator('aside')).toContainText('Bugs found 0/5');
});

test('a clean element reports no defect', async ({ page }) => {
  await page.goto('/?bughunt=1');
  await inspectByKeyboard(page, 'metric-public-repos');
  await expect(page.getByRole('status').filter({ hasText: 'No defect here.' })).toBeVisible();
});

test('all five bugs can be found by keyboard, then the completion card shows', async ({ page }) => {
  await page.goto('/?bughunt=1');
  for (const bug of plantedBugs) {
    await page.goto(bug.route);
    await inspectByKeyboard(page, bug.targetId);
    const ticket = page.getByRole('dialog', { name: new RegExp(bug.id) });
    await expect(ticket).toContainText(bug.title);
    await expect(ticket).toContainText(bug.wouldBeCaughtBy);
    await page.keyboard.press('Escape');
    await expect(ticket).toBeHidden();
  }
  await expect(banner(page)).toContainText('5 of 5 found.');
  await expect(page.locator('aside')).toContainText('Bugs found 5/5');
});

test('turning it off restores every true value immediately', async ({ page }) => {
  await page.goto('/?bughunt=1');
  const metric = page.locator('[data-hunt-id="metric-automated-tests"]');
  await expect(metric).toContainText('109');
  await banner(page).getByRole('button', { name: 'Turn off' }).click();
  await expect(banner(page)).toHaveCount(0);
  await expect(metric).toContainText('108');
  await expect(metric).not.toContainText('109');
  await page.goto('/skills');
  await expect(page.locator('[data-hunt-id="skills-accessibility-heading"]')).toHaveText(
    'Accessibility',
  );
});

test('has no axe violations while hunting', async ({ page }) => {
  for (const route of ['/', '/projects', '/about', '/skills']) {
    await page.goto(`${route}?bughunt=1`);
    await expect(banner(page)).toBeVisible();
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();
    expect(results.violations.map((v) => `${route}: ${v.id}`)).toEqual([]);
  }
});

test('never runs on the resume', async ({ page }) => {
  await page.goto('/resume?bughunt=1');
  await expect(banner(page)).toHaveCount(0);
  await expect(page.locator('[data-hunt-inspect]')).toHaveCount(0);
});

test('print shows true values even mid-hunt', async ({ page }) => {
  await page.goto('/?bughunt=1');
  await page.emulateMedia({ media: 'print' });
  const metric = page.locator('[data-hunt-id="metric-automated-tests"]');
  await expect(metric).toContainText('108');
  await expect(metric.getByText('109')).toBeHidden();
  await expect(banner(page)).toBeHidden();
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('never activates and the HTML carries only true values', async ({ page }) => {
    await page.goto('/?bughunt=1');
    await expect(banner(page)).toHaveCount(0);
    await expect(page.locator('body')).not.toContainText('109');
  });
});

test('works when localStorage throws', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new Error('blocked');
      },
    });
  });
  await page.goto('/?bughunt=1');
  await expect(banner(page)).toBeVisible();
  await inspectByKeyboard(page, 'metric-automated-tests');
  await expect(page.getByRole('dialog', { name: /HUNT-02/ })).toBeVisible();
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });

  test('inspect buttons never cover the hero buttons', async ({ page }) => {
    await page.goto('/?bughunt=1');
    for (const id of ['overview-view-projects', 'overview-download-cv', 'overview-email']) {
      const host = page.locator(`[data-hunt-id="${id}"]`);
      const link = (await host.getByRole('link').boundingBox())!;
      const button = (await host.locator('[data-hunt-inspect]').boundingBox())!;
      expect(boxesOverlap(button, link), `${id}: Inspect overlaps the link`).toBe(false);
    }
  });
});
