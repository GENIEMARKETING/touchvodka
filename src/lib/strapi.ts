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

// ─────────────────────────────────────────────────────────────────────────────
// Editable content types (S6 CMS wiring, 2026-06-13). Same single tenant-scoped
// access path as products/stockists above: filter by `client`, `populate=*` for
// media, and return null when the CMS isn't wired/empty so each caller falls back
// to its existing in-repo source (MDX / hardcoded copy) — the build is never
// gated on the CMS. Strapi stays READ-ONLY here (design-lane content-ownership
// rule: blogs/pages/config are edited only in Strapi; nothing writes back).
// ─────────────────────────────────────────────────────────────────────────────

/** A blog article as returned by Strapi (shape-tolerant; mapped in lib/blog). */
export type StrapiArticle = Record<string, unknown>;

/** Articles (blog) for this brand. null → CMS not wired/empty (caller falls back to MDX). */
export async function getArticles(client = SITE_KEY): Promise<StrapiArticle[] | null> {
  const data = await strapiFetch<StrapiArticle[]>('articles', {
    'filters[client][$eq]': client,
    populate: '*',
    'pagination[pageSize]': '100',
  });
  return data && data.length > 0 ? data : null;
}

/** Editable marketing-copy page (slug-keyed). Mirrors the `page` content type. */
export type StrapiPage = {
  slug?: string;
  title?: string;
  eyebrow?: string;
  lead?: string;
  body?: string;
  sections?: Record<string, unknown> | null;
  seoTitle?: string;
  seoDescription?: string;
};

/** One page by slug for this brand. null → not in CMS (caller falls back to hardcoded copy). */
export async function getPage(slug: string, client = SITE_KEY): Promise<StrapiPage | null> {
  const data = await strapiFetch<StrapiPage[]>('pages', {
    'filters[client][$eq]': client,
    'filters[slug][$eq]': slug,
    populate: '*',
  });
  return data && data.length > 0 ? (data[0] ?? null) : null;
}

/** Per-brand site config (logo / socials / footer). Mirrors the `site-config` type. */
export type StrapiSiteConfig = Record<string, unknown>;

/** Site config for this brand. null → not in CMS (caller falls back to hardcoded defaults). */
export async function getSiteConfig(client = SITE_KEY): Promise<StrapiSiteConfig | null> {
  const data = await strapiFetch<StrapiSiteConfig[]>('site-configs', {
    'filters[client][$eq]': client,
    populate: '*',
  });
  return data && data.length > 0 ? (data[0] ?? null) : null;
}
