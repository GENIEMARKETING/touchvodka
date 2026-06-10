/**
 * DTC commerce seam — Layer 0 (@geniemarketing/commerce, S4·I).
 *
 * Touch Vodka is BRAND-ONLY today: there is no Medusa sales channel provisioned
 * for it yet (S6/S3 mint the channel + publishable key; S10 builds the DTC
 * PLP/PDP/cart/checkout blocks on top of this seam). So every call here is
 * env-gated and degrades to "no commerce" — a missing `NEXT_PUBLIC_MEDUSA_*`
 * key yields empty/null, never a throw and never a cross-tenant read against
 * another brand's catalog. The moment S6/S3 sets the env, the catalog, search,
 * and PDP pricing light up with no code change.
 *
 * The storefront holds no commerce state: it reads the shared Medusa scoped to
 * its sales channel purely by the publishable key (config.ts contract).
 */
import {
  type Money,
  type StoreProduct,
  createMedusaClient,
  formatPrice,
} from '@geniemarketing/commerce';
import { type SearchResult, createSearchClient } from '@geniemarketing/commerce/search';

/** This brand's Medusa sales channel (set by S6/S3 at onboarding). */
export const SALES_CHANNEL_ID = process.env.MEDUSA_SALES_CHANNEL_ID;

/**
 * Is a Medusa storefront wired for this brand? Keyed on the publishable key,
 * which `resolveConfig` treats as the one non-defaultable value — its absence is
 * "not configured", not a silent fall-through to the shared default tenant.
 */
export function commerceConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY);
}

// Pass the config explicitly. `@geniemarketing/commerce` resolves its URL via a
// DYNAMIC `process.env[key]` read at runtime, which Next can't inline and the
// Amplify WEB_COMPUTE runtime doesn't expose for NEXT_PUBLIC_* — so an
// argument-less client falls back to the shared `commerce.vinny.agency` default.
// Reading the vars STATICALLY here lets Next inline them at build, so the client
// targets this brand's shop-api/channel. (Proven live 2026-06-10; see registry
// `medusa-client-needs-explicit-config-on-amplify`.)
const medusa = createMedusaClient({
  medusaUrl: process.env.NEXT_PUBLIC_MEDUSA_URL,
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
  // Medusa v2 needs a region to price the catalog: without it,
  // `*variants.calculated_price` reads 400 ("Missing required pricing context
  // - region_id"). Read statically here so Next inlines it (the dynamic
  // process.env read inside the package can't be inlined on Amplify WEB_COMPUTE,
  // same reason as medusaUrl/publishableKey above). @geniemarketing/commerce@0.1.1+.
  regionId: process.env.NEXT_PUBLIC_MEDUSA_REGION_ID,
});
const search = createSearchClient();

/** PLP catalog for this channel. Empty (not an error) until commerce is wired. */
export async function getCommerceProducts(limit = 24): Promise<StoreProduct[]> {
  if (!commerceConfigured()) return [];
  try {
    const { products } = await medusa.listProducts({ limit });
    return products;
  } catch (err) {
    console.warn('[commerce] listProducts failed:', err);
    return [];
  }
}

/** One product by handle (slug). `null` until commerce is wired, or on miss. */
export async function getCommerceProduct(handle: string): Promise<StoreProduct | null> {
  if (!commerceConfigured()) return null;
  try {
    return await medusa.getProduct(handle);
  } catch (err) {
    console.warn(`[commerce] getProduct(${handle}) failed:`, err);
    return null;
  }
}

/** Instant/typeahead product search (Meilisearch, search-only key, browser-safe). */
export async function searchProducts(
  query: string,
  opts: { limit?: number; signal?: AbortSignal } = {},
): Promise<SearchResult> {
  return search.search(query, { ...opts, salesChannelId: SALES_CHANNEL_ID });
}

/** Lowest-variant price for a product, or `null` when no variant is priced. */
export function priceOf(product: StoreProduct): Money | null {
  for (const v of product.variants ?? []) {
    const cp = v.calculated_price;
    if (cp) return { amount: cp.calculated_amount ?? cp.amount, currency_code: cp.currency_code };
  }
  return null;
}

export { formatPrice, medusa, search };
export type { Money, SearchResult, StoreProduct };
