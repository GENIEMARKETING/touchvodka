# Learnings — Touch Vodka rebuild (T25 onboarding pilot)

Project-local log of mistakes → fixes from the FIRST end-to-end onboarding (Vite
→ Next.js rebuild that wires every platform tool). Durable, general ones are
promoted to the agency `mistakes-registry/` so the next onboarding inherits them.

Format: **Symptom · Cause · Fix · Promote?**

---

## vinny-init ships an a11y test importing a non-existent foundation export
- **Symptom:** a freshly scaffolded site fails `pnpm typecheck`/CI immediately:
  `Cannot find module '@geniemarketing/foundation/axe'`.
- **Cause:** `e2e/a11y.spec.ts` imports `expectNoA11yViolations` from
  `@geniemarketing/foundation/axe`, but `@geniemarketing/foundation`'s `exports` map has no `/axe`
  entry (only `.`, `/easings`, `/lead-contract`, `/consent`, `/tracking`, `/geo`,
  `/biome`, `/lighthouse`).
- **Fix:** assert directly with `@axe-core/playwright` (already a devDependency).
- **Promote?:** yes → registry `vinny-init-a11y-import` (every scaffolded site).

## Scaffold e2e `test.use({ reducedMotion })` fails typecheck
- **Symptom:** `'reducedMotion' does not exist in type 'Fixtures<…>'`.
- **Cause:** `e2e/support/test.ts` does `base.extend({ page })`, which narrows the
  test type and drops the built-in Playwright `TestOptions`.
- **Fix:** use `page.emulateMedia({ reducedMotion: 'reduce' })` instead of the
  `test.use` option form. (Or type the extend with `PlaywrightTestOptions`.)
- **Promote?:** folded into `vinny-init-a11y-import` (same scaffold file).

## Shared Strapi tenant field is `client`, not `site`
- **Symptom:** product/stockist queries would return nothing against the live CMS.
- **Cause:** the vinny-platform spirits-brand template + blocks filter by
  `filters[site][$eq]`, but the DEPLOYED CMS (`infrastructure/cms`) isolates
  tenants by a `client` enumeration (slug `touch-vodka`).
- **Fix:** `lib/strapi.ts` filters by `filters[client][$eq]=touch-vodka`.
- **Promote?:** yes → registry `strapi-tenant-field-site-vs-client`.

## Scaffold defaults the Strapi host to a stub
- **Symptom:** `NEXT_PUBLIC_STRAPI_URL` defaulted to `cms.vinny.agency`, which is
  not the real CMS.
- **Cause:** vinny-init placeholder; the deployed Strapi is
  `marketing.fatdogspirits.com`.
- **Fix:** set the real host in `.env.example` + `next.config.ts` remotePatterns;
  `lib/strapi.ts` defaults to it.
- **Promote?:** noted under the existing `prod-cms-url-not-localhost` rule.

## Footer block and Button block disagree on `--brand-fg`
- **Symptom:** with Touch Vodka's tokens the shared Footer would render
  white-on-white.
- **Cause:** the `footer` block uses `--brand-fg` as a *background* (assumes a
  dark brand color), while `@geniemarketing/ui` Button uses `--brand-fg` as on-brand
  *text*. Only consistent when `--brand` is light (e.g. gold). Touch Vodka's
  `--brand` is dark blue with WHITE on-text, so `--brand-fg=#fff`.
- **Fix:** kept a bespoke `SiteFooter` themed explicitly (we own copied blocks).
- **Promote?:** yes → registry `token-brand-fg-dual-use`.

## Commerce blocks are coupled to Medusa
- **Symptom:** `product-grid`/`product-card` blocks won't build for a brand-only
  site (`Cannot find module '@geniemarketing/commerce'`).
- **Cause:** they import `StoreProduct`/`formatPrice`/`discountPercent` from
  `@geniemarketing/commerce` — they're Medusa PLP tiles, not brand-showcase cards.
- **Fix:** dropped them; built a bespoke brand product card/grid from the seed.
- **Promote?:** yes → registry `commerce-blocks-require-medusa` (reuse guidance).

