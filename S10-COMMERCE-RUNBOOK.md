# S10 — Touch Vodka DTC commerce: operator verify runbook (Wave 2·H)

**Prereq gates:** `FLEET UP` ✅ + `TV-NEXT DEPLOYED` ✅ + the **Wave 2·D operator
runbook** (`S6S3-WAVE2-RUNBOOK.md`) — which imports the 5 DTC products into the
`touch-vodka` Medusa sales channel and prints `MEDUSA_SALES_CHANNEL_ID` +
`NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`. S10 wires the storefront to those.

## What S10 shipped (code, build-verified offline)
- **Modules:** age-gate (21+, mounted in `layout.tsx`) + stockist-locator (mounted
  on `/find-us`) — both already live in the rebuild.
- **DTC blocks:** PLP (`/products`) + PDP (`/products/[slug]`) now show Medusa
  price + add-to-cart; cart drawer + `/cart`; multi-step `/checkout`. All inert
  until the publishable key is set (brand-only fallback).
- `pnpm typecheck` + `biome check` + `pnpm build` (28 pages) all green.

## 1 · Set the Amplify env (app `d1yhwh9axgn9ty`, branch `next-rebuild`)
Read-merge the existing env map first (`update-app` REPLACES). Add:

| Var | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_MEDUSA_URL` | `https://shop-api.fatdogspirits.com` | shared Medusa |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | `pk_…` (from the W2·D import) | scopes to the channel |
| `MEDUSA_SALES_CHANNEL_ID` | (from the W2·D import) | already forwarded in `next.config.ts` env{} |
| `NEXT_PUBLIC_MEDUSA_REGION_ID` | the store's USD region id (optional) | `GET /store/regions` if unsure |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_…` | TEST publishable key; pairs with the region's `sk_test_…` |

`NEXT_PUBLIC_*` are build-inlined → **redeploy** the branch after setting them.

## 2 · Confirm the Medusa region is checkout-ready (the gating prereq)
The cart can only **complete** with a region that has (a) a **shipping option**
and (b) a **payment provider** enabled. On the box Medusa admin for the region the
`touch-vodka` channel sells into:
- enable **Stripe** (`pp_stripe_stripe`) with a **TEST `sk_test_…`** secret — OR
  leave the **manual/system** provider enabled for a no-card TEST order;
- ensure at least one **shipping option** exists for the region.

> ⚠️ Known seam: the storefront's address + shipping-method calls go through the
> `lib/checkout.ts` shim (the published client lacks those methods — S4 folds them
> upstream, see HANDOFFS). The shim already matches the client's Store-API
> convention, so no app change is needed — only the region config above.

## 3 · Verify (the S10 done-criterion)
1. **Age-gate:** first visit → 21+ prompt; "under 21" → responsibility.org; accept
   persists (no re-prompt).
2. **Stockist locator:** `/find-us` renders the US map + list; "Use my location"
   re-sorts by distance.
3. **PLP/PDP:** `/products` shows price + "Add"; PDP shows the buy box + price
   (no seed-fallback warning in the server log).
4. **Cart:** add → drawer opens with the line; qty ±, remove, and a promo code all
   recalculate; badge counts.
5. **Checkout (Stripe TEST):** `/checkout` → Details (email+address) → Delivery
   (pick shipping) → Payment → card `4242 4242 4242 4242`, any future expiry/CVC →
   **Place order** → order-confirmation with a `#display_id`; cart clears. Confirm
   the order + a `pi_…test` payment exist in Medusa admin / Stripe TEST dashboard.

**Done =** all five green → flip the **S10** cell ✅ in `TOUCHVODKA-GOLIVE.md` §6,
log §7, and tell S1 to promote the `site_touchvodka → service_medusa` (DTC) edge.
