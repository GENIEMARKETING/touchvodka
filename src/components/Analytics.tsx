'use client';

/**
 * Analytics — the S7 tracking gate, mounted once in the root layout.
 *
 * THE COMPLIANCE FIX (T25 onboarding): the Vite build fired `gtag` on every page
 * load with NO consent gate (a live GDPR gap flagged in ONBOARDING.md). Here both
 * trackers are registered through `@vinny/foundation`'s consent-gated loaders:
 *   • PostHog (analytics category) — initPostHog only injects after opt-in.
 *   • Google gtag (marketing category) — pixels.google() via tagLoader; nothing
 *     loads until the visitor accepts marketing in the consent banner.
 * Nothing tracks before consent; withdrawing consent opts back out.
 */
import { tagLoader } from '@vinny/foundation/tracking';
import { initPostHog, pixels } from '@vinny/foundation/tracking';
import { useEffect } from 'react';

export default function Analytics() {
  useEffect(() => {
    const phKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const phHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    if (phKey && phHost) {
      initPostHog({ apiKey: phKey, apiHost: phHost });
    }

    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    if (gaId) {
      // Legacy gtag — now consent-gated under `marketing` (was ungated).
      tagLoader.register(pixels.google(gaId));
    }
  }, []);

  return null;
}
