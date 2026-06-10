import { type Page, test as base, expect } from '@playwright/test';

/**
 * Testing backbone — standardized from the tikaram-spirits pilot.
 * Sets `window.__E2E__` before app JS so @geniemarketing/ui/motion exposes the GSAP
 * timeline, and provides `freezeMotion` for deterministic snapshots.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      (window as unknown as { __E2E__?: boolean }).__E2E__ = true;
    });
    await use(page);
  },
});

/**
 * Freeze all motion deterministically and seek any GSAP timeline to `progress`
 * (0 = start … 1 = end). Defaults to the end state (1) so existing full-page
 * snapshots are unchanged; the keyframe suite drives it to 0/0.5/1 so a broken
 * animation can't pass silently (S5 Wave 2·J — paused-timeline keyframes).
 */
export async function freezeMotion(page: Page, progress = 1) {
  await page.evaluate(async (p) => {
    const style = document.createElement('style');
    style.textContent =
      '*,*::before,*::after{transition:none!important;animation:none!important;scroll-behavior:auto!important}';
    document.head.appendChild(style);

    type ST = { animation?: { progress?: (v: number) => void }; progress?: (v: number) => void };
    const w = window as unknown as {
      __gsap?: { globalTimeline?: { progress: (v: number) => void; pause: () => void } };
      __ScrollTrigger?: { getAll?: () => ST[] };
    };
    try {
      for (const t of w.__ScrollTrigger?.getAll?.() ?? []) {
        if (t.animation?.progress) t.animation.progress(p);
        else t.progress?.(p);
      }
      w.__gsap?.globalTimeline?.progress(p);
      w.__gsap?.globalTimeline?.pause();
    } catch {
      /* nothing to freeze */
    }
    const fonts = (document as unknown as { fonts?: { ready?: Promise<unknown> } }).fonts;
    await fonts?.ready?.catch(() => {});
  }, progress);
  await page.waitForTimeout(300);
}

export async function gotoStable(page: Page, path: string) {
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle').catch(() => {});
  await freezeMotion(page);
}

export { expect };
