import { defineConfig, devices } from '@playwright/test';

const PORT = 3210;
const baseURL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  testMatch: ['e2e/**/*.spec.ts'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? [['html', { open: 'never' }], ['github']] : [['list']],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
      // Theme behaviour is viewport-independent; the drawer's toggle is covered in shell.spec.
      testIgnore: /theme\.spec\.ts/,
    },
  ],
  webServer: {
    command: `pnpm build && pnpm start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
    env: { NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? baseURL },
  },
});
