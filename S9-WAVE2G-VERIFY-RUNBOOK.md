# S9 · Wave 2·G — analytics warehouse verify (operator runbook)

**Goal:** prove the consented-pageview path end-to-end for touchvodka:
`consented pageview → raw.rudder_events → mart → Metabase`, **and** that a
**pre-consent** visit yields **0 rows**.

**Gates (all met / one pending):**
- ✅ `warehouse up` (2026-06-09) — ClickHouse + Metabase + RudderStack ingestion + MinIO staging.
- ✅ `TV-NEXT DEPLOYED` — `touchvodka.com` on WEB_COMPUTE app `d1yhwh9axgn9ty` (branch `next-rebuild`).
- ✅ S7 consent live — `<ConsentBanner>` + the consent-gated `tagLoader` in `foundation@0.2.x`.
- ⏳ **PENDING — publish `@geniemarketing/foundation@0.2.1`** to GH Packages. The site now
  imports `initRudderStack` (the CDP client), which ships in **0.2.1**; the registry has
  only **0.2.0**, so `pnpm install` + `tsc`/build fail with TS2305 until 0.2.1 is published.
  See `sessions/HANDOFFS.md` → "publish `@geniemarketing/foundation@0.2.1`". **Do step 0 first.**

What's already done in code (this S9 pass, branch `next-rebuild`):
- `src/components/Analytics.tsx` → `initRudderStack({ writeKey, dataPlaneUrl })`, consent-gated
  (`analytics` category), reading `NEXT_PUBLIC_RUDDERSTACK_WRITE_KEY` / `NEXT_PUBLIC_RUDDERSTACK_DATAPLANE`.
- `next.config.ts` `env{}` forwards both vars (`amplify-nextconfig-env` rule).
- `.env.example` documents them; `package.json` floors foundation at `^0.2.1`.
- The RudderStack **source `touch-vodka`** (writeKey `WRITE_KEY_TOUCH`) is **already rendered
  live** by S6 — nothing to create.

The `dim_brand` external-id patch (`agency-ops/analytics/onboarding/touch-vodka.dim_brand.sql`)
stays **STAGED** — it feeds the *Airbyte* sources (deferred, ids pending Vinny) and is **not**
on the CDP path.

---

## Step 0 — publish + install foundation 0.2.1 (gate)
Release owner publishes `@geniemarketing/foundation@0.2.1` (already on `main`, commit `9bda79c`):
```bash
# in the vinny-platform main checkout, auth via ~/.npmrc NODE_AUTH_TOKEN
pnpm --filter @geniemarketing/foundation build && \
  cd packages/foundation && npm publish
npm view @geniemarketing/foundation versions   # must list 0.2.1
```
Then, in this repo:
```bash
cd projects/touchvodka-next
pnpm install                 # picks up 0.2.1 per package.json ^0.2.1
pnpm typecheck && pnpm build # both green (TS2305 gone)
```

## Step 1 — pull WRITE_KEY_TOUCH from SOPS
```bash
# on the machine with the age key
sops -d security/secrets.prod.enc.env | grep WRITE_KEY_TOUCH
# → WRITE_KEY_TOUCH=<value>
```

## Step 2 — set the Amplify env + redeploy
⚠️ `update-app --environment-variables` **REPLACES** the whole map — read-merge first.
```bash
APP=d1yhwh9axgn9ty
# read the current map, add the two CDP vars, write it back:
aws amplify get-app --app-id "$APP" --query 'app.environmentVariables' --output json > /tmp/env.json
# merge in:
#   NEXT_PUBLIC_RUDDERSTACK_WRITE_KEY=<WRITE_KEY_TOUCH>
#   NEXT_PUBLIC_RUDDERSTACK_DATAPLANE=https://events.fatdogspirits.com
aws amplify update-app --app-id "$APP" --environment-variables file:///tmp/merged-env.json
aws amplify start-job --app-id "$APP" --branch-name next-rebuild --job-type RELEASE
```

## Step 3 — emit a CONSENTED pageview
1. Open `https://touchvodka.com` in a clean/incognito session.
2. **Accept analytics** in the consent banner (necessary+analytics at minimum).
3. Reload once so the SDK loads and fires `page()` after consent.
4. In devtools → Network, confirm `rudder-analytics.min.js` loads from
   `events.fatdogspirits.com` **only after** opt-in, and a request to `…/v1/page` (or batch) is sent.

## Step 4 — confirm it landed in `raw.rudder_events`
On `agency-analytics` (or via the ClickHouse client):
```sql
SELECT event_type, brand_id, source_id, page_path, consent_categories, timestamp
FROM raw.rudder_events
WHERE brand_id = 'touch-vodka'
  AND timestamp > now() - INTERVAL 15 MINUTE
ORDER BY timestamp DESC
LIMIT 20;
```
**Expect:** ≥1 row, `event_type='page'`, `brand_id='touch-vodka'`,
`consent_categories` contains `analytics`, `ip_prefix` anonymized (last octet `.0`).
> Note: ClickHouse is a **warehouse** destination — rudder stages to MinIO then bulk-loads,
> so allow a short batch delay (not a streaming INSERT). If empty after ~5 min, check
> `rudder-backend` logs + MinIO `rudder-warehouse-staging`.

## Step 5 — roll up to the marts
```bash
make warehouse-refresh        # populates mart.daily_traffic / funnel_daily / unified_daily
```
```sql
SELECT date, brand_id, channel, sessions, pageviews
FROM mart.daily_traffic
WHERE brand_id = 'touch-vodka' AND date = today();

SELECT * FROM mart.unified_daily
WHERE brand_id = 'touch-vodka' AND date = today();
```
**Expect:** a `touch-vodka` row with `pageviews ≥ 1`.

## Step 6 — Metabase dashboard
Open `https://analytics.fatdogspirits.com` → **Unified Cross-Channel** dashboard. The brand
filter is sourced from `dim_brand WHERE is_active=1`, so **Touch Vodka** appears automatically;
select it and confirm the traffic card reflects the pageview.

## Step 7 — PRE-CONSENT = 0 rows (the privacy assertion)
1. Fresh incognito session → open `https://touchvodka.com` → **do NOT accept** (or decline analytics).
2. Browse a couple of pages. Confirm in Network that `rudder-analytics.min.js` **never loads**.
3. Query:
```sql
SELECT count() AS pre_consent_rows
FROM raw.rudder_events
WHERE brand_id = 'touch-vodka'
  AND timestamp > now() - INTERVAL 15 MINUTE
  AND NOT has(consent_categories, 'analytics');
```
**Expect: `pre_consent_rows = 0`.** Two independent gates enforce this: the client tag-loader
(SDK never loads pre-consent) and the server `consentGuard.js` (drops any event whose
`allowedConsentIds` lacks `analytics`). If non-zero → a gate regressed; do not flip the cell.

---

## Done =
Steps 4–7 all pass → flip the **S9** cell ✅ in `sessions/TOUCHVODKA-GOLIVE.md` §6, log §7,
and update `agency-ops/analytics/S9-STATUS.md`.
