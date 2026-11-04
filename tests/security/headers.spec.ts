import { headerDefects } from '../../src/lib/header-check';
import { expect, test } from '../helpers/test';
import { deployedUrl } from '../helpers/target';

// Local and CI builds are served over http without VERCEL=1; a deployed URL is https on Vercel.
const deployed = deployedUrl() !== undefined;
const CSP =
  "default-src 'self'; img-src 'self' data: https://github.com https://img.shields.io https://avatars.githubusercontent.com; script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; font-src 'self'; connect-src 'self' https://vitals.vercel-insights.com https://va.vercel-scripts.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self' mailto:; object-src 'none'";

// Literal spec Section 10 values; upgrade-insecure-requests only over https (C20).
const EXPECTED: Record<string, string> = {
  'content-security-policy': deployed ? `${CSP}; upgrade-insecure-requests` : CSP,
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'x-content-type-options': 'nosniff',
  'x-frame-options': 'DENY',
  'strict-transport-security': 'max-age=63072000; includeSubDomains; preload',
  'cross-origin-opener-policy': 'same-origin',
};

for (const path of ['/', '/projects/security-testing']) {
  test(`${path} sends every spec 10 security header`, async ({ request }) => {
    const response = await request.get(path);
    expect(headerDefects(response.headers(), EXPECTED)).toEqual([]);
  });
}

test('an unknown route returns the custom 404 without a stack trace', async ({ request }) => {
  const response = await request.get('/definitely-not-here');
  expect(response.status()).toBe(404);
  const body = await response.text();
  expect(body).toContain('Page not found');
  expect(body).not.toMatch(/at\s+\S+\s+\(.*:\d+:\d+\)|node_modules|webpack-internal/);
});

test('analytics only load on Vercel builds, so other builds request no missing scripts @local-build', async ({
  page,
}) => {
  // The components inject their scripts at runtime, so watch the network rather than the HTML.
  const vercelRequests: string[] = [];
  page.on('request', (req) => req.url().includes('/_vercel/') && vercelRequests.push(req.url()));
  await page.goto('/');
  await page.evaluate(() => new Promise((resolve) => setTimeout(resolve, 1500)));
  expect(vercelRequests).toEqual([]);
});

test('OG image routes 404 for unknown slugs instead of erroring', async ({ request }) => {
  expect((await request.get('/projects/not-a-project/opengraph-image')).status()).toBe(404);
  expect((await request.get('/work/not-a-case-study/opengraph-image')).status()).toBe(404);
});
