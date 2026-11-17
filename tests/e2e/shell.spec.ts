import { expect, test } from '../helpers/test';
import { profile } from '../../src/content';
import { FOOTER_NAV, PRIMARY_NAV } from '../../src/lib/nav';
import { footerNavItems, navItems, primaryNavItems } from '../../src/lib/nav-items';
import { waitForHydration } from '../helpers/hydration';
import { tabKey } from '../helpers/keys';

// The minimal shell (C51): a plain top bar, a footer, and nothing else around the page.

const MOBILE = { width: 375, height: 812 };
const DESKTOP = { width: 1280, height: 800 };

test.describe('every route', () => {
  for (const { href, label } of navItems()) {
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

test('skip link is the first tab stop and moves focus to main', async ({ page, browserName }) => {
  await page.goto('/about');
  await page.keyboard.press(tabKey(browserName));
  await expect(page.locator(':focus')).toHaveText('Skip to content');
  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();
});

test.describe('top bar', () => {
  test.use({ viewport: DESKTOP, isMobile: false, hasTouch: false });

  test('links the name home and lists the main pages, nothing more', async ({ page }) => {
    await page.goto('/about');
    const header = page.locator('[data-site-header]');
    await expect(header.getByRole('link', { name: profile.fullName })).toHaveAttribute('href', '/');
    const nav = header.getByRole('navigation', { name: 'Site' });
    await expect(nav.getByRole('link')).toHaveText(primaryNavItems().map((item) => item.label));
    expect(PRIMARY_NAV.map((item) => item.label)).toEqual([
      'Projects',
      'Work',
      'About',
      'Resume',
      'Contact',
    ]);
  });

  test('marks the page you are on, including inside a section', async ({ page }) => {
    await page.goto('/projects/accessibility-testing');
    const nav = page.locator('[data-site-header]').getByRole('navigation', { name: 'Site' });
    await expect(nav.getByRole('link', { name: 'Projects' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    await expect(nav.locator('[aria-current]')).toHaveCount(1);
  });
});

test.describe('footer', () => {
  test('every route links the other pages, GitHub, the email and the CV', async ({ page }) => {
    test.slow(); // every route
    expect(FOOTER_NAV.map((item) => item.label)).toEqual(['Skills', 'Notes', 'Quality']);
    for (const { href } of navItems()) {
      await page.goto(href);
      const footer = page.locator('[data-site-footer]');
      for (const item of footerNavItems()) {
        await expect(
          footer.getByRole('link', { name: item.label, exact: true }),
          href,
        ).toHaveAttribute('href', item.href);
      }
      await expect(footer.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
        'href',
        profile.github,
      );
      await expect(footer.getByRole('link', { name: profile.email })).toHaveAttribute(
        'href',
        `mailto:${profile.email}`,
      );
      await expect(footer.getByRole('link', { name: 'Download CV' })).toHaveAttribute(
        'href',
        profile.cvPdf,
      );
    }
  });
});

test.describe('phone menu', () => {
  test.use({ viewport: MOBILE });

  test('Menu opens the site menu, Escape closes it and focus goes back', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    const header = page.locator('[data-site-header]');
    await expect(header.getByRole('navigation', { name: 'Site' })).toBeHidden();
    const menu = header.getByRole('button', { name: 'Menu', exact: true });
    await menu.click();
    const dialog = page.getByRole('dialog', { name: 'Site menu' });
    await expect(dialog).toBeVisible();
    await expect(menu).toHaveAttribute('aria-expanded', 'true');
    // Focus moves into the menu and Tab wraps inside it.
    await expect(dialog.getByRole('button', { name: 'Close menu' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(dialog.locator(':focus')).toHaveCount(1);
    for (const item of primaryNavItems()) {
      await expect(dialog.getByRole('link', { name: item.label, exact: true })).toBeVisible();
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await expect(menu).toBeFocused();
  });

  test('choosing a page closes the menu and goes there', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    await page
      .locator('[data-site-header]')
      .getByRole('button', { name: 'Menu', exact: true })
      .click();
    const dialog = page.getByRole('dialog', { name: 'Site menu' });
    await dialog.getByRole('link', { name: 'About', exact: true }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(dialog).toBeHidden();
  });
});

test.describe('removed parts stay removed', () => {
  test.use({ viewport: DESKTOP, isMobile: false, hasTouch: false });

  test('no status bar, pull cord, bug hunt, test runner or command palette', async ({ page }) => {
    await page.goto('/');
    await waitForHydration(page);
    await expect(
      page.locator('[data-statusbar], [data-topbar], [data-scroll-progress], [data-runner-panel]'),
    ).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: /Light switch|Bug hunt|Run tests|Search/ }),
    ).toHaveCount(0);
    await page.keyboard.press('ControlOrMeta+k');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });
});

test.describe('not found', () => {
  test('unknown route returns the custom 404 with links back', async ({ page }) => {
    const response = await page.goto('/does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toHaveCount(1);
    const main = page.locator('main');
    await expect(main.getByRole('link', { name: 'Home' })).toBeVisible();
    await expect(main.getByRole('link', { name: 'Projects' })).toBeVisible();
  });

  test('unknown project slug returns 404', async ({ page }) => {
    const response = await page.goto('/projects/anything');
    expect(response?.status()).toBe(404);
  });
});
