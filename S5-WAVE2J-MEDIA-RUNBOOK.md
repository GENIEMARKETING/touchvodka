# S5 · Wave 2·J — Production media → Strapi S3 / CDN (operator runbook)

**Session:** S5 (assets → CDN) · **Date authored:** 2026-06-09 · **Gates:** `FLEET UP` ✅ ·
`TV-NEXT DEPLOYED` ✅ · S6/S3 Wave 2·D (sales-channel + token) 🟡→✅ · S3 media key fixed 17:10 UTC ✅.

> ## ✅ STATUS UPDATE (2026-06-09, MEDIA pass) — Steps 0,1(B),3 DONE; decided base
> - **Step 0 (optimize):** ran `optimize.mjs touchvodka-next` → **613 KB → 126 KB default-served (79% smaller)**;
>   webp+avif derivatives in `assets-pipeline/optimized/touchvodka-next/`, lossless masters in `…/_masters/touchvodka-next/`.
> - **Step 1 — Route B EXECUTED:** synced the 7 masters (original names, logical paths) →
>   `s3://vinny-agency-media/touch-vodka/` (us-east-1, bucket policy `PublicReadMedia`). Verified **200 / correct
>   content-type / `Cache-Control: public,max-age=31536000,immutable`** for all 7.
> - **DECIDED `NEXT_PUBLIC_MEDIA_BASE`** = **`https://vinny-agency-media.s3.amazonaws.com/touch-vodka`**
>   (host already allow-listed in `next.config.ts`). `mediaUrl('/products/artisan.png')` →
>   `…/touch-vodka/products/artisan.png` (confirmed 200). *(Not `https://marketing.fatdogspirits.com` — that's the
>   Route-A Strapi host; we took Route B / direct-S3. Switch to `https://img.fatdogspirits.com/touch-vodka` once the S6 edge lands.)*
> - **REMAINING (live-prod, NOT done here):** Step 2 (set the env on Amplify `d1yhwh9axgn9ty` + redeploy) and Step 4
>   (`git rm` the binaries — only after Step 3 confirms the *live* site renders from the base). These mutate the live
>   production app + git history → deliberately left for the operator/go-ahead.

The **code half is done and verified** (typecheck clean; Biome 0/0). This runbook is the
**live half** — prod-secret reads + live-app writes + a Strapi/S3 upload + a git-history
trim — all blocked by the auto-mode classifier in the authoring session. Run on the operator
machine with AWS + Amplify + Strapi-admin + SOPS access.

> ⚠️ **Non-destructive until CDN-confirmed.** Do NOT remove anything from `public/` (Step 4)
> until Step 3 shows the media serving from the CDN/Strapi base. The loader falls back to the
> local statics while `NEXT_PUBLIC_MEDIA_BASE` is unset, so the live site keeps rendering at
> every step.

---

## What changed in code (already shipped, this session)

- `src/lib/media.ts` — `mediaUrl()`: absolute (Strapi/CDN) URLs pass through; site-relative
  paths resolve against `NEXT_PUBLIC_MEDIA_BASE` when set, else fall back to local `public/`.
- Wired at every image call site: home hero + collection (`page.tsx`), `/products`,
  `/products/[slug]` (`<Image>` + OpenGraph + Product JSON-LD), `/cocktails`, and the blog
  loader (`lib/blog.ts`, single point → OG).
- `next.config.ts` — `images.remotePatterns` now allow-lists `img.fatdogspirits.com`,
  `**.fatdogspirits.com`, `marketing.fatdogspirits.com`, `vinny-agency-media.s3.amazonaws.com`
  (the stale `**.vinny.agency` host is removed); `NEXT_PUBLIC_MEDIA_BASE` documented in `env{}`.
- `.env.example` — documents `NEXT_PUBLIC_MEDIA_BASE`.
- `e2e/support/test.ts` — `freezeMotion(page, progress)` now seeks the GSAP timeline.
- `e2e/keyframes.spec.ts` — paused-timeline keyframe snapshots (0 / 0.5 / 1) for `/` + `/products`.

**Touch Vodka media inventory** (`public/`, 624 KB / 7 files): 5 bottle shots
`public/products/{artisan,keylime,ruby,one,orange}.png` + 2 blog `public/blog-images/cheap-vodka/{hero,card}.jpg`.
**No hero video** in this brand (the hero is the bottle carousel) — the "video" arm of the
handoff is N/A here. Favicons/icons are Next app-router conventions (`src/app/`), not in
`public/` — they stay.

---

## Step 0 — Optimize the production derivatives (no deps)

Use the pilot pipeline (`WEBSITES/assets-pipeline/`, proven 97% image savings on tikaram):

```bash
cd "WEBSITES/assets-pipeline"
node scripts/optimize.mjs touchvodka       # → webp/avif + responsive derivatives under optimized/_masters/touchvodka/
```

Originals are archived (never deleted) under `optimized/_masters/touchvodka/`.

---

## Step 1 — Land the media on the shared store — pick a route

