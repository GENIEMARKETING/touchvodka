/**
 * Touch Vodka — PostHog Cloud product analytics with FULL CAPTURE.
 *
 * ⚠️ DELIBERATE PRIVACY-POSTURE OVERRIDE (Vinny-authorized 2026-06-17).
 * The fleet default `initPostHog` in @geniemarketing/foundation is privacy-
 * HARDENED (strips `$ip`, disables recording — see posthog/privacy.md). Touch
 * Vodka intentionally captures EXACT IP (+ GeoIP) and SESSION REPLAYS, so this
 * site-local initializer is used instead. Still reuses foundation `tagLoader` +
 * `consentStore`, so the consent gate is identical to every other tracker.
 *
 * LOADING: PostHog's `array.js` is the full SDK and hydrates the `window.posthog._i`
 * init queue when it loads — so the official loader STUB must exist *before* we
 * call init. (Injecting array.js bare and calling init does NOT work: the SDK
 * loads but never initializes — and `window.posthog` is a bare `[]` array at that
 * instant, so `inst.init` throws `a.init is not a function`. This is exactly the
 * `[tagLoader] posthog failed` error the foundation default `initPostHog` hits;
 * the official stub below defines a real `init` before array.js arrives, fixing
 * it.) `installStub()` is PostHog's official snippet, which also derives the
 * regional ASSETS host (api_host `us.i.posthog.com` → `us-assets.i.posthog.com`).
 *
 * Privacy still enforced at THREE layers: (1) consent gate via `tagLoader`
 * (`analytics`) — nothing loads pre-opt-in, opt-out on withdrawal; (2) PostHog
 * project settings ("Discard client IP"=OFF, "Record user sessions"=ON);
 * (3) `maskAllInputs` so form fields are never recorded in replays.
 */
import { consentStore } from '@geniemarketing/foundation/consent';
import { tagLoader } from '@geniemarketing/foundation/tracking';

// biome-ignore lint/suspicious/noExplicitAny: PostHog's loader stub is dynamically shaped (array + injected methods).
type Stub = any;

function ph(): Stub | undefined {
  if (typeof window === 'undefined') return undefined;
  return (window as unknown as { posthog?: Stub }).posthog;
}

/**
 * PostHog's official loader stub: creates `window.posthog` as a queue, stubs the
 * API so pre-load calls are buffered, injects `array.js` from the assets host,
 * and pushes the init args onto `_i` for array.js to hydrate on load. Idempotent.
 */
function installStub(): void {
  const w = window as unknown as { posthog?: Stub };
  if (w.posthog && w.posthog.__SV) return;
  const p: Stub = (w.posthog = w.posthog || []);
  p._i = [];
  p.init = (token: string, config: { api_host: string } & Record<string, unknown>, name?: string) => {
    const queue = (obj: Stub, method: string) => {
      let o = obj;
      let m = method;
      const [a, b] = method.split('.');
      if (a && b) {
        o = obj[a];
        m = b;
      }
      o[m] = (...args: unknown[]) => o.push([m, ...args]);
    };
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.crossOrigin = 'anonymous';
    script.async = true;
    script.src = `${config.api_host.replace('.i.posthog.com', '-assets.i.posthog.com')}/static/array.js`;
    const first = document.getElementsByTagName('script')[0];
    first?.parentNode?.insertBefore(script, first);
    let target: Stub = p;
    if (name !== undefined) target = p[name] = [];
    else name = 'posthog';
    target.people = target.people || [];
    const methods =
      'init capture identify alias people.set people.set_once set_config register register_once unregister opt_in_capturing opt_out_capturing has_opted_out_capturing reset group startSessionRecording stopSessionRecording get_session_replay_url isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload reloadFeatureFlags captureException'.split(
        ' ',
      );
    for (const m of methods) queue(target, m);
    p._i.push([token, config, name]);
  };
  p.__SV = 1;
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
      installStub();
      const inst = ph();
      if (!inst) return;
      inst.init(apiKey, {
        api_host: api,
        autocapture: true,
        capture_pageview: true,
        persistence: 'localStorage+cookie',
        // FULL CAPTURE: keep server-side IP + GeoIP (no $ip blacklist / ip:false),
        // session replay on with inputs masked. Recording auto-starts when the
        // project setting "Record user sessions" is ON.
        disable_session_recording: false,
        session_recording: { maskAllInputs: true },
      });
      inst.opt_in_capturing();
    },
  });

  // Stop capturing if `analytics` consent is later withdrawn.
  consentStore.subscribe(() => {
    if (!consentStore.hasConsent('analytics')) ph()?.opt_out_capturing();
  });
}
