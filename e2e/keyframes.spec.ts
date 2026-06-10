import { expect, freezeMotion, test } from './support/test';

/**
 * Paused-timeline KEYFRAME visual regression (S5 Wave 2·J).
 *
 * The full-page suite (visual.spec.ts) snapshots the END state (progress 1) only,
 * so an animation that breaks *mid-flight* — wrong easing, a dropped enter, a
 * stuck `will-change` — can slip through while start and end still look right.
 * This suite seeks the shared @geniemarketing/ui/motion GSAP timeline to discrete
 * keyframes (0 = pre-enter, 0.5 = mid, 1 = settled) and snapshots each, so the
 * animation's *shape* is pinned, not just its resting pose.
 *
 * Motion is otherwise frozen (CSS transitions/animations off) so only the GSAP
 * seek moves — deterministic across runs. If a route has no GSAP timeline the
 * three frames are identical, which still proves "nothing silently broke".
 *
 * Commit Linux baselines from CI: `pnpm test:update`.
 */
const KEYFRAMES = [0, 0.5, 1] as const;

// The home hero + product reveal carry the brand's bespoke motion.
for (const path of ['/', '/products']) {
  for (const progress of KEYFRAMES) {
    const label = path === '/' ? 'home' : path.slice(1);
    test(`keyframe ${progress} · ${path}`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle').catch(() => {});
      await freezeMotion(page, progress);
      await expect(page).toHaveScreenshot(`${label}-kf-${progress}.png`, { fullPage: true });
    });
  }
}