**Route A · client-editable via Strapi (preferred, true "swappable without a deploy").**
Coordinate with **S6/S3** (they own Strapi content; S5 only consumes it): attach the optimized
bottle shots to each `product` entry's media field in the shared Strapi (`client=touch-vodka`),
served from the `vinny-agency-media` S3 bucket. Then `getSiteProducts(populate=*)` returns
**absolute Strapi media URLs**, which `mediaUrl()` passes through untouched — **no Amplify env
change needed for Route A.** (Verify `lib/strapi.ts` maps the Strapi v5 media field onto
`Product.image`; today it casts the response shape — align with S6/S3 if the URL isn't surfacing.)

**Route B · static-on-CDN (immediate offload, no Strapi content edit).** Upload the optimized
derivatives to the media bucket under a brand prefix, preserving the logical paths:

```bash
# real key is the claude-agency-infra IAM user (verified list+write on vinny-agency-media; S6 log 17:10)
aws s3 sync optimized/_masters/touchvodka/ \
  s3://vinny-agency-media/touch-vodka/ --content-type-by-extension --cache-control "public,max-age=31536000,immutable"
```

Then set `NEXT_PUBLIC_MEDIA_BASE` so `/products/artisan.png` → `<base>/touch-vodka/products/artisan.png`.

---

## Step 2 — Point the site at the base (Route B, or to switch CDN host)

Set on Amplify app `touchvodka-next` (`d1yhwh9axgn9ty`, branch `next-rebuild`):

```
NEXT_PUBLIC_MEDIA_BASE = https://vinny-agency-media.s3.amazonaws.com/touch-vodka   # DECIDED (Route B, verified 200)
#                        https://img.fatdogspirits.com/touch-vodka                 # ← switch here once the S6 edge lands
```

> ⚠️ `aws amplify update-app --environment-variables` **REPLACES the whole map** (the S2
> `amplify-nextconfig-env` gotcha) — read-merge the existing vars first. `NEXT_PUBLIC_*` is
> build-time inlined, so a **redeploy of `next-rebuild` is required** for it to take effect.

**Exact read-merged command** (current live env captured 2026-06-09 — re-read first in case it drifted):

```bash
aws amplify update-app --app-id d1yhwh9axgn9ty --environment-variables \
  NEXT_PUBLIC_SITE_KEY=touch-vodka,SITE_KEY=touch-vodka,\
NEXT_PUBLIC_STRAPI_URL=https://marketing.fatdogspirits.com,\
NODE_AUTH_TOKEN=<keep-existing>,REVALIDATION_SECRET=<keep-existing>,\
NEXT_PUBLIC_MEDIA_BASE=https://vinny-agency-media.s3.amazonaws.com/touch-vodka
# then: aws amplify start-job --app-id d1yhwh9axgn9ty --branch-name next-rebuild --job-type RELEASE
```

---

## Step 3 — Verify media serves from the CDN/Strapi base

```bash
# 200 from the base host (Route B path, or a Strapi media URL for Route A):
curl -sSI "https://marketing.fatdogspirits.com/touch-vodka/products/one.png" | head -n1
# Live page references the base, not /products/*:
curl -s https://touchvodka.com/products | grep -o 'src="[^"]*one[^"]*"' | head
```

**`X-Cache: Hit` is gated on the CloudFront edge**, which is **deferred** (FLEET UP note:
"edge CloudFront/WAF deferred — hardening, not a serving blocker"; GOLIVE §6 row 0.6). Until S6
deploys `edge/cloudfront-route53-waf.yaml` + imgproxy and sets `NEXT_PUBLIC_MEDIA_BASE` to
`https://img.fatdogspirits.com`, media serves directly from Strapi/S3 (no edge cache header).
**The `X-Cache: Hit` half of the S5 verify rolls up with the S6 edge deploy** — re-run:

```bash
curl -sSI "https://img.fatdogspirits.com/touch-vodka/products/one.png" | grep -i x-cache   # after edge up
```

---

## Step 4 — Remove the bulk from git (ONLY after Step 3 is green)

```bash
cd projects/touchvodka-next
git tag legacy/public-media        # rollback point
git rm public/products/*.png public/blog-images/cheap-vodka/*.jpg
git commit -m "S5: production media → CDN; drop committed bottle/blog binaries (media out)"
# redeploy next-rebuild; confirm the site still renders (now 100% from the base)
```

Keep favicons/icons + `public/` manifest. **Done =** repo carries no bottle/blog binaries,
media serves from the CDN/Strapi base, `next/image` resolves through `mediaUrl()`.

---

## Step 5 — Visual-regression baselines

In CI (Linux), commit the keyframe + full-page baselines after the media swap so the asset
change is captured, not flagged as a diff:

```bash
CI=1 pnpm test:update     # regenerates e2e/__screenshots__ incl. *-kf-{0,0.5,1}.png
```

Then flip the **S5** cell ✅ in `sessions/TOUCHVODKA-GOLIVE.md` §6 and log §7.
