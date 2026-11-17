import { expect, test, type Page } from '../helpers/test';
import { profile } from '../../src/content';
import { approvedCaseStudies, projectsInOrder } from '../../src/lib/content';
import { categoryLabel } from '../../src/lib/labels';
import { waitForHydration } from '../helpers/hydration';
import { tabKey } from '../helpers/keys';

// The home page (C51): the name as the poster, then the work as lists of big names, then contact.

const projectsRegion = (page: Page) => page.getByRole('region', { name: 'Projects', exact: true });

test.describe('poster', () => {
  test('the name is the one h1 and reads in full to assistive tech', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveAccessibleName(profile.fullName);
    await expect(page.locator('[data-poster]')).toContainText(profile.headline);
    // Crawlers and copy read the text itself, so the words must not run together.
    const text = await page.locator('h1').evaluate((el) => el.textContent!.replace(/\s+/g, ' '));
    expect(text.trim()).toBe(profile.fullName);
  });

  test('never scrolls sideways, even before the poster font arrives', async ({ page }) => {
    await page.route(/\.woff2?(\?|$)/, (route) => route.abort());
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto('/');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBeLessThanOrEqual(0);
  });

  for (const width of [320, 768, 1280, 1920]) {
    test(`fills the page without spilling at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const fit = await page.locator('h1.poster').evaluate((h1) => {
        const box = h1.getBoundingClientRect();
        const lines = [...h1.querySelectorAll(':scope > span:not(.sr-only)')].map((span) => {
          const range = document.createRange();
          range.selectNodeContents(span);
          const { left, right } = range.getBoundingClientRect();
          return { left, right };
        });
        return { left: box.left, right: box.right, width: box.width, lines };
      });
      expect(fit.lines).toHaveLength(2);
      for (const line of fit.lines) {
        expect(line.left).toBeGreaterThanOrEqual(fit.left - 1);
        expect(line.right).toBeLessThanOrEqual(fit.right + 1);
      }
      // A poster, not a heading: the first line takes most of the width at every size.
      expect(fit.lines[0]!.right - fit.lines[0]!.left).toBeGreaterThan(fit.width * 0.8);
    });
  }

  test('the details give the role, the practice, the place and the local time', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForHydration(page);
    const details = page.locator('[data-poster] .poster-details');
    await expect(details).toContainText(profile.role);
    await expect(details).toContainText(`at ${profile.company}`);
    await expect(details).toContainText(profile.location);
    await expect(details.locator('[data-local-time]')).toHaveText(
      /^Local time \d{1,2}:\d{2} (am|pm)$/,
    );
  });
});

test.describe('projects', () => {
  test('lists every project in display order, each linking to its report', async ({ page }) => {
    await page.goto('/');
    const section = projectsRegion(page);
    const headings = section.getByRole('heading', { level: 3 });
    const projects = projectsInOrder();
    await expect(headings).toHaveCount(projects.length);
    for (const [i, project] of projects.entries()) {
      await expect(headings.nth(i)).toHaveAccessibleName(project.name);
      await expect(headings.nth(i).getByRole('link')).toHaveAttribute(
        'href',
        `/projects/${project.slug}`,
      );
      await expect(section.getByRole('listitem').nth(i)).toContainText(
        categoryLabel(project.category),
      );
    }
  });

  test('a row takes you to its report', async ({ page }) => {
    await page.goto('/');
    const first = projectsInOrder()[0]!;
    await projectsRegion(page).getByRole('link', { name: first.name, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/projects/${first.slug}$`));
    await expect(page.locator('h1')).toHaveText(first.name);
  });

  test.describe('with a mouse', () => {
    test.use({ viewport: { width: 1280, height: 800 }, isMobile: false, hasTouch: false });

    test('a row opens its hook and takes the accent on hover', async ({ page }) => {
      await page.goto('/');
      const row = projectsRegion(page).getByRole('listitem').first();
      const hook = row.locator('.work-row-hook > p');
      const height = () => hook.evaluate((el) => el.getBoundingClientRect().height);
      expect(await height()).toBeLessThan(1);
      await row.getByRole('link').hover();
      await expect.poll(height).toBeGreaterThan(10);
      const accent = await page.evaluate(() => {
        const el = document.createElement('span');
        el.style.color = 'var(--accent)';
        document.body.append(el);
        const rgb = getComputedStyle(el).color;
        el.remove();
        return rgb;
      });
      await expect
        .poll(() => row.getByRole('link').evaluate((el) => getComputedStyle(el).color))
        .toBe(accent);
      await page.mouse.move(0, 0);
      await expect.poll(height).toBeLessThan(1);
    });

    test('clicking anywhere on a hovered row opens its report', async ({ page }) => {
      await page.goto('/');
      const row = projectsRegion(page).getByRole('listitem').first();
      const href = (await row.getByRole('link').getAttribute('href'))!;
      await row.getByRole('link').hover();
      // The row number sits under the link's overlay; once hovered it must still be covered.
      const box = (await row.locator('.work-row-num').boundingBox())!;
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await expect(page).toHaveURL(new RegExp(`${href}$`));
    });

    test('keyboard focus opens a row the same way', async ({ page, browserName }) => {
      await page.goto('/');
      const section = projectsRegion(page);
      await section.getByRole('link', { name: 'Browse by testing area' }).focus();
      await page.keyboard.press(tabKey(browserName));
      const first = section.getByRole('listitem').first();
      await expect(first.getByRole('link')).toBeFocused();
      await expect
        .poll(() =>
          first.locator('.work-row-hook > p').evaluate((el) => el.getBoundingClientRect().height),
        )
        .toBeGreaterThan(10);
    });
  });

  test.describe('on a touch screen', () => {
    test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

    test('every row shows its hook without hover', async ({ page }) => {
      await page.goto('/');
      const hooks = projectsRegion(page).locator('.work-row-hook > p');
      await expect(hooks.first()).toBeVisible();
      expect(
        await hooks.first().evaluate((el) => el.getBoundingClientRect().height),
      ).toBeGreaterThan(10);
    });
  });
});

test.describe('client work and contact', () => {
  test('client work lists each approved case study', async ({ page }) => {
    await page.goto('/');
    const section = page.getByRole('region', { name: 'Client work' });
    for (const study of approvedCaseStudies()) {
      await expect(section.getByRole('link', { name: study.title, exact: true })).toHaveAttribute(
        'href',
        `/work/${study.slug}`,
      );
    }
  });

  test('contact gives the email, a copy button, the CV and GitHub', async ({ page }) => {
    await page.goto('/');
    const section = page.getByRole('region', { name: 'Contact' });
    await expect(section.getByRole('link', { name: profile.email })).toHaveAttribute(
      'href',
      `mailto:${profile.email}`,
    );
    await expect(section.getByRole('button', { name: 'Copy email' })).toBeVisible();
    await expect(section.getByRole('link', { name: 'Download CV' })).toHaveAttribute(
      'href',
      profile.cvPdf,
    );
    await expect(section.getByRole('link', { name: 'GitHub' })).toHaveAttribute(
      'href',
      profile.github,
    );
  });
});
