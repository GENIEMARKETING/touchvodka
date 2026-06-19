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
import { COCKTAILS, type Cocktail } from '@/data/cocktails';
import { CITIES, type CityEntry, type ExploreEntry, OCCASIONS, SEASONS } from '@/data/explore';
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

// ─────────────────────────────────────────────────────────────────────────────
// Cocktails + explore taxonomy (redesign migration). These NEW content types
// (`cocktail` / `city` / `season` / `occasion`) are authored on the box (see
// infrastructure/cms/cocktails/) — the four `api/cocktails|cities|seasons|
// occasions` endpoints 404 until then, so every reader returns null and the data
// layer falls back to the in-repo seed (src/data/cocktails.ts + explore.ts).
// Strapi v5 returns FLAT attributes (no `.attributes` nesting); we map
// defensively so a partially-populated entry still renders. Media is returned as
// `{ url }` (absolute CDN/Strapi URL) — passed through unchanged.
// ─────────────────────────────────────────────────────────────────────────────

type Raw = Record<string, unknown>;
const str = (v: unknown): string => (typeof v === 'string' ? v : '');
const arr = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => str(x)).filter(Boolean) : [];
/** Strapi media → URL string. Accepts `{url}`, `{data:{url}}`, or a bare string. */
function mediaUrlOf(v: unknown): string {
  if (typeof v === 'string') return v;
  if (v && typeof v === 'object') {
    const o = v as Raw;
    if (typeof o.url === 'string') return o.url;
    const d = o.data as Raw | undefined;
    if (d && typeof d.url === 'string') return d.url;
  }
  return '';
}

/** Cocktails (≥50) for this brand. null → type not deployed/empty (caller falls back to the seed). */
export async function getStrapiCocktails(client = SITE_KEY): Promise<Cocktail[] | null> {
  const data = await strapiFetch<Raw[]>('cocktails', {
    'filters[client][$eq]': client,
    populate: '*',
    'pagination[pageSize]': '100',
    sort: 'name:asc',
  });
  if (!data || data.length === 0) return null;
  return data.map((c, i) => ({
    id: str(c.cocktailId) || str(c.id) || `CK-${i + 1}`,
    slug: str(c.slug),
    name: str(c.name),
    tagline: str(c.tagline),
    description: str(c.description),
    image: mediaUrlOf(c.image) || str(c.imageUrl),
    ingredients: arr(c.ingredients),
    preparation: str(c.preparation) || str(c.method),
    garnish: str(c.garnish),
    glass: str(c.glass),
    serves: str(c.serves),
    color: str(c.color) || '#0055FF',
    baseSpirit: str(c.baseSpirit),
    productIds: arr(c.productIds),
    season: (str(c.season) || 'Summer') as Cocktail['season'],
    event: (str(c.event) || str(c.occasion) || 'Party') as Cocktail['event'],
  }));
}

function mapExplore(c: Raw): ExploreEntry {
  return {
    slug: str(c.slug),
    name: str(c.name),
    kicker: str(c.kicker),
    blurb: str(c.blurb),
    signatureSlug: str(c.signatureSlug),
    image: mediaUrlOf(c.image) || str(c.imageUrl) || undefined,
  };
}

/** Cities (6) for this brand. null → type not deployed/empty (caller falls back to the seed). */
export async function getStrapiCities(client = SITE_KEY): Promise<CityEntry[] | null> {
  const data = await strapiFetch<Raw[]>('cities', {
    'filters[client][$eq]': client,
    populate: '*',
    'pagination[pageSize]': '50',
  });
  if (!data || data.length === 0) return null;
  return data.map((c) => ({
    ...mapExplore(c),
    state: str(c.state),
    whyHere: Array.isArray(c.whyHere)
      ? (c.whyHere as Raw[]).map((w) => ({ title: str(w.title), body: str(w.body) }))
      : [],
  }));
}

/** Seasons (4) for this brand. null → type not deployed/empty (caller falls back to the seed). */
export async function getStrapiSeasons(client = SITE_KEY): Promise<ExploreEntry[] | null> {
  const data = await strapiFetch<Raw[]>('seasons', {
    'filters[client][$eq]': client,
    populate: '*',
    'pagination[pageSize]': '50',
  });
  return data && data.length > 0 ? data.map(mapExplore) : null;
}

/** Occasions (6) for this brand. null → type not deployed/empty (caller falls back to the seed). */
export async function getStrapiOccasions(client = SITE_KEY): Promise<ExploreEntry[] | null> {
  const data = await strapiFetch<Raw[]>('occasions', {
    'filters[client][$eq]': client,
    populate: '*',
    'pagination[pageSize]': '50',
  });
  return data && data.length > 0 ? data.map(mapExplore) : null;
}

// ── Strapi-first loaders ─────────────────────────────────────────────────────
// One-call accessors for server components: return live Strapi content when the
// type is deployed, else the in-repo seed. Call these from server pages (NOT
// client components — they read the server-only STRAPI_API_TOKEN). Until the four
// content types are deployed + imported (infrastructure/cms/cocktails/), every
// one of these returns the seed, so the preview is byte-identical to today and
// the migration is a zero-code-change flip on the box.

export async function loadCocktails(): Promise<Cocktail[]> {
  return (await getStrapiCocktails()) ?? COCKTAILS;
}
export async function loadCities(): Promise<CityEntry[]> {
  return (await getStrapiCities()) ?? CITIES;
}
export async function loadSeasons(): Promise<ExploreEntry[]> {
  return (await getStrapiSeasons()) ?? SEASONS;
}
export async function loadOccasions(): Promise<ExploreEntry[]> {
  return (await getStrapiOccasions()) ?? OCCASIONS;
}
