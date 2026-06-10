/**
 * Production-media resolver — Rollout Task 7, production-media tier (S5, Wave 2·J).
 *
 * Touch Vodka's client-editable media (bottle shots, blog heroes) is migrated OUT
 * of git and into the shared Strapi S3 media → CloudFront/imgproxy CDN, referenced
 * by URL so it's swappable without a deploy. This helper is the ONE place that
 * decides where an image resolves from:
 *
 *   - Absolute URL (already from Strapi/CDN, e.g. a `populate=*` media field) →
 *     passes through untouched. This is the live path once content carries media.
 *   - Site-relative path (`/products/artisan.png`) + `NEXT_PUBLIC_MEDIA_BASE` set →
 *     rewritten to `${base}/products/artisan.png` (Strapi media or the CDN origin).
 *   - Site-relative path + no base → returns the local `public/` path unchanged, so
 *     dev/preview and the pre-CDN live build keep rendering. (The CloudFront edge is
 *     a deferred hardening item — until it's live the base points at the Strapi
 *     media host directly; see S5-WAVE2J-MEDIA-RUNBOOK.md.)
 *
 * The resolved host must be allow-listed in `next.config.ts` images.remotePatterns
 * (registry trap `nextjs-image-remote-host-allowlist`).
 *
 * For on-the-fly resize once the imgproxy edge lands, switch next/image to the
 * custom loader (`assets-pipeline/loaders/cdn-image-loader.ts`) per the runbook;
 * this helper stays the source of truth for the base URL.
 */

const MEDIA_BASE = (process.env.NEXT_PUBLIC_MEDIA_BASE ?? '').replace(/\/+$/, '');

/** Resolve a media reference to its CDN/Strapi URL, falling back to local public/. */
export function mediaUrl(src?: string | null): string {
  if (!src) return '';
  if (/^https?:\/\//i.test(src)) return src; // already absolute (Strapi/CDN)
  if (!MEDIA_BASE) return src; // pre-CDN → local public/ fallback
  return `${MEDIA_BASE}/${src.replace(/^\/+/, '')}`;
}
