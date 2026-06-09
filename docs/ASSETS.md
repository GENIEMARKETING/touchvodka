# Assets & media (S5)

How Touch Vodka's media is optimized and where it lives. Driven by
`@geniemarketing/assets-pipeline` (sharp/SVGO/ffmpeg).

## What changed in the rebuild

| Action | Result |
|---|---|
| Ran `assets-optimize touchvodka-next --no-video` | 958 KB → 399 KB default-served (**58% smaller**); report: `assets-pipeline/reports/optimize-touchvodka-next.json`. |
| Pruned unused letter-SVG logos (`/logo/*.svg`, `touch-vodka-logo.svg`) | the rebuilt Header uses a text wordmark, not the 222 KB `A.svg` etc. → `public/` 2.8 MB → **624 KB**. |
| `next/image` everywhere | product/blog rasters are optimized to WebP/AVIF on the fly at runtime — no pre-built derivatives committed to git. |
| `next/font` (Anton + Space Mono) | self-hosted, swapped the Vite build's render-blocking Google Fonts `@import`. |

## Tiers (per `assets-pipeline/config/clients.json`)

- **Masters (raw high-res, design files, source video)** → private S3 masters
  bucket `assets.fatdogspirits.com`, prefix `touch-vodka/`. Out of git. Push with
  `assets-pipeline/scripts/sync-masters.sh touchvodka-next`.
- **Production media (client-editable bottle/hero shots)** → shared Strapi S3
  media + CDN, prefix `/touch-vodka/` (S6). Referenced by URL, allowlisted in
  `next.config.ts` `images.remotePatterns`.
- **Build-static (bundled)** → the small product/blog rasters in `public/`.

## CDN (S5/T33, gated on S6 "prod up")

Production images serve through CloudFront + imgproxy. To route `next/image`
through the CDN in prod, set a custom loader (see
`assets-pipeline/loaders/cdn-image-loader.ts`) — not enabled yet; the CDN host
isn't live. Until then next/image's built-in optimizer handles it.

## Tests

Playwright visual-regression baselines for `/`, `/products`, `/find-us`
(`e2e/visual.spec.ts`). Commit Linux baselines from CI with `pnpm test:update`.
