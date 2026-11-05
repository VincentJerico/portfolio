import { expect, test, type Page } from '../helpers/test';
import { expectNoViolations } from '../helpers/a11y';
import { waitForHydration } from '../helpers/hydration';

const SENT = "Message sent. I'll reply by email.";

test.beforeEach(async ({ page }) => {
  await page.setExtraHTTPHeaders({ 'x-e2e-client': crypto.randomUUID() });
});

// The Email section is also labelled "Email", so match textboxes only.
function field(page: Page, name: string) {
  return page.getByRole('textbox', { name, exact: true });
}

async function fillValid(page: Page, message = 'Hello, this is a test message.') {
  await field(page, 'Name').fill('Test Sender');
  await field(page, 'Email').fill('sender@example.com');
  await field(page, 'Message').fill(message);
}

async function open(page: Page) {
  await page.goto('/contact');
  await waitForHydration(page);
}

test('labels are visible and fields are required', async ({ page }) => {
  await open(page);
  for (const label of ['Name', 'Email', 'Message']) {
    await expect(field(page, label)).toBeVisible();
    await expect(field(page, label)).toHaveAttribute('required', '');
  }
  const honeypot = page.locator('input[name="website"]');
  await expect(honeypot).toHaveAttribute('tabindex', '-1');
  await expect(honeypot.locator('xpath=ancestor::*[@aria-hidden="true"]')).toHaveCount(1);
  await field(page, 'Message').focus();
  await page.keyboard.press('Tab');
  await expect(honeypot).not.toBeFocused();
});

test('invalid submit announces errors and focuses the first invalid field', async ({ page }) => {
  await open(page);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(
    page.getByRole('alert').filter({ hasText: 'Check the highlighted fields' }),
  ).toBeVisible();
  const name = field(page, 'Name');
  await expect(name).toHaveAttribute('aria-invalid', 'true');
  const describedBy = await name.getAttribute('aria-describedby');
  await expect(page.locator(`[id="${describedBy}"]`)).toHaveText('Enter your name.');
  await expect(name).toBeFocused();
});

test('valid submit announces success and clears the form', async ({ page }) => {
  await open(page);
  await fillValid(page);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('status').filter({ hasText: SENT })).toBeVisible();
  for (const label of ['Name', 'Email', 'Message']) {
    await expect(field(page, label)).toHaveValue('');
  }
});

// A successful send resets the form, so the emptied Name field marks this send as settled
// (the previous send's success text alone cannot tell sends apart).
async function sendAndSettle(page: Page) {
  await fillValid(page);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(field(page, 'Name')).toHaveValue('');
  await expect(page.getByRole('button', { name: 'Send message' })).toBeEnabled();
}

test('sixth message within ten minutes is refused', async ({ page }) => {
  await open(page);
  for (let i = 0; i < 5; i++) {
    await sendAndSettle(page);
  }
  await fillValid(page);
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(
    page
      .getByRole('alert')
      .filter({ hasText: 'Too many messages. Try again in a few minutes, or email me directly.' }),
  ).toBeVisible();
});

test('a second success on the same page is announced again', async ({ page }) => {
  await open(page);
  const status = page.getByRole('region', { name: 'Send a message' }).getByRole('status');
  await sendAndSettle(page);
  await expect(status).toHaveText(SENT);

  let release: () => void = () => {};
  const held = new Promise<void>((resolve) => (release = resolve));
  await page.route('**/contact', async (route) => {
    await held;
    await route.continue();
  });
  await fillValid(page);
  await page.getByRole('button', { name: 'Send message' }).click();
  try {
    await expect(page.getByRole('button', { name: 'Sending…' })).toBeDisabled();
    await expect(status).toHaveText('');
  } finally {
    release();
  }
  await expect(status).toHaveText(SENT);
});

test('mail failure is announced', async ({ page }) => {
  await open(page);
  await fillValid(page, 'This contains e2e-mailer-failure to force an error.');
  await page.getByRole('button', { name: 'Send message' }).click();
  const alert = page.getByRole('alert').filter({ hasText: 'Your message could not be sent.' });
  await expect(alert).toContainText('Email me directly at');
  await expect(alert).toContainText('@');
});

test('no horizontal overflow at 320 px', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 700 });
  await open(page);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('works without JavaScript', async ({ page }) => {
    await page.goto('/contact');
    await fillValid(page);
    await page.getByRole('button', { name: 'Send message' }).click();
    await expect(page.getByRole('status').filter({ hasText: SENT })).toBeVisible();
  });
});

for (const scheme of ['light', 'dark'] as const) {
  test.describe(`${scheme} theme`, () => {
    test.use({ colorScheme: scheme });

    test('error state has no WCAG violations', async ({ page }, testInfo) => {
      await open(page);
      await page.getByRole('button', { name: 'Send message' }).click();
      await expect(
        page.getByRole('alert').filter({ hasText: 'Check the highlighted fields' }),
      ).toBeVisible();
      await expectNoViolations(page, testInfo);
    });
  });
}
