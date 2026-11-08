import { expect, test } from '../helpers/test';
import { projectBySlug, projectsInOrder } from '../../src/lib/content';
import { severityCounts } from '../../src/lib/labels';

const all = projectsInOrder();

test.describe('projects index', () => {
  test('filter narrows the grid, syncs the URL and announces the count', async ({ page }) => {
    await page.goto('/projects');
    const cards = page.locator('main article');
    await expect(cards).toHaveCount(all.length);
    const status = page.getByRole('status').filter({ hasText: 'Showing' });

    await page.getByRole('button', { name: 'Security', exact: true }).click();
    await expect(cards).toHaveCount(1);
    await expect(page).toHaveURL(/\?category=security$/);
    await expect(status).toHaveText(`Showing 1 of ${all.length} projects`);
    await expect(page.getByRole('button', { name: 'Security', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await page.getByRole('button', { name: 'All', exact: true }).click();
    await expect(cards).toHaveCount(all.length);
    await expect(page).toHaveURL(/\/projects$/);
  });

  test('typing searches name, tools and results, and combines with the category', async ({
    page,
  }) => {
    await page.goto('/projects');
    const cards = page.locator('main article');
    const search = page.getByRole('searchbox', { name: 'Search projects' });
    const target = all.find((p) => p.category === 'security')!;
    const byStack = all.filter((p) =>
      [p.name, p.hook, p.summary, ...p.stack].join(' ').toLowerCase().includes('playwright'),
    );

    await search.fill('playwright');
    await expect(cards).toHaveCount(byStack.length);
    await search.fill(target.name);
    await expect(cards).toHaveCount(1);
    await expect(cards.first()).toContainText(target.name);

    await search.fill('no-such-project-anywhere');
    await expect(page.getByText('No projects match "no-such-project-anywhere".')).toBeVisible();
    await page.getByRole('button', { name: 'Show all projects' }).click();
    await expect(search).toHaveValue('');
    await expect(cards).toHaveCount(all.length);
  });

  test('an unknown category shows everything with All pressed', async ({ page }) => {
    await page.goto('/projects?category=nope');
    await expect(page.locator('main article')).toHaveCount(all.length);
    await expect(page.getByRole('button', { name: 'All', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('a category in the URL is applied on load', async ({ page }) => {
    await page.goto('/projects?category=performance');
    await expect(page.locator('main article')).toHaveCount(1);
  });
});

test.describe('projects index without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('shows every project and no filter buttons', async ({ page }) => {
    await page.goto('/projects?category=security');
    await expect(page.locator('main article')).toHaveCount(all.length);
    await expect(page.getByRole('button', { name: 'Security', exact: true })).toHaveCount(0);
  });
});

test.describe('test report pages', () => {
  for (const project of all) {
    test(`${project.slug} renders as a report`, async ({ page }) => {
      const response = await page.goto(`/projects/${project.slug}`);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveText(project.name);
      await expect(page.locator('main')).not.toContainText('`');
    });
  }

  test('severity counts in the run summary equal the rendered tickets', async ({ page }) => {
    const project = projectBySlug('accessibility-testing')!;
    await page.goto(`/projects/${project.slug}`);
    const summary = page.getByRole('region', { name: 'Run summary' });
    for (const { severity, count } of severityCounts(project.findings)) {
      await expect(summary.getByText(new RegExp(`^${count}\\s*${severity}$`, 'i'))).toBeVisible();
      await expect(page.locator(`[data-ticket-severity="${severity}"]`)).toHaveCount(count);
    }
  });

  test('evidence opens in a dialog that traps focus and returns it', async ({ page }) => {
    await page.goto('/projects/accessibility-testing');
    const thumb = page.getByRole('button', { name: /^Enlarge image/ }).first();
    await thumb.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(thumb).toBeFocused();
  });

  test('clicking the backdrop closes the dialog and refocuses the thumbnail', async ({ page }) => {
    await page.goto('/projects/accessibility-testing');
    const thumb = page.getByRole('button', { name: /^Enlarge image/ }).first();
    await thumb.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(page.getByRole('dialog')).toBeHidden();
    await expect(thumb).toBeFocused();
  });

  test('LegataLink is a team project with a live link and no repo', async ({ page }) => {
    await page.goto('/projects/legatalink');
    const summary = page.getByRole('region', { name: 'Run summary' });
    await expect(summary).toContainText('Team project');
    await expect(summary.getByRole('link', { name: /^Live site/ })).toBeVisible();
    await expect(summary.getByRole('link', { name: /^Repo/ })).toHaveCount(0);
  });

  test('prev and next links walk the display order', async ({ page }) => {
    await page.goto('/projects/security-testing');
    const nav = page.getByRole('navigation', { name: 'More projects' });
    await expect(nav.getByRole('link', { name: /accessibility-testing/ })).toHaveAttribute(
      'href',
      '/projects/accessibility-testing',
    );
    await expect(nav.getByRole('link', { name: /performance-testing/ })).toHaveAttribute(
      'href',
      '/projects/performance-testing',
    );
  });
});

test.describe('GitHub data (test builds use the fixture)', () => {
  test('a project with a repo shows last commit and topics', async ({ page }) => {
    await page.goto('/projects/accessibility-testing');
    const summary = page.getByRole('region', { name: 'Run summary' });
    await expect(summary.getByText('Last commit', { exact: true })).toBeVisible();
    await expect(summary.locator('time')).toHaveText('1 Jan 2000');
    await expect(summary.locator('time')).toHaveAttribute('datetime', '2000-01-01');
    await expect(
      page.getByRole('list', { name: 'GitHub topics' }).getByText('fixture-topic'),
    ).toBeVisible();
    await expect(summary.getByText('From GitHub, refreshed daily.')).toBeVisible();
  });

  test('a project without a repo shows neither', async ({ page }) => {
    await page.goto('/projects/legatalink');
    await expect(page.getByText('Last commit', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('list', { name: 'GitHub topics' })).toHaveCount(0);
  });
});

test.describe('report tools marquee', () => {
  test('tools scroll in a marquee that screen readers and print read as one list', async ({
    page,
  }) => {
    const project = projectsInOrder()[0]!;
    await page.goto(`/projects/${project.slug}`);
    const marquee = page.locator('[data-marquee]');
    await expect(marquee.locator('ul:not([aria-hidden])').getByRole('listitem')).toHaveCount(
      project.stack.length,
    );
    await expect(marquee.locator('ul[aria-hidden="true"]')).toHaveCount(1);
    await expect(marquee.locator('.marquee-track')).toHaveCSS('animation-name', 'marquee');
    await expect(marquee.locator('ul[aria-hidden="true"]')).toBeVisible();
    await page.emulateMedia({ media: 'print' });
    await expect(marquee.locator('ul[aria-hidden="true"]')).toBeHidden();
  });
});

test.describe('CI badges', () => {
  test('a badge is never clipped by its placeholder, down to 320 px', async ({ page }) => {
    // Real badges run wider than the 90 px fixture ("CI | passing" is about 140 px).
    await page.route('https://github.com/**/badge.svg*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="140" height="20"><rect width="140" height="20" fill="#3fb950"/></svg>',
      }),
    );
    for (const route of ['/projects', '/projects/accessibility-testing']) {
      await page.goto(route);
      for (const width of [320, 768, 1024]) {
        await page.setViewportSize({ width, height: 900 });
        const clipped = await page.locator('.skeleton:has(img)').evaluateAll(
          (els) =>
            // Compare the image with its wrapper: the wrapper's shimmer pseudo-element inflates
            // scrollWidth while it slides (WebKit counts it).
            els.filter((el) => {
              if (!el.checkVisibility()) return false;
              const box = el.getBoundingClientRect();
              const img = el.querySelector('img')!.getBoundingClientRect();
              return img.right > box.right + 1 || img.left < box.left - 1;
            }).length,
        );
        expect(clipped, `${route} at ${width} px`).toBe(0);
      }
    }
  });
});
