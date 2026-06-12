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
  type FaqItem,
  type JsonLd,
  type PageMetaInput,
  type SiteI18n,
  brandSchema,
  breadcrumbSchema,
  buildMetadata,
  defineI18n,
  faqSchema,
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

export const BRAND = 'Touch Vodka';
const TWITTER = '@touchvodka';

/** One-line brand description, reused by the entity schema + the llms.txt digest. */
export const BRAND_SUMMARY =
  'Touch Vodka is a premium craft vodka brand — small-batch spirits, distilled ten times (10X) from winter-wheat grain and blended with mineral-rich spring water, with a brutalist, industrial-elegant design. The core range is bottled at 80 proof (40% ABV).';

export const BRAND_SLOGAN = 'Industrial elegance in every bottle.';

/** Authoritative profiles for entity resolution (socials today; add Wikidata if minted). */
export const BRAND_SAMEAS = [
  'https://instagram.com/touchvodka',
  'https://twitter.com/touchvodka',
];

/**
 * Canonical brand FAQ — the SINGLE source for both the visible `/` FAQ section and
 * the FAQPage JSON-LD, so on-page copy and structured data can never drift (Google
 * requires them to match). Answers are grounded in the brand facts on the site.
 */
export const BRAND_FAQ: FaqItem[] = [
  {
    question: 'What is Touch Vodka?',
    answer:
      'Touch Vodka is a premium craft vodka brand. Its spirits are distilled ten times (10X) from winter-wheat grain, charcoal-filtered, and blended with mineral-rich spring water. The core range is bottled at 80 proof (40% ABV).',
  },
  {
    question: 'What expressions does Touch Vodka offer?',
    answer:
      'Five: Touch Artisan (traditional distilled), Touch One (pure premium), Touch Orange and Touch Key Lime (citrus-infused), and Touch Ruby (berry-infused).',
  },
  {
    question: 'What proof is Touch Vodka?',
    answer: 'Every expression in the core range is 80 proof — 40% alcohol by volume.',
  },
  {
    question: 'Where can I buy Touch Vodka?',
    answer:
      'Browse the full collection at touchvodka.com/products, use the locator at touchvodka.com/find-us to find a nearby retailer, or order through the online store.',
  },
  {
    question: 'Do I need to be 21 to use this site?',
    answer:
      'Yes. Touch Vodka is a regulated spirits brand and the site is intended for visitors of legal drinking age (21+ in the United States). Please enjoy responsibly.',
  },
];

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

/** Site-wide Organization node for the root layout (T46: enriched for AEO entity resolution). */
export function organizationJsonLd(): JsonLd {
  return organizationSchema({
    name: BRAND,
    url: SITE_ORIGIN,
    id: `${SITE_ORIGIN}/#organization`,
    description: BRAND_SUMMARY,
    slogan: BRAND_SLOGAN,
    logo: `${SITE_ORIGIN}/logo/touch-vodka.png`,
    brand: BRAND,
    sameAs: BRAND_SAMEAS,
  });
}

/** Site-wide Brand entity node — the AEO companion to Organization (T46). */
export function brandJsonLd(): JsonLd {
  return brandSchema({
    name: BRAND,
    id: `${SITE_ORIGIN}/#brand`,
    url: SITE_ORIGIN,
    logo: `${SITE_ORIGIN}/logo/touch-vodka.png`,
    description: BRAND_SUMMARY,
    slogan: BRAND_SLOGAN,
    sameAs: BRAND_SAMEAS,
  });
}

/** FAQPage JSON-LD (T46). Defaults to the canonical `BRAND_FAQ` so it mirrors the page. */
export function faqJsonLd(items: FaqItem[] = BRAND_FAQ): JsonLd {
  return faqSchema(items);
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

/** BreadcrumbList for a deep page. Pass site-relative paths; origin is prefixed. */
export function breadcrumbJsonLd(crumbs: Array<{ name: string; path: string }>): JsonLd {
  return breadcrumbSchema(
    crumbs.map<Crumb>((c) => ({ name: c.name, url: `${SITE_ORIGIN}${c.path}` })),
  );
}

export { jsonLdScript };
export type { JsonLd, FaqItem };
