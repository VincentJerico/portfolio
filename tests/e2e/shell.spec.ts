import { expect, test, type Page } from '@playwright/test';
import { NAV_ITEMS } from '../../src/lib/nav';

const MOBILE = { width: 375, height: 812 };
const DESKTOP = { width: 1280, height: 800 };

async function activeIsInside(page: Page, selector: string) {
  return page.evaluate(
    (sel) => !!document.querySelector(sel)?.contains(document.activeElement),
    selector,
  );
}

test.describe('every route', () => {
  for (const { href, label } of NAV_ITEMS) {
    test(`${label} (${href}) renders one h1 and one main`, async ({ page }) => {
      const response = await page.goto(href);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('main')).toHaveCount(1);
    });

    test(`${label} (${href}) has no horizontal overflow at 320px`, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 640 });
      await page.goto(href);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }
});

test('skip link is the first tab stop and moves focus to main', async ({ page }) => {
  await page.goto('/about');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveText('Skip to content');
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test.describe('desktop sidebar', () => {
  test.use({ viewport: DESKTOP });

  test('shows the nav with the current page marked and no menu button', async ({ page }) => {
    await page.goto('/projects');
    const nav = page.getByRole('navigation', { name: 'Site' });
    await expect(nav).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(nav.getByRole('link', { name: 'Overview' })).not.toHaveAttribute(
      'aria-current',
      /.*/,
    );
    await expect(page.getByRole('button', { name: 'Menu', exact: true })).toBeHidden();
  });

  test('every tab stop in the shell shows a visible focus indicator', async ({ page }) => {
    // Skip link, the nav links, theme toggle, GitHub, Email.
    const shellTabStops = 1 + NAV_ITEMS.length + 1 + 2;
    await page.goto('/');
    for (let i = 0; i < shellTabStops; i++) {
      await page.keyboard.press('Tab');
      const outline = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const style = getComputedStyle(el);
        return { width: parseFloat(style.outlineWidth), style: style.outlineStyle };
      });
      expect(outline, `tab stop ${i + 1}`).not.toBeNull();
      expect(outline!.style, `tab stop ${i + 1}`).not.toBe('none');
      expect(outline!.width, `tab stop ${i + 1}`).toBeGreaterThan(0);
    }
  });
});

test.describe('mobile drawer', () => {
  test.use({ viewport: MOBILE });

  test('menu button reflects state and Esc returns focus to it', async ({ page }) => {
    await page.goto('/');
    const menu = page.getByRole('button', { name: 'Menu', exact: true });
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toHaveAttribute('aria-controls', 'site-drawer');
    await menu.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#site-drawer')).toBeVisible();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    expect(await activeIsInside(page, '#site-drawer')).toBe(true);
    await page.keyboard.press('Escape');
    await expect(page.locator('#site-drawer')).toBeHidden();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeFocused();
  });

  test('focus stays inside the open drawer while tabbing both ways', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await expect(page.locator('#site-drawer')).toBeVisible();
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Tab');
      expect(await activeIsInside(page, '#site-drawer'), `Tab ${i + 1}`).toBe(true);
    }
    for (let i = 0; i < 20; i++) {
      await page.keyboard.press('Shift+Tab');
      expect(await activeIsInside(page, '#site-drawer'), `Shift+Tab ${i + 1}`).toBe(true);
    }
  });

  test('close button closes the drawer and returns focus to the menu button', async ({ page }) => {
    await page.goto('/');
    const menu = page.getByRole('button', { name: 'Menu', exact: true });
    await menu.click();
    await page.getByRole('button', { name: 'Close menu' }).click();
    await expect(page.locator('#site-drawer')).toBeHidden();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeFocused();
  });

  test('choosing a link navigates, closes the drawer and returns focus', async ({ page }) => {
    await page.goto('/');
    const menu = page.getByRole('button', { name: 'Menu', exact: true });
    await menu.click();
    await page.locator('#site-drawer').getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page.locator('#site-drawer')).toBeHidden();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeFocused();
  });

  test('drawer closes when the viewport grows to desktop', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    await expect(page.locator('#site-drawer')).toBeVisible();
    await page.setViewportSize(DESKTOP);
    await expect(page.locator('#site-drawer')).toBeHidden();
    expect(await page.evaluate(() => document.querySelector(':modal'))).toBeNull();
    await page
      .getByRole('navigation', { name: 'Site' })
      .getByRole('link', { name: 'Skills' })
      .click();
    await expect(page).toHaveURL(/\/skills$/);
  });
});

test.describe('mobile drawer without JavaScript', () => {
  test.use({ viewport: MOBILE, javaScriptEnabled: false });

  test('menu button still opens the drawer and every nav link is reachable', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Menu', exact: true }).click();
    const drawer = page.locator('#site-drawer');
    await expect(drawer).toBeVisible();
    for (const { label } of NAV_ITEMS) {
      await expect(drawer.getByRole('link', { name: label })).toBeVisible();
    }
  });
});

test.describe('not found', () => {
  test('unknown route returns the custom 404 with links back', async ({ page }) => {
    const response = await page.goto('/does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toHaveCount(1);
    const main = page.locator('main');
    await expect(main.getByRole('link', { name: 'Overview' })).toBeVisible();
    await expect(main.getByRole('link', { name: 'Projects' })).toBeVisible();
  });

  test('unknown project slug returns 404', async ({ page }) => {
    const response = await page.goto('/projects/anything');
    expect(response?.status()).toBe(404);
  });
});
