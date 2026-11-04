import { expect, test } from '../helpers/test';

test('/quality explains every gate and its self-test, and never fakes a result', async ({
  page,
}) => {
  await page.goto('/quality');
  const main = page.locator('main');
  await expect(main.locator('h1')).toHaveText('Quality');
  // The committed report is a sample until CI on main writes a real one.
  await expect(main).toContainText('Not run yet');
  await expect(main).not.toContainText(/\bPASS\b/);
  for (const gate of [
    'Lint and format',
    'Types',
    'Unit and content guards',
    'End-to-end',
    'Lighthouse',
    'Link check',
  ]) {
    await expect(main.getByRole('heading', { level: 3, name: new RegExp(gate) })).toBeVisible();
  }
  await expect(main).toContainText("a gate that can't fail isn't a gate");
  await expect(main).toContainText('legatalink.free.nf');
  await expect(main.getByRole('button', { name: 'Run tests on this page' })).toBeVisible();
});
