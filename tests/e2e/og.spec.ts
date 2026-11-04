import { expect, test } from '@playwright/test';
import { NAV_ITEMS } from '../../src/lib/nav';
import { caseStudySlugs, projectsInOrder } from '../../src/lib/content';

const ROUTES = [
  ...NAV_ITEMS.map((i) => i.href),
  ...projectsInOrder().map((p) => `/projects/${p.slug}`),
  ...caseStudySlugs().map((s) => `/work/${s}`),
];

for (const route of ROUTES) {
  test(`${route} has a 1200x630 PNG social card with alt text`, async ({ page, request }) => {
    await page.goto(route);
    const imageUrl = await page
      .locator('meta[property="og:image"]')
      .first()
      .getAttribute('content');
    await expect(page.locator('meta[property="og:image:alt"]').first()).toHaveAttribute(
      'content',
      /.{10,}/,
    );
    const response = await request.get(new URL(imageUrl!).pathname);
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('image/png');
    const png = await response.body();
    expect({ width: png.readUInt32BE(16), height: png.readUInt32BE(20) }).toEqual({
      width: 1200,
      height: 630,
    });
  });
}
