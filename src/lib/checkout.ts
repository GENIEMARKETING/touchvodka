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
};

export type Region = { id: string; name: string; currency_code: string };

async function store<T>(
  path: string,
  opts: { method?: string; body?: unknown; params?: Record<string, string> } = {},
): Promise<T> {
  const cfg = resolveConfig();
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

/** Shipping options available for this cart (after an address is set). */
export async function listShippingOptions(cartId: string): Promise<ShippingOption[]> {
  const { shipping_options } = await store<{ shipping_options: ShippingOption[] }>(
    'shipping-options',
    { params: { cart_id: cartId } },
  );
  return shipping_options;
}

/** Choose a shipping method; returns the recalculated cart. */
export async function addShippingMethod(cartId: string, optionId: string): Promise<Cart> {
  const { cart } = await store<{ cart: Cart }>(`carts/${cartId}/shipping-methods`, {
    method: 'POST',
    body: { option_id: optionId },
  });
  return cart;
}