## stockist-locator's react-simple-maps doesn't support React 19
- **Symptom:** install peer warning: `react-simple-maps 3.0.0` wants
  `react@^16.8 || 17 || 18`, found 19.
- **Cause:** the block ships `react-simple-maps@3` (latest), unmaintained for R19.
- **Fix:** works at runtime; pinned + documented. Watch for a maintained fork or
  swap the map renderer if it breaks under R19.
- **Promote?:** yes → registry `react-simple-maps-react19-peer`.

## brand_id slug must match across all systems
- **Symptom:** a brand's facts wouldn't resolve in the warehouse / RLS.
- **Cause:** `dim_brand` + `lead-contract` use long slugs (`fat-dog-spirits`),
  but `db/rls/003_seed_tenants.sql` uses short ones (`fat-dog`). The warehouse
  README requires `brand_id == RLS tenant_id == RudderStack source`.
  touch-vodka is consistent everywhere; fat-dog/tikaram are not.
- **Fix:** verified `touch-vodka` is identical across dim_brand / CMS `client` /
  lead-contract / RLS. Flagged the fat-dog/tikaram drift for the fleet.
- **Promote?:** yes → registry `brand-slug-consistency-across-systems`.

## Scaffold biome.json doesn't ignore `graphify-out/` — lint breaks after `graphify update`
- **Symptom:** after the CLAUDE.md-mandated `graphify update .`, `biome check .`
  jumps from 52 → 124 files and reports ~71 errors — all in
  `graphify-out/cache/ast/*.json`, `graph.json`, `GRAPH_REPORT.md`.
- **Cause:** vinny-init's `biome.json` ignores `.next/out/node_modules` but not
  `graphify-out/` (or `public/`), so generated graph artifacts get linted.
- **Fix:** add `graphify-out/**` (and `public/**`) to `biome.json` `files.ignore`.
- **Promote?:** yes → registry `biome-ignore-generated-graphify`.

