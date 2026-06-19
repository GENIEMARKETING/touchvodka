import { defineConfig, devices } from '@playwright/test';

/**
 * Live-PREVIEW config for the redesign functionality verification (tasks 2/6/9).
 * Runs ONLY `e2e/preview-backends.spec.ts` against the Amplify preview.
 *
 *   BASE_URL=https://redesign-home-hero.d1yhwh9axgn9ty.amplifyapp.com \
 *     npx playwright test --config playwright.preview.config.ts
 */
const BASE_URL =
  process.env.BASE_URL ?? 'https://redesign-home-hero.d1yhwh9axgn9ty.amplifyapp.com';

export default defineConfig({
  testDir: './e2e',
  testMatch: 'preview-backends.spec.ts',
  fullyParallel: false,
  retries: 1,
  timeout: 90_000,
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
    storageState: undefined,
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 900 },
        // vanilla-cookieconsent v3 hides the banner when navigator.webdriver=true.
        launchOptions: { args: ['--disable-blink-features=AutomationControlled'] },
      },
    },
  ],
});
