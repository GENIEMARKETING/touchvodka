/**
 * Shared Strapi v5 client — Layer 0 (S6). Points at the ONE shared Strapi every
 * Vinny site uses (`marketing.fatdogspirits.com`); content is scoped by this
 * brand's tenant key. Touch Vodka has no database of its own.
 *
 * ⚠️ TENANT-FIELD RECONCILIATION (see LEARNINGS: strapi-tenant-field-site-vs-client).
 * The vinny-platform template + blocks filter shared content by `filters[site]`,
 * but the DEPLOYED multi-tenant CMS (infrastructure/cms) isolates tenants by a
 * `client` enumeration whose slug for this brand is `touch-vodka`. We filter by
 * the REAL field (`client`) here so the rebuild matches the live schema. The
 * platform template's `site` filter needs aligning fleet-wide.
 *
 * ONBOARDING NOTE (S6, on-touch migration): until this brand's content is
 * imported into the shared Strapi, every fetch FALLS BACK to the local seed so
 * the rebuild renders + the production build is never gated on the CMS being up.
 * Remove the fallbacks once content is migrated and verified.
 */
import { PRODUCTS, type Product } from '@/data/products';
import { STOCKISTS, type Stockist } from '@/data/stockists';

// Accept either env name: the CMS doc uses STRAPI_URL, the scaffold uses
// NEXT_PUBLIC_STRAPI_URL. Default to the real deployed host, not the scaffold stub.
const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ??
  process.env.STRAPI_URL ??
  'https://marketing.fatdogspirits.com';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;
/** This brand's CMS tenant slug (the `client` enum value). */
export const SITE_KEY = process.env.SITE_KEY ?? 'touch-vodka';

type StrapiResponse<T> = { data: T; meta?: unknown };

/** Has the shared CMS been wired? (URL + token present and not a localhost stub) */
function strapiConfigured(): boolean {
  return Boolean(STRAPI_URL && STRAPI_TOKEN && !STRAPI_URL.includes('localhost'));
}

async function strapiFetch<T>(
  path: string,
  params: Record<string, string> = {},
): Promise<T | null> {
  if (!strapiConfigured() || !STRAPI_URL) return null;
  const url = new URL(`/api/${path}`, STRAPI_URL);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  try {
    const res = await fetch(url, {
      headers: STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {},
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`Strapi ${res.status} for /api/${path}`);
    const json = (await res.json()) as StrapiResponse<T>;
    return json.data;
  } catch (err) {
    // Never let a CMS hiccup take down a brand page — fall back to the seed.
    console.warn(`[strapi] ${path} failed, using local seed:`, err);
    return null;
  }
}

/** Products for this brand. Falls back to the local seed pre-migration. */
export async function getSiteProducts(client = SITE_KEY): Promise<Product[]> {
  const data = await strapiFetch<Product[]>('products', {
    'filters[client][$eq]': client,
    populate: '*',
  });
  return data && data.length > 0 ? data : PRODUCTS;
}

/** Stockists for this brand. Falls back to the local seed pre-migration. */
export async function getStockists(client = SITE_KEY): Promise<Stockist[]> {
  const data = await strapiFetch<Stockist[]>('stockists', {
    'filters[client][$eq]': client,
  });
  return data && data.length > 0 ? data : STOCKISTS;
}
