/**
 * Checkout shim — the slices of the Medusa v2 Store API the published
 * `@geniemarketing/commerce` client does NOT expose yet: addresses, shipping
 * options, and shipping-method selection.
 *
 * ⚠️ TEMPORARY SEAM (S10). The cart line-item / promo / complete operations all
 * go through the published `medusa` client (lib/commerce.ts). These three calls
 * don't have a client method, so we hit the Store API directly here — reusing the
 * SAME endpoint + publishable-key header convention as the client
 * (`/store/…` + `x-publishable-api-key`, see commerce/dist/medusa.js). This is a
 * stop-gap so the DTC checkout can actually complete a TEST order; the durable
 * fix is to fold `setAddresses` / `listShippingOptions` / `addShippingMethod`
 * into `@geniemarketing/commerce` (S4 owns the package — see HANDOFFS).
 *
 * Like the client, every call is scoped to this brand's sales channel purely by
 * the publishable key — there is no cross-tenant surface here.
 */
import { type Cart, resolveConfig } from '@geniemarketing/commerce';

// Read NEXT_PUBLIC_* STATICALLY so Next inlines them at build. The package's
// `resolveConfig()` reads them DYNAMICALLY (`process.env[key]`), which Next can't
// inline and the Amplify WEB_COMPUTE browser runtime doesn't expose — so a bare
// `resolveConfig()` falls back to the shared `commerce.vinny.agency` default with
// no publishable key, and every shim call "Failed to fetch". Same trap as
// lib/commerce.ts (registry: medusa-client-needs-explicit-config-on-amplify).
const STORE_CONFIG = {
  medusaUrl: process.env.NEXT_PUBLIC_MEDUSA_URL,
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
} as const;

export type Address = {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  province?: string;
  postal_code: string;
  country_code: string;
  phone?: string;
};

export type ShippingOption = {
  id: string;
  name: string;
  amount: number;
  /** Some options price per-cart at calculation time. */
  price_type?: 'flat' | 'calculated';
  provider_id?: string;
};

export type Region = { id: string; name: string; currency_code: string };

/**
 * Touch Vodka ships DTC within Florida only. The authoritative gate is the
 * Medusa service zone (geo-restricted to US/FL → no shipping option resolves for
 * a non-FL address), but we also validate up front for a clear message instead of
 * an empty delivery step. Accepts "FL" or "Florida" in any case.
 */
export const SHIPS_TO_LABEL = 'Florida';
export function isShippableProvince(province?: string | null): boolean {
  const p = (province ?? '').trim().toLowerCase();
  return p === 'fl' || p === 'florida' || p === 'us-fl';
}

/**
 * Medusa matches the service zone on the ISO 3166-2 subdivision code `us-fl`
 * (verified against the live zone) — NOT "FL" / "Florida". So normalize the
 * shopper's free-text state to that code before stamping the address, or the FL
 * cart resolves zero shipping options and dead-ends.
 */
export function provinceCode(province?: string | null): string {
  if (isShippableProvince(province)) return 'us-fl';
  return (province ?? '').trim().toLowerCase();
}

async function store<T>(
  path: string,
  opts: { method?: string; body?: unknown; params?: Record<string, string> } = {},
): Promise<T> {
  const cfg = resolveConfig(STORE_CONFIG);
  const url = new URL(`/store/${path}`, cfg.medusaUrl);
  for (const [k, v] of Object.entries(opts.params ?? {})) url.searchParams.set(k, v);
  const headers: Record<string, string> = {};
  if (cfg.publishableKey) headers['x-publishable-api-key'] = cfg.publishableKey;
  if (opts.body !== undefined) headers['content-type'] = 'application/json';
  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    headers,
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Medusa ${res.status} ${opts.method ?? 'GET'} /store/${path}`);
  return (await res.json()) as T;
}

/** Regions enabled on the store — used to resolve a region id for cart creation. */
export async function listRegions(): Promise<Region[]> {
  const { regions } = await store<{ regions: Region[] }>('regions');
  return regions;
}

/** Stamp the shipping (and matching billing) address on the cart. */
export async function setAddresses(
  cartId: string,
  shipping: Address,
  billing?: Address,
): Promise<Cart> {
  const { cart } = await store<{ cart: Cart }>(`carts/${cartId}`, {
    method: 'POST',
    body: { shipping_address: shipping, billing_address: billing ?? shipping },
  });
  return cart;
}

type RawOption = {
  id: string;
  name: string;
  amount?: number | null;
  price_type?: 'flat' | 'calculated';
  provider_id?: string;
  calculated_price?: { calculated_amount?: number | null } | null;
};

/**
 * Resolve a calculated (carrier-priced, e.g. Shippo) option's real amount for
 * this cart. Flat options already carry `amount`; calculated ones must be priced
 * per-cart via the dedicated endpoint — which is why they showed as $0 / never
 * appeared before. Returns null if it can't be priced (Shippo unreachable etc.).
 */
async function calculatedAmount(optionId: string, cartId: string): Promise<number | null> {
  try {
    const { shipping_option } = await store<{ shipping_option: RawOption }>(
      `shipping-options/${optionId}/calculate`,
      { method: 'POST', body: { cart_id: cartId, data: {} } },
    );
    return shipping_option.calculated_price?.calculated_amount ?? null;
  } catch {
    return null;
  }
}

/**
 * Shipping options for this cart (after an address is set), priced and ready to
 * display. Touch Vodka shows the **live Shippo rate only** — the flat fallback is
 * filtered out of the customer view. If no calculated rate resolves (Shippo down
 * / misconfig) we fall back to whatever options exist so checkout never dead-ends.
 */
export async function listShippingOptions(cartId: string): Promise<ShippingOption[]> {
  const { shipping_options } = await store<{ shipping_options: RawOption[] }>('shipping-options', {
    params: { cart_id: cartId },
  });

  const priced: ShippingOption[] = await Promise.all(
    shipping_options.map(async (o) => {
      let amount = o.amount ?? o.calculated_price?.calculated_amount ?? 0;
      if (o.price_type === 'calculated' && !amount) {
        amount = (await calculatedAmount(o.id, cartId)) ?? 0;
      }
      return {
        id: o.id,
        name: o.name,
        amount,
        price_type: o.price_type,
        provider_id: o.provider_id,
      };
    }),
  );

  // Shippo-only customer view: prefer carrier-calculated rates, drop the flat
  // manual fallback. Keep everything if nothing calculable so we never dead-end.
  const live = priced.filter((o) => o.price_type === 'calculated' && o.amount > 0);
  return live.length > 0 ? live : priced;
}

/** Choose a shipping method; returns the recalculated cart. */
export async function addShippingMethod(cartId: string, optionId: string): Promise<Cart> {
  const { cart } = await store<{ cart: Cart }>(`carts/${cartId}/shipping-methods`, {
    method: 'POST',
    body: { option_id: optionId },
  });
  return cart;
}
