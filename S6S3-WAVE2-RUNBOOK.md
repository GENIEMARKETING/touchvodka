# S6/S3 · Wave 2·D — touchvodka backend wiring (operator finish-line)

Wires the **deployed** `touchvodka-next` Amplify app to the live fleet: Strapi
content token, Medusa DTC products, and the ISR webhook. Both gates are met —
`FLEET UP` (2026-06-09 17:25) + `TV-NEXT DEPLOYED` (2026-06-09).

**Why this is a runbook, not done:** every step below is a **prod-secret read or
prod write** (SOPS decrypt, live-app env, box `medusa exec`, Strapi admin) — all
blocked by the auto-mode classifier in the S6/S3 authoring session. The code +
import script + this runbook are authored and verified; the operator executes.

| What | Where | Status |
|---|---|---|
| `STRAPI_API_TOKEN` forwarded in `next.config.ts` `env{}` | this repo (`next.config.ts`) | ✅ done (S6/S3) — typecheck green |
| Medusa DTC import script | `infrastructure/commerce/import/touch-vodka-products.ts` | ✅ authored (S6/S3) |
| Strapi content + token + RLS proof | live Strapi / prod Postgres | ✅ done in part-1 (`infrastructure/cms/onboarding/touch-vodka.md` §7) |
| Steps 1–5 below | box + Amplify + Strapi admin | ⬜ operator |

App: `touchvodka-next` = `d1yhwh9axgn9ty`, branch `next-rebuild`, WEB_COMPUTE.
Box: `agency-core` (98.89.183.98). Strapi: `https://marketing.fatdogspirits.com`.
Medusa: `https://shop-api.fatdogspirits.com` (admin/store; port 9000 is
docker-net internal — verify via the HTTPS route, never host `:9000`).

---

## 1. Strapi content token → Amplify

The scoped read-only `TOUCH_VODKA_API_TOKEN` already exists (minted in part-1) at
`/opt/agency-infra/.touchvodka-token` on `agency-core` (mode 600, not committed).

```bash
# On agency-core:
TOKEN=$(sudo cat /opt/agency-infra/.touchvodka-token)

# Set it on the app (app-level env applies to the next-rebuild branch).
# next.config.ts already forwards STRAPI_API_TOKEN to the WEB_COMPUTE runtime.
aws amplify update-app --app-id d1yhwh9axgn9ty \
  --environment-variables \
    "NEXT_PUBLIC_SITE_KEY=touch-vodka,SITE_KEY=touch-vodka,NEXT_PUBLIC_STRAPI_URL=https://marketing.fatdogspirits.com,STRAPI_API_TOKEN=$TOKEN,REVALIDATION_SECRET=$(aws amplify get-app --app-id d1yhwh9axgn9ty --query 'app.environmentVariables.REVALIDATION_SECRET' --output text),NODE_AUTH_TOKEN=<keep existing>"
```
⚠️ `update-app --environment-variables` **replaces the whole map** — include the
existing keys (`NODE_AUTH_TOKEN`, `REVALIDATION_SECRET`, the two SITE_KEYs,
`NEXT_PUBLIC_STRAPI_URL`) or they're wiped. Read them first with
`aws amplify get-app --app-id d1yhwh9axgn9ty --query app.environmentVariables`.

Then redeploy: `aws amplify start-job --app-id d1yhwh9axgn9ty --branch-name next-rebuild --job-type RELEASE`.

**Verify:** after the build, the Next server logs no longer show the
`lib/strapi.ts` seed-fallback warning; `/products` renders the 5 live products.

## 2. Medusa DTC product import (Stripe TEST)

The `touch-vodka` sales channel was created in Wave 0·A. Import the 5 products:

```bash
# On agency-core, in the Medusa app root (where `npx medusa` resolves):
cd /opt/agency-infra/medusa     # adjust to the live app path
cp <repo>/infrastructure/commerce/import/touch-vodka-products.ts .
sudo docker compose exec medusa npx medusa exec ./touch-vodka-products.ts
# (or run on host if Medusa runs natively)
```
The script is **idempotent** (skips existing handles), creates one `750ml`
variant each at a **placeholder $29.99 USD** (override: `TV_DEFAULT_PRICE_USD=NN`),
links them to the `touch-vodka` channel, ensures a publishable key, and resolves
the USD region. It prints **all 3 ids** the storefront needs:

