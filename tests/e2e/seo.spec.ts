import { expect, test } from '@playwright/test';
import { NAV_ITEMS } from '../../src/lib/nav';
import { caseStudySlugs, projectsInOrder } from '../../src/lib/content';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3210';
const ROUTES = [
  ...NAV_ITEMS.map((i) => i.href),
  ...projectsInOrder().map((p) => `/projects/${p.slug}`),
  ...caseStudySlugs().map((s) => `/work/${s}`),
];

for (const route of ROUTES) {
  test(`${route} has a canonical, a description and an og:image`, async ({ page }) => {
    await page.goto(route);
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveCount(1);
    await expect(canonical).toHaveAttribute('href', route === '/' ? SITE : `${SITE}${route}`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{20,}/);
    await expect(page.locator('meta[property="og:image"]').first()).toHaveAttribute(
      'content',
      /^http/,
    );
  });
}

test('the overview describes Vincent as a Person in JSON-LD', async ({ page }) => {
  await page.goto('/');
  const data = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent())!,
  );
  expect(data).toMatchObject({ '@type': 'Person', name: 'Vincent Jerico Alcuran' });
  expect(data.sameAs).toContain('https://github.com/VincentJerico');
});

test('report pages describe the project in JSON-LD', async ({ page }) => {
  await page.goto('/projects/security-testing');
  const repo = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent())!,
  );
  expect(repo).toMatchObject({
    '@type': 'SoftwareSourceCode',
    codeRepository: 'https://github.com/VincentJerico/security-testing',
  });
  await page.goto('/projects/legatalink');
  const capstone = JSON.parse(
    (await page.locator('script[type="application/ld+json"]').textContent())!,
  );
  expect(capstone['@type']).toBe('CreativeWork');
  expect(capstone).not.toHaveProperty('codeRepository');
});

test('sitemap and robots are served', async ({ request }) => {
  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  for (const route of ROUTES)
    expect(xml).toContain(`<loc>${route === '/' ? SITE : `${SITE}${route}`}</loc>`);
  const robots = await (await request.get('/robots.txt')).text();
  expect(robots).toContain('Allow: /');
  expect(robots).toContain(`Sitemap: ${SITE}/sitemap.xml`);
});
