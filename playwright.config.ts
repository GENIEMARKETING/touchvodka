import { defineConfig, devices } from '@playwright/test';

/**
 * Standard testing backbone for a Vinny site (smoke · a11y · visual), inherited
 * from the tikaram-spirits pilot. CI runs this; commit linux visual baselines.
 */
const PORT = 3000;
const BASE_URL = process.env.BASE_URL ?? `http://localhost:${PORT}`;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,
  reporter: isCI ? [['list'], ['html', { open: 'never' }], ['github']] : [['list']],
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{testFilePath}/{arg}{ext}',
  use: { baseURL: BASE_URL, trace: 'on-first-retry' },
  expect: {
    timeout: 10_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.02, animations: 'disabled', scale: 'css' },
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
    },
    { name: 'mobile', use: { ...devices['Pixel 5'] } },
  ],
  webServer: {
    command: 'pnpm build && pnpm start',
    url: BASE_URL,
    // CI does a cold `next build` here, which can exceed 120s on a fresh runner.
    timeout: 300_000,
    reuseExistingServer: !isCI,
  },
});
