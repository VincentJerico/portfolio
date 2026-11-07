import { expect, test, type Locator } from '../helpers/test';

// Spec 2.5: standalone controls are at least 44x44px on touch layouts. Links inside running text
// or table cells are inline targets (WCAG 2.5.8 inline exception) and are not measured here.
test.use({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });

async function expectTouchSized(targets: Locator, what: string) {
  const count = await targets.count();
  expect(count, `${what}: none found`).toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    const box = (await targets.nth(i).boundingBox())!;
    expect(box.height, `${what} #${i + 1} height`).toBeGreaterThanOrEqual(44);
  }
}

test('metric source links are touch sized', async ({ page }) => {
  await page.goto('/');
  await expectTouchSized(
    page.locator('#run-summary').getByRole('link', { name: /^source/ }),
    'source link',
  );
});

test('severity chip links in a run summary are touch sized', async ({ page }) => {
  await page.goto('/projects/accessibility-testing');
  await expectTouchSized(
    page.getByRole('region', { name: 'Run summary' }).locator('a[data-open-severity]'),
    'severity link',
  );
});

test('home index rows show their result without hover', async ({ page }) => {
  await page.goto('/');
  const first = page
    .getByRole('region', { name: 'Featured projects' })
    .getByRole('listitem')
    .first();
  await expect(first.locator('[data-index-hook]')).toBeVisible();
});
