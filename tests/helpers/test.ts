import { test as base } from '@playwright/test';

// Every browser test runs hermetically: live GitHub Actions badges are served from a local SVG, so
// GitHub rate limits (HTTP 429) or outages never fail the suite. The real badges are covered by the
// link check, not here.
const BADGE_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="90" height="20"><rect width="90" height="20" fill="#3fb950"/></svg>';

export const test = base.extend<{ hermeticBadges: void }>({
  hermeticBadges: [
    async ({ page }, use) => {
      await page.route('https://github.com/**/badge.svg*', (route) =>
        route.fulfill({ status: 200, contentType: 'image/svg+xml', body: BADGE_SVG }),
      );
      await use();
    },
    { auto: true },
  ],
});

export { expect, type Page, type TestInfo, type Locator } from '@playwright/test';
