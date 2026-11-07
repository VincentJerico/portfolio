import { expect, test } from '../helpers/test';
import { waitForHydration } from '../helpers/hydration';

test.describe('decoding labels', () => {
  test('a hovered kicker scrambles only its hidden copy and settles on the real text', async ({
    page,
  }) => {
    await page.goto('/');
    await waitForHydration(page);
    const kicker = page.locator('#run-summary .decode').first();
    const real = await kicker.locator('.sr-only').textContent();
    await kicker.hover();
    await expect(kicker.locator('.sr-only')).toHaveText(real!);
    await expect(kicker.locator('[data-decode]')).toHaveText(real!, { timeout: 2000 });
    await expect(kicker.locator('[data-decode]')).toHaveAttribute('aria-hidden', 'true');
  });

  test('the label is announced once, with the real text', async ({ page }) => {
    await page.goto('/');
    const section = page.getByRole('region', { name: 'Run summary' });
    const real = (await section.locator('.decode .sr-only').first().textContent())!;
    // The accessibility tree holds the label once; the animated copy is hidden from it.
    const tree = await section.ariaSnapshot();
    expect(tree.split(real).length - 1).toBe(1);
  });
});
