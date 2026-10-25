import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 900 } });

test('every page ends with a suggested next page', async ({ page }) => {
  await page.goto('/skills');
  const next = page.getByRole('navigation', { name: 'Next page' });
  await expect(next.getByRole('link')).toHaveAttribute('href', '/about');
  await page.goto('/contact');
  await expect(
    page.getByRole('navigation', { name: 'Next page' }).getByRole('link'),
  ).toHaveAttribute('href', '/');
});

test('Ctrl/Cmd+K opens the palette; typing filters; Enter navigates', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('ControlOrMeta+k');
  const input = page.getByRole('combobox', { name: 'Search the site' });
  await expect(input).toBeFocused();
  await input.fill('F-7');
  await expect(page.getByRole('option').first()).toContainText('F-7');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/projects\/accessibility-testing#ticket-F-7$/);
});

test('arrow keys move the active option', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('ControlOrMeta+k');
  const input = page.getByRole('combobox', { name: 'Search the site' });
  await input.fill('test');
  await page.keyboard.press('ArrowDown');
  await expect(input).toHaveAttribute('aria-activedescendant', /option-1$/);
  const active = (await input.getAttribute('aria-activedescendant'))!;
  await expect(page.locator(`[id="${active}"]`)).toHaveAttribute('aria-selected', 'true');
});

test('no results is announced and Esc returns focus to the opener', async ({ page }) => {
  await page.goto('/about');
  const opener = page.locator('aside').getByRole('button', { name: /^Search/ });
  await opener.click();
  const input = page.getByRole('combobox', { name: 'Search the site' });
  await input.fill('zzzzzz');
  await expect(page.getByRole('status').filter({ hasText: 'No results' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(input).toBeHidden();
  await expect(opener).toBeFocused();
});
