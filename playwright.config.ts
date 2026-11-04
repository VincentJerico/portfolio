import { defineConfig, devices } from '@playwright/test';

const PORT = 3210;
// PLAYWRIGHT_BASE_URL points the suite at a live deployment (smoke and header checks after a deploy).
const deployed = process.env.PLAYWRIGHT_BASE_URL || undefined;
const baseURL = deployed ?? `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests',
  // Against a deployment: smoke and header checks only, minus tests about local builds. Locally and in
  // the gate jobs: everything except the deployment smoke specs.
  testMatch: deployed
    ? ['smoke/**/*.spec.ts', 'security/**/*.spec.ts']
    : ['e2e/**/*.spec.ts', 'security/**/*.spec.ts', 'a11y/**/*.spec.ts', 'selftest/**/*.spec.ts'],
  grepInvert: deployed ? /@local-build/ : undefined,
  // Spec 12.6: retries capture traces, but a test that only passes on retry still fails the run.
  retries: process.env.CI ? 2 : 0,
  failOnFlakyTests: !!process.env.CI,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI
    ? [
        ['html', { open: 'never' }],
        ['github'],
        ['json', { outputFile: 'test-results/results.json' }],
      ]
    : [['list']],
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
      name: 'webkit',
      use: { ...devices['Desktop Safari'], viewport: { width: 1280, height: 800 } },
      // Chrome DevTools throttling and clipboard permissions have no WebKit equivalent.
      grepInvert: /@chromium-only/,
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
      // Theme behaviour is viewport-independent; the drawer's toggle is covered in shell.spec.
      testIgnore: /theme\.spec\.ts/,
    },
  ],
  webServer: deployed
    ? undefined
    : {
        // CI downloads the build job's artifact (.next and the generated CV), so it only starts the server.
        command: process.env.CI
          ? `pnpm start -p ${PORT}`
          : `pnpm build && pnpm cv && pnpm start -p ${PORT}`,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
        // E2E_SELFTEST builds /selftest, the page with planted defects the gate self-tests run against.
        env: {
          NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? baseURL,
          E2E_SELFTEST: '1',
        },
      },
});