## Biome `noCommentText` trips on literal `//` in JSX
- **Symptom:** `<span>// 01_CATALOGUE</span>` fails lint ("Wrap comments inside
  children within braces").
- **Cause:** Touch Vodka's neo-brutalist design uses `//` as a decorative text
  prefix; biome reads a leading `//` JSX child as a comment.
- **Fix:** wrap such literals in braces: `{'// 01_CATALOGUE'}`.
- **Promote?:** no — project idiom; recorded here for the next brutalist site.

## A "milestone emitted" flag ≠ the service is actually deployed/reachable
- **Symptom:** S9 analytics onboarding was triggered to "wire it live" because S6
  had **emitted "prod up" / "Strapi up"**. But every warehouse service was down:
  no Docker daemon, ports 8123/9000/8080/3000 closed, no service secrets in the
  SOPS store (only Strapi/Medusa/AWS/SMTP keys), and the `dim_brand` channel keys
  still empty.
- **Cause:** the milestone was a **coordination signal** (unblocks dependents to
  *start*), but the actual `infrastructure/` OpenTofu apply is **paused for cost
  approval** and the `geniemarketing` AWS profile isn't on this machine
  (`infrastructure/cms/onboarding/touch-vodka.md` §6). Emitted ≠ applied.
- **Fix:** any session that gates live wiring on another session's milestone must
  run a **reachability + secret-presence gate FIRST** (ports / `docker ps` /
  `sops` key check), then branch: services up + ids present → wire live; else do
  the offline prep (spine checks, staged patches) and mark the rest BLOCKED. Did
  exactly that here → Branch B; staged `touch-vodka.dim_brand.sql`, left S9 cell 🟡.
- **Promote?:** yes → registry `milestone-emitted-not-deployed` (deployment class,
  applies to every session gated on a shared-services-plane milestone).

## touch-vodka brand spine is clean across all 5 systems (the onboarding check)
- **Symptom/Check:** onboarding requires `brand_id` identical across warehouse,
  RLS, RudderStack source, lead-contract, and CMS client slug.
- **Result:** `touch-vodka` matches in all five (dim_brand, `005_seed_touchvodka.sql`,
  `workspaceConfig.json` source name, `foundation/lead-contract.ts` LEAD_BRANDS,
  `infrastructure/cms/CLAUDE.md`). ✅ No drift.
- **Fleet trap (NOT touch-vodka):** `fat-dog-spirits`/`tikaram-spirits` (dim_brand
  + RudderStack + lead-contract) vs `fat-dog`/`tikaram` (RLS + CMS). My own
  warehouse README claims `brand_id == RLS tenant_id` — true for touch-vodka,
  **false for those two**, so their GA4/ad rows won't line up with CMS/RLS until
  reconciled. → existing registry rule `brand-slug-consistency-across-systems`.

---

## Confirmed working (not mistakes — the runbook paying off)
- **Consent gate:** PostHog + gtag never load pre-consent (`@geniemarketing/foundation`
  `tagLoader`/`initPostHog`); e2e asserts no tracker script before opt-in. This
  CLOSES the live GDPR gap the Vite build had (raw ungated gtag).
- **Local workspace link:** `pnpm.overrides` → `link:` resolves `@geniemarketing/*`
  offline without the GitHub Packages `NODE_AUTH_TOKEN`. Essential for local dev.
- **next/font + asset prune:** self-hosted fonts; `public/` 2.8 MB → 624 KB by
  pruning unused letter-SVG logos; assets-pipeline showed 58% raster savings.
- **Seed-with-fallback:** `lib/strapi.ts` falls back to local seeds so the build
  is never gated on the CMS being up (on-touch migration pattern).

---

## S8 leads/email live-wiring — BLOCKED on infra + creds (2026-06-08)
- **Gate result:** services DOWN + S8 creds absent → could not wire live.
  `n8n.vinny.agency`, `postal.vinny.agency`, `marketing.fatdogspirits.com`,
  `t.vinny.agency` all return `000` (no connection); `crm`/`m.fatdogspirits.com`
  are 404 placeholders. `secrets.prod.enc.env` holds only base
  Strapi/Medusa/Postgres/AWS/Stripe keys — **zero** TWENTY_*/MAUTIC_*/POSTAL_*/
  LEAD_WEBHOOK_SECRET/DOI_SECRET/TURNSTILE_*. Followed registry rule
  `milestone-emitted-not-deployed` (two-part gate → BLOCKED, no false ✅).
- **Did the offline prep:** validated all 4 n8n flows (parse + connection
  integrity + reachability + consent-IF gate + node types via the n8n MCP), and
  confirmed the site handlers (`/api/lead`, `/api/contact`, `lib/email.ts`) match
  `api-lead-contract.md` exactly — no handler drift. Wrote
  `S8-CUTOVER-CHECKLIST.md` (the exact creds/hosts + one-sitting live pass).

## Two real bugs found + fixed in the n8n flows (offline review)
- **doi-confirm:** Mautic segment id was keyed `$env['MAUTIC_SEGMENT_'+brand]` →
  `MAUTIC_SEGMENT_touch-vodka`, an **invalid env-var name** (hyphen) that resolves
  to `undefined` at runtime. Fixed: normalize slug→upper-snake
  (`MAUTIC_SEGMENT_TOUCH_VODKA`). New registry rule
  `env-var-key-no-hyphens-slug-normalize`.
- **lead-capture:** missing the spec §2-step-6 **link-back** node (PATCH Twenty
  `mauticContactId`). Added; flow is now the full 10-step graph. One-off flow fix,
  not a general rule.

## Onboarding status correction (don't mark ✅ on an authored-but-unverified path)
- ONBOARDING had touchvodka **Leads/Email (S8) = ✅**, but the pipeline has never
  delivered end-to-end (services down, flows not activated, no verified Postal
  send). Corrected to **🟡** with a blocked note. Same spirit as
  `milestone-emitted-not-deployed`: authored ≠ verified; a column flips ✅ only
  after an end-to-end test, not after the code/config exists.
