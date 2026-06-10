'use client';

/**
 * Analytics — the S7 tracking gate, mounted once in the root layout.
 *
 * THE COMPLIANCE FIX (T25 onboarding): the Vite build fired `gtag` on every page
 * load with NO consent gate (a live GDPR gap flagged in ONBOARDING.md). Every
 * tracker is registered through `@geniemarketing/foundation`'s consent-gated
 * loaders, so nothing fires before opt-in and withdrawing consent opts back out:
 *
 *   • RudderStack CDP (analytics category) — initRudderStack is the CANONICAL
 *     product-analytics path (S9 / #22). It only loads after `analytics` consent
 *     and attaches the consent ids on every event, which the server-side
 *     `consentGuard.js` re-checks before anything lands in `raw.rudder_events`.
 *     The per-brand write key is `WRITE_KEY_TOUCH` (RudderStack source
 *     `touch-vodka`, in SOPS), surfaced to the browser as
 *     NEXT_PUBLIC_RUDDERSTACK_WRITE_KEY; data plane = events.fatdogspirits.com.
 *   • PostHog (analytics category) — kept as an OPTIONAL future self-host path
 *     (the dedicated box was never deployed; see the PostHog-vs-CDP DECISION in
 *     sessions/HANDOFFS.md). initPostHog no-ops while NEXT_PUBLIC_POSTHOG_KEY is
 *     empty, so it costs nothing and lights up only if Vinny later stands the box
 *     up. The CDP stream above is the live path.
 *   • Google gtag (marketing category) — pixels.google() via tagLoader; nothing
 *     loads until the visitor accepts marketing in the consent banner.
 */
import { tagLoader } from '@geniemarketing/foundation/tracking';
import { initPostHog, initRudderStack, pixels } from '@geniemarketing/foundation/tracking';
import { useEffect } from 'react';

export default function Analytics() {
  useEffect(() => {
    // Canonical analytics path: RudderStack CDP → warehouse (consent-gated).
    const cdpKey = process.env.NEXT_PUBLIC_RUDDERSTACK_WRITE_KEY;
    const cdpPlane = process.env.NEXT_PUBLIC_RUDDERSTACK_DATAPLANE;
    if (cdpKey && cdpPlane) {
      initRudderStack({ writeKey: cdpKey, dataPlaneUrl: cdpPlane });
    }

    // Optional future self-host: no-ops while the PostHog key is empty.
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
