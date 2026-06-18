/**
 * Touch Vodka — PostHog Cloud product analytics with FULL CAPTURE.
 *
 * ⚠️ DELIBERATE PRIVACY-POSTURE OVERRIDE (Vinny-authorized 2026-06-17).
 * The fleet default `initPostHog` in @geniemarketing/foundation/tracking is
 * privacy-HARDENED: it strips `$ip` and disables session recording (see
 * infrastructure/services/posthog/privacy.md — "non-negotiable" guardrails).
 * Touch Vodka intentionally captures the EXACT visitor IP (+ GeoIP) and SESSION
 * REPLAYS, so this site-local initializer replaces the foundation one.
 *
 * Why site-local and not a foundation change: touchvodka consumes foundation as
 * a PUBLISHED package (@geniemarketing/foundation@0.2.2 from GH Packages), and
 * its locked-down initPostHog can't express this posture. We still reuse the
 * foundation `tagLoader` + `consentStore` so the consent gate is identical to
 * every other tracker. Promote this into foundation (a `captureIp` /
 * `sessionRecording` option) once a 2nd brand wants it (the 3×-reuse rule).
 *
 * Consent + privacy still enforced at THREE layers:
 *   1. Client gate — registered via `tagLoader` under the `analytics` category,
 *      so array.js is never injected before opt-in; on withdrawal we
 *      `opt_out_capturing()`.
 *   2. PostHog project settings (operator) — IP retention is governed by
 *      "Discard client IP data" = OFF, replays by "Record user sessions" = ON.
 *      The code cooperates; the project settings are the real switch.
 *   3. Input masking — `maskAllInputs` so form fields (email, address) are never
 *      recorded in replays.
 */
import { consentStore } from '@geniemarketing/foundation/consent';
import { tagLoader } from '@geniemarketing/foundation/tracking';

type PostHogLike = {
  init: (key: string, opts: Record<string, unknown>) => void;
  capture: (event: string, props?: Record<string, unknown>) => void;
  opt_in_capturing: () => void;
  opt_out_capturing: () => void;
  startSessionRecording?: () => void;
};

function ph(): PostHogLike | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { posthog?: PostHogLike }).posthog;
}

/**
 * PostHog Cloud serves the loader (array.js) from a regional ASSETS host, not the
 * ingestion host. Derive it so a single NEXT_PUBLIC_POSTHOG_HOST drives both:
 *   https://us.i.posthog.com → https://us-assets.i.posthog.com
 *   https://eu.i.posthog.com → https://eu-assets.i.posthog.com
 * Self-hosted instances (no `i.posthog.com`) serve array.js from the same host.
 */
function assetHost(apiHost: string): string {
  const clean = apiHost.replace(/\/$/, '');
  const m = clean.match(/^https:\/\/(us|eu)\.i\.posthog\.com$/);
  return m ? `https://${m[1]}-assets.i.posthog.com` : clean;
}

let started = false;

/**
 * Register PostHog (full capture) with the consent gate. Call once at app start.
 * No-ops on the server and is harmless if called with empty args.
 */
export function initPostHogFull(apiKey: string, apiHost: string): void {
  if (started || typeof window === 'undefined') return;
  if (!apiKey || !apiHost) return;
  started = true;

  const api = apiHost.replace(/\/$/, '');

  tagLoader.register({
    id: 'posthog',
    category: 'analytics',
    load() {
      // array.js exposes the `window.posthog` queue stub; init configures it.
      const el = document.createElement('script');
      el.id = 'posthog';
      el.async = true;
      el.src = `${assetHost(api)}/static/array.js`;
      document.head.appendChild(el);

      const start = () => {
        const inst = ph();
        if (!inst) {
          setTimeout(start, 50); // array.js still loading — retry next tick.
          return;
        }
        inst.init(apiKey, {
          api_host: api,
          autocapture: true,
          capture_pageview: true,
          // FULL CAPTURE override vs the foundation default:
          //   • NO `property_blacklist: ['$ip']` and NO `ip: false`, so PostHog
          //     keeps the server-observed IP and runs GeoIP (city/region/country).
          //     Final IP retention is the project's "Discard client IP" = OFF.
          //   • Session replay ON, with inputs masked for privacy.
          persistence: 'localStorage+cookie',
          disable_session_recording: false,
          session_recording: {
            maskAllInputs: true,
            maskTextSelector: '[data-ph-mask]',
          },
        });
        inst.opt_in_capturing();
        inst.startSessionRecording?.();
      };
      start();
    },
  });

  // Stop capturing if `analytics` consent is later withdrawn.
  consentStore.subscribe(() => {
    if (!consentStore.hasConsent('analytics')) ph()?.opt_out_capturing();
  });
}
