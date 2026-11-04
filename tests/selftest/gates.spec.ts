import { expectNoViolations, focusEntirelyObscured } from '../helpers/a11y';
import { waitForHydration } from '../helpers/hydration';
import { tabKey } from '../helpers/keys';
import { expect, test } from '../helpers/test';

// Spec 12.3 self-test: a page with planted defects must make the gates fail, proving they are not
// vacuous. /selftest exists only in builds with E2E_SELFTEST=1.

test('the axe gate fails on a planted contrast defect', async ({ page }, testInfo) => {
  await page.goto('/selftest');
  await expect(page.locator('h1')).toHaveText('Gate self-test');
  await expect(expectNoViolations(page, testInfo)).rejects.toThrow(/color-contrast/);
});

test('the focus-obscured guard catches the planted focus-trap bug', async ({
  page,
  browserName,
}) => {
  await page.goto('/selftest');
  await waitForHydration(page);
  const obscured: boolean[] = [];
  for (let i = 0; i < 25; i++) {
    await page.keyboard.press(tabKey(browserName));
    obscured.push(await focusEntirelyObscured(page));
  }
  expect(obscured).toContain(true);
});

test('the in-page runner reports the planted defects as failures', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto('/selftest');
  await waitForHydration(page);
  // The planted overlay covers the page (that is the bug), so start the run from the keyboard.
  const trigger = page.locator('aside').getByRole('button', { name: 'Run tests on this page' });
  await trigger.focus();
  await page.keyboard.press('Enter');
  const panel = page.getByRole('region', { name: 'Test run' });
  await expect(panel.locator('[data-check="Accessibility"]')).toContainText('color-contrast', {
    timeout: 20_000,
  });
});
