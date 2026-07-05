import { defineConfig, devices } from '@playwright/test';

/**
 * Live-PRODUCTION config for the nightly/post-deploy QA harness (qa-live.yml).
 *
 * Runs the functional read-only suites (smoke + a11y) against the deployed
 * site — no webServer, no mutations. Consent and checkout have their own
 * dedicated configs (playwright.live.config.ts / playwright.checkout-live.config.ts).
 *
 *   BASE_URL=https://touchvodka.com npx playwright test --config playwright.prod.config.ts
 */
const BASE_URL = process.env.BASE_URL ?? 'https://touchvodka.com';

export default defineConfig({
  testDir: './e2e',
  testMatch: /(smoke|a11y)\.spec\.ts/,
  fullyParallel: true,
  // One retry: live-network flake must not file phantom bugs (the bug filer
  // only records tests where no retry passed).
  retries: 1,
  workers: 2,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    // Present as a real visitor (consent lib hides its banner from webdriver;
    // keeps live behavior identical to what customers see).
    launchOptions: { args: ['--disable-blink-features=AutomationControlled'] },
  },
  expect: { timeout: 10_000 },
  projects: [
    {
      name: 'prod-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    { name: 'prod-mobile', use: { ...devices['Pixel 5'] } },
    {
      // Real WebKit vs production — smoke only (a11y results are engine-independent).
      name: 'prod-webkit-iphone',
      testMatch: /smoke\.spec\.ts/,
      use: { ...devices['iPhone 13'] },
    },
  ],
});
