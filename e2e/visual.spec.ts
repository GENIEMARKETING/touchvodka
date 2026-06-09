import { expect, gotoStable, test } from './support/test';

// Visual-regression baseline (S5 testing backbone, from the tikaram pilot).
// Commit Linux baselines from CI: `pnpm test:update`. Motion is frozen by
// gotoStable so snapshots are deterministic.
for (const path of ['/', '/products', '/find-us']) {
  test(`visual: ${path}`, async ({ page }) => {
    await gotoStable(page, path);
    await expect(page).toHaveScreenshot(`${path === '/' ? 'home' : path.slice(1)}.png`, {
      fullPage: true,
    });
  });
}
