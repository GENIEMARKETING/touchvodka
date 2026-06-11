import { defineConfig, devices } from '@playwright/test';

/**
 * Live-site config for the S10 DTC checkout e2e (no local webServer).
 *
 * Runs ONLY `e2e/checkout-live.spec.ts` against a deployed URL (default
 * production touchvodka.com) to prove the storefront completes a checkout to a
 * Medusa order. Unlike the consent config, this does NOT mask navigator.webdriver
 * — that keeps the consent banner hidden (hideFromBots) so it can't overlay the
 * checkout controls; the age gate is skipped via localStorage in the spec.
 *
 *   BASE_URL=https://touchvodka.com npx playwright test --config playwright.checkout-live.config.ts
 */
const BASE_URL = process.env.BASE_URL ?? 'https://touchvodka.com';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'checkout-live.spec.ts',
  fullyParallel: false,
  retries: 1,
  timeout: 120_000,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    storageState: undefined,
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
  ],
});
