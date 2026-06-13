import { defineConfig, devices } from '@playwright/test';

/**
 * Live-site config for the S7 consent e2e (no local webServer).
 *
 * Runs ONLY `e2e/consent-live.spec.ts` against a deployed URL (default
 * production touchvodka.com) to confirm no tracker fires before opt-in and that
 * the CPRA "Do Not Sell or Share" opt-out keeps marketing trackers off (T45).
 *
 *   BASE_URL=https://touchvodka.com npx playwright test --config playwright.live.config.ts
 */
const BASE_URL = process.env.BASE_URL ?? 'https://touchvodka.com';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'consent-live.spec.ts',
  fullyParallel: false,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    // Always a cold visitor — no persisted consent.
    storageState: undefined,
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        // The consent lib (vanilla-cookieconsent v3) defaults `hideFromBots:true`
        // and suppresses the banner when `navigator.webdriver` is true. Present as
        // a real visitor so the banner renders; the spec also masks webdriver.
        launchOptions: { args: ['--disable-blink-features=AutomationControlled'] },
      },
    },
  ],
});
