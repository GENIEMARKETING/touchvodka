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
 *   • PostHog Cloud (analytics category) — product analytics: funnels, session
 *     REPLAYS, person profiles, and EXACT IP + GeoIP. Vinny-authorized 2026-06-17
 *     (reverses the 2026-06-09 PostHog-vs-CDP DECISION-A; see sessions/HANDOFFS.md).
 *     Uses the site-local `initPostHogFull` (src/lib/posthog-full.ts), NOT the
 *     foundation default — the foundation `initPostHog` is privacy-hardened (strips
 *     $ip, no recording) AND injects array.js bare, so it throws
 *     `[tagLoader] posthog failed TypeError: a.init is not a function`. The
 *     site-local loader installs PostHog's official stub first. Still consent-gated
 *     via the same tagLoader; no-ops while NEXT_PUBLIC_POSTHOG_KEY is empty. The
 *     CDP stream above stays the IP-ANONYMIZED warehouse/BI path; PostHog is the
 *     visitor-level layer.
 *   • Marketing pixels (marketing category) — Google/GA4, Meta Pixel, TikTok, and
 *     GTM, registered in ONE consent-gated call via foundation's initTracking().
 *     Each id is optional; an unset id is skipped (a dark sink, consent-safe), so
 *     this stays inert until the brand's ad creds are set. Nothing loads until the
 *     visitor accepts `marketing`. Canonical track() events (age_gate_passed,
 *     where_to_buy_click, lead_captured, …) map onto each platform's standard
 *     events via foundation's PIXEL_EVENT_MAP.
 */
import { initRudderStack, initTracking } from '@geniemarketing/foundation/tracking';
import { useEffect } from 'react';
import { initPostHogFull } from '@/lib/posthog-full';

export default function Analytics() {
  useEffect(() => {
    // Canonical analytics path: RudderStack CDP → warehouse (consent-gated).
    const cdpKey = process.env.NEXT_PUBLIC_RUDDERSTACK_WRITE_KEY;
    const cdpPlane = process.env.NEXT_PUBLIC_RUDDERSTACK_DATAPLANE;
    if (cdpKey && cdpPlane) {
      initRudderStack({ writeKey: cdpKey, dataPlaneUrl: cdpPlane });
    }

    // PostHog Cloud — full capture (replays + IP/GeoIP). No-ops while the key is
    // empty; consent-gated under `analytics`. See src/lib/posthog-full.ts.
    const phKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const phHost = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    if (phKey && phHost) {
      initPostHogFull(phKey, phHost);
    }

    // Marketing pixels (marketing category) — one consent-gated call. Each id is
    // optional; unset ids are skipped. Was Google-only via pixels.google(); now
    // also Meta/TikTok/GTM so the demand-sensing track() events reach every pixel.
    initTracking({
      googleId: process.env.NEXT_PUBLIC_GA_ID,
      metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID,
      tiktokPixelId: process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID,
      gtmId: process.env.NEXT_PUBLIC_GTM_ID,
    });
  }, []);

  return null;
}
