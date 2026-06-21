import type { TagDefinition } from '@geniemarketing/foundation/tracking';
import { injectScript } from '@geniemarketing/foundation/tracking';

/**
 * googleTagFixed — site-local correction of the foundation `pixels.google()` GA4 tag.
 *
 * THE BUG (proven on touchvodka.com 2026-06-21): the foundation factory builds its
 * gtag shim as `(...args) => dataLayer.push(args)`, which pushes a plain ARRAY
 * (`["config","G-…",{…}]`) into `dataLayer`. gtag.js only treats `arguments`-shaped
 * entries as gtag commands, so the `config` call never registers a GA4 destination:
 * the gtag.js library loads, but NO `/g/collect` beacon fires and NO `_ga` cookie is
 * set — GA reports "Data collection isn't active". (Meta + RudderStack use their own
 * SDKs, so only Google was dead.)
 *
 * The canonical Google snippet pushes the `arguments` object. This mirrors
 * `pixels.google()` exactly EXCEPT that one line. Same `id` ('google-gtag') so it
 * dedupes against the foundation tag, and still consent-gated under `marketing` by
 * the tagLoader. Remove once the foundation fix is published + adopted here.
 */
export function googleTagFixed(measurementId: string): TagDefinition {
  return {
    id: 'google-gtag',
    category: 'marketing',
    load() {
      injectScript(
        'google-gtag',
        `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`,
      );
      const w = window as unknown as { dataLayer?: unknown[]; gtag?: (...a: unknown[]) => void };
      w.dataLayer = w.dataLayer || [];
      // THE FIX: gtag MUST push the `arguments` object (not a spread array) or
      // gtag.js silently ignores the command and GA never collects.
      w.gtag = function gtag() {
        // biome-ignore lint/style/noArguments: gtag.js only processes the literal `arguments` object.
        w.dataLayer?.push(arguments);
      };
      w.gtag('js', new Date());
      w.gtag('config', measurementId, { anonymize_ip: true });
    },
  };
}
