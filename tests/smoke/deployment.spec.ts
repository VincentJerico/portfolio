import { expect, test } from '../helpers/test';
// Runs only against a live deployment (PLAYWRIGHT_BASE_URL; see playwright.config.ts). EXPECTED_COMMIT, set by the production release, is the
// commit whose gate results the deployed /quality must show.
const expectedCommit = process.env.EXPECTED_COMMIT?.slice(0, 7);

test('every page in the sitemap loads, and the sitemap never lists /selftest', async ({
  request,
}) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname);
  expect(paths.length).toBeGreaterThan(15);
  expect(paths).not.toContain('/selftest');
  const failures: string[] = [];
  for (const path of paths) {
    const status = (await request.get(path)).status();
    failures.push(...(status === 200 ? [] : [`${status} ${path}`]));
  }
  expect(failures).toEqual([]);
});

test('the contact page offers the form (a missing secret hides it)', async ({ request }) => {
  const html = await (await request.get('/contact')).text();
  expect(html).toContain('Send a message');
});

test('notes do not exist until the first note is published', async ({ request }) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  expect(xml).not.toContain('/notes');
  expect((await request.get('/notes')).status()).toBe(404);
  expect((await request.get('/notes/opengraph-image')).status()).toBe(404);
});

test('the planted-defect page does not exist on a deployment', async ({ request }) => {
  expect((await request.get('/selftest')).status()).toBe(404);
});

test('the CV PDF from the same build is served', async ({ request }) => {
  const response = await request.get('/cv/Vincent-Jerico-Alcuran-CV.pdf');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/pdf');
  expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');
});

test('analytics load and every analytics script resolves (enabled for the project)', async ({
  page,
}) => {
  const scripts: string[] = [];
  page.on('response', (res) => {
    if (res.url().includes('/_vercel/') && res.request().resourceType() === 'script') {
      scripts.push(`${res.status()} ${new URL(res.url()).pathname}`);
    }
  });
  await page.goto('/');
  await expect.poll(() => scripts.length, { timeout: 10_000 }).toBeGreaterThanOrEqual(2);
  expect(scripts.filter((s) => !s.startsWith('200 '))).toEqual([]);
});

test.describe('production release', () => {
  test.skip(!expectedCommit, 'Only the production release knows which run it deployed.');

  test('/quality shows the results of the run that deployed it', async ({ request }) => {
    const html = await (await request.get('/quality')).text();
    expect(html).toContain(expectedCommit!);
  });
});