```
MEDUSA_SALES_CHANNEL_ID            = sc_...
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY = pk_...
NEXT_PUBLIC_MEDUSA_REGION_ID       = reg_...   # cart-context.tsx createCart()
NEXT_PUBLIC_MEDUSA_URL             = https://shop-api.fatdogspirits.com
```
⚠️ If it prints `NEXT_PUBLIC_MEDUSA_REGION_ID = <none …>` or a non-USD region,
the base Medusa seed didn't create a USD region — create one in admin (USD) and
re-run before any cart/checkout test.

**Stripe TEST** is an instance/region concern, not per-product: confirm the
region's payment provider is `pp_stripe_stripe` with a **TEST** secret key
(`sk_test_...` in the box Medusa env / SOPS) before any checkout test.
⚠️ Placeholder pricing — confirm real DTC prices with Vinny before a non-TEST launch.

Record the ids → Amplify (the `NEXT_PUBLIC_*` ones are build-time inlined; no
`next.config.ts` forwarding needed). Add to the env map in step 1 (same
`update-app`, full map):
`NEXT_PUBLIC_MEDUSA_URL`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`, `NEXT_PUBLIC_MEDUSA_REGION_ID`, `MEDUSA_SALES_CHANNEL_ID`.
(Frontend **consumption** of these — PLP/PDP/cart/checkout — is S10/S4's Wave 2
work; setting them now unblocks that.)

**Verify:** `curl -s https://shop-api.fatdogspirits.com/store/products \
-H "x-publishable-api-key: pk_..." | jq '.products[].handle'` → the 5 handles.

## 3. Register the Strapi ISR webhook

In Strapi admin (`marketing.fatdogspirits.com/admin`) → Settings → Webhooks → Create:

- **Name:** `touch-vodka ISR revalidate`
- **URL:** `https://touchvodka.com/api/revalidate?secret=<REVALIDATION_SECRET>`
  (the secret is already set on the Amplify app — read it with
  `aws amplify get-app --app-id d1yhwh9axgn9ty --query 'app.environmentVariables.REVALIDATION_SECRET' --output text`; do **not** hardcode it in any committed file)
- **Events:** Entry `publish` + `unpublish` (optionally `create`/`update`/`delete`).
- ⚠️ Scope to touch-vodka content if Strapi supports per-token webhook filtering;
  otherwise the webhook fires for all tenants — the route is a no-op for paths the
  site doesn't own, so it's safe but noisy.

**Verify:** publish a touch-vodka entry in Strapi → the webhook delivery log shows
**200** `{revalidated:true}`. (Route already proven: `401` without secret → `200`
with it.)

## 4. RLS cross-tenant isolation (already green — re-run optional)

Re-proven on prod Postgres in part-1 with touch-vodka present (15/15,
touch-vodka.md §7). To re-run against prod:

```bash
cd <repo>/infrastructure
PGHOST=<prod-pg-host> PGPORT=5432 make touchvodka-proof   # asserts 3-way mutual isolation
```
Expect: touch-vodka ↔ fat-dog ↔ tikaram mutually blind; writes confined;
deny-by-default holds.

## 5. Final verification (Wave 2·D done)

- [ ] Staging/prod renders **Strapi content** (5 products, 6 stockists, 5
      cocktails, 4 articles) — no seed-fallback warning in server logs.
- [ ] `store/products` returns the **5 Medusa products** for the publishable key.
- [ ] Strapi publish → `/api/revalidate` **200**.
- [ ] `make touchvodka-proof` **green**.

Then: flip the **S6/S3** cell ✅ in `sessions/TOUCHVODKA-GOLIVE.md` §6, append §7,
and reply on the Wave 2·D handoff. **Unblocks S5** (media tier) **+ S10** (commerce
blocks → the `touch-vodka` sales channel + publishable key recorded above).
