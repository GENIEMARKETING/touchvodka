# DTC commerce blocks (S10 · Wave 2·H)

The Touch Vodka direct-to-consumer storefront: **PLP → PDP → cart → multi-step
checkout**, built on the published `@geniemarketing/commerce` client (S4·I) and
the shared Medusa (infrastructure/commerce). Companion modules **age-gate**
(`../age-gate`) and **stockist-locator** (`../stockist-locator`) round out the
S10 scope.

## Files

| File | Role |
|---|---|
| `cart-context.tsx` | `CartProvider` + `useCart` — the only commerce STATE (cart **id** in localStorage; cart re-read from Medusa). |
| `add-to-cart.tsx` | Variant select + qty (`full`, PDP) / quick-add (`compact`, PLP card). |
| `cart-view.tsx` | Shared cart body — lines, qty steppers, promo, totals. Used by drawer + `/cart`. |
| `cart-drawer.tsx` | Slide-over cart, mounted once in `layout.tsx`. Opens on add + from the header. |
| `cart-button.tsx` | Header trigger + live count badge. |
| `checkout.tsx` | Multi-step Details → Delivery → Payment → Done. |
| `stripe-payment.tsx` | Stripe Elements card step, **Stripe.js from CDN** (no npm dep), TEST mode. |

Routes: `src/app/cart/page.tsx`, `src/app/checkout/page.tsx` (both `noindex`).
Wired into `src/app/products/page.tsx` (PLP) + `src/app/products/[slug]/page.tsx` (PDP).

## Two hard rules

1. **No commerce state of our own.** The shared Medusa is the source of truth;
   we keep only the cart id and re-read. Every mutation goes through the published
   client (`lib/commerce.ts#medusa`) — see `cart-context.tsx`.
2. **Graceful degradation = scoping.** With no `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`
   the whole layer is INERT: provider no-ops, cart/buy chrome hides, checkout shows
   "online ordering coming soon → find a stockist". A missing key is "not
   configured", never a silent cross-tenant read (mirrors `lib/commerce.ts`).

## The one seam to fold upstream → S4

The published client lacks **address + shipping-method** methods, so `lib/checkout.ts`
hits the Medusa Store API directly (same `/store/` + `x-publishable-api-key`
convention) as a **temporary shim**. Durable fix: add `setAddresses` /
`listShippingOptions` / `addShippingMethod` to `@geniemarketing/commerce` (S4 owns
the package). Until then the shim is the contract — see HANDOFFS.

## Live verify

`S10-COMMERCE-RUNBOOK.md` (operator). Build/typecheck/Biome are green offline;
the Stripe-TEST order-completes verify needs the live Medusa channel + region +
provider, so it runs after the Wave 2·D operator runbook sets the env.
