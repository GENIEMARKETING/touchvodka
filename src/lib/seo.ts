/**
 * SEO + i18n seam — Layer 0 (@geniemarketing/seo, S4·I).
 *
 * One source of truth for this brand's metadata, canonical/hreflang URLs, and
 * schema.org JSON-LD. Pages call `pageMetadata()` for their `<head>` and the
 * `*JsonLd` helpers for structured data instead of hand-rolling objects (the
 * Vite build did the latter and drifted). `@geniemarketing/seo` is framework-light;
 * this file is the thin adapter that maps its output onto Next's `Metadata`.
 */
import {
  type Crumb,
  type JsonLd,
  type PageMetaInput,
  type SiteI18n,
  breadcrumbSchema,
  buildMetadata,
  defineI18n,
  jsonLdScript,
  organizationSchema,
  productSchema,
} from '@geniemarketing/seo';
import type { Metadata } from 'next';

/** Absolute origin (no trailing slash) — drives canonical + hreflang + sitemap. */
export const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://touchvodka.com').replace(
  /\/$/,
  '',
);

const BRAND = 'Touch Vodka';
const TWITTER = '@touchvodka';

/** US English / USD only today; the shape is multi-locale-ready for later. */
export const siteI18n: SiteI18n = defineI18n({
  locales: [{ code: 'en-US', label: 'English', currency: 'USD' }],
  defaultLocale: 'en-US',
  origin: SITE_ORIGIN,
});

// Next's OpenGraph.type union doesn't include "product"; map unknowns to website
// (the Product semantics live in the JSON-LD, not og:type).
const NEXT_OG_TYPES = new Set(['website', 'article', 'profile', 'book']);

/**
 * Build a Next `Metadata` for a page from the shared i18n config: canonical,
 * hreflang alternates, OpenGraph + Twitter cards, and robots — consistently.
 */
export function pageMetadata(
  input: Omit<PageMetaInput, 'localeCode'> & { localeCode?: string },
): Metadata {
  const built = buildMetadata(siteI18n, {
    localeCode: siteI18n.defaultLocale,
    twitterSite: TWITTER,
    ...input,
  });
  const ogType = NEXT_OG_TYPES.has(built.openGraph.type) ? built.openGraph.type : 'website';
  return {
    title: built.title,
    description: built.description,
    alternates: built.alternates,
    openGraph: { ...built.openGraph, type: ogType, siteName: BRAND } as Metadata['openGraph'],
    twitter: { ...built.twitter, creator: TWITTER } as Metadata['twitter'],
    ...(built.robots ? { robots: built.robots } : {}),
  };
}

/** Site-wide Organization node for the root layout. */
export function organizationJsonLd(): JsonLd {
  return organizationSchema({
    name: BRAND,
    url: SITE_ORIGIN,
    logo: `${SITE_ORIGIN}/logo/touch-vodka.png`,
    sameAs: ['https://instagram.com/touchvodka', 'https://twitter.com/touchvodka'],
  });
}

export type ProductJsonLdInput = {
  name: string;
  description?: string;
  image: string[];
  path: string;
  brand?: string;
  /** Present only once a Medusa sales channel prices this brand (S6/S3 + S10). */
  price?: number;
  currency?: string;
  availability?: 'InStock' | 'OutOfStock' | 'PreOrder';
  rating?: { value: number; count: number };
};

/**
 * Product JSON-LD. When a real commerce price exists we emit the full
 * `@geniemarketing/seo` Product (with an Offer that wins rich results); brand-only
 * today, we emit a truthful Product WITHOUT an Offer rather than a fake $0 —
 * which would trip Rich Results validation and mislead shoppers.
 */
export function productJsonLd(input: ProductJsonLdInput): JsonLd {
  const url = `${SITE_ORIGIN}${input.path}`;
  if (input.price !== undefined && input.currency) {
    return productSchema({
      name: input.name,
      description: input.description,
      image: input.image,
      url,
      brand: input.brand ?? BRAND,
      price: input.price,
      currency: input.currency,
      availability: input.availability,
      rating: input.rating,
    });
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    image: input.image,
    brand: { '@type': 'Brand', name: input.brand ?? BRAND },
    url,
  };
}

export type RecipeJsonLdInput = {
  name: string;
  description?: string;
  image: string[];
  path: string;
  ingredients: string[];
  /** Ordered method steps (each becomes a HowToStep). */
  instructions: string[];
  category?: string;
  yield?: string;
  keywords?: string[];
};

/**
 * schema.org `Recipe` JSON-LD for a cocktail recipe page. `@geniemarketing/seo`
 * ships Article/Product/Breadcrumb only, so this is hand-rolled here (the same
 * pattern as the brand-only Product fallback above). Drives the Recipe rich
 * result + AEO/AI-crawler answers.
 */
export function recipeJsonLd(input: RecipeJsonLdInput): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    image: input.image,
    url: `${SITE_ORIGIN}${input.path}`,
    author: { '@type': 'Organization', name: BRAND },
    recipeCategory: input.category ?? 'Cocktail',
    recipeCuisine: 'Cocktail',
    ...(input.yield ? { recipeYield: input.yield } : {}),
    ...(input.keywords?.length ? { keywords: input.keywords.join(', ') } : {}),
    recipeIngredient: input.ingredients,
    recipeInstructions: input.instructions.map((step, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      text: step,
    })),
  };
}

/** BreadcrumbList for a deep page. Pass site-relative paths; origin is prefixed. */
export function breadcrumbJsonLd(crumbs: Array<{ name: string; path: string }>): JsonLd {
  return breadcrumbSchema(
    crumbs.map<Crumb>((c) => ({ name: c.name, url: `${SITE_ORIGIN}${c.path}` })),
  );
}

export { jsonLdScript };
export type { JsonLd };
