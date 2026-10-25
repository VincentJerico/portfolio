import { expect, test } from '@playwright/test';
import { SECURITY_HEADERS } from '../../src/lib/security-headers';

for (const path of ['/', '/projects/security-testing']) {
  test(`${path} sends every spec 10 security header`, async ({ request }) => {
    const response = await request.get(path);
    const headers = response.headers();
    for (const [name, value] of Object.entries(SECURITY_HEADERS)) {
      expect(headers[name.toLowerCase()], name).toBe(value);
    }
    expect(headers['access-control-allow-origin']).toBeUndefined();
  });
}

test('an unknown route returns the custom 404 without a stack trace', async ({ request }) => {
  const response = await request.get('/definitely-not-here');
  expect(response.status()).toBe(404);
  const body = await response.text();
  expect(body).toContain('Page not found');
  expect(body).not.toMatch(/at\s+\S+\s+\(.*:\d+:\d+\)|node_modules|webpack-internal/);
});
