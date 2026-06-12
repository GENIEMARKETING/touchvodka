/**
 * `/llms.txt` (T46, AEO) — a markdown digest of the brand + key pages for LLMs
 * and AI answer engines, per the llmstxt.org convention. Built from the same
 * product catalogue + brand constants the rest of the site uses, so it can't
 * drift. `force-static` prerenders it at build time as a plain text asset.
 */
import { PRODUCTS } from '@/data/products';
import { BRAND, BRAND_SUMMARY, SITE_ORIGIN } from '@/lib/seo';
import { type LlmsSection, llmsTxt } from '@geniemarketing/seo';

export const dynamic = 'force-static';

export function GET(): Response {
  const sections: LlmsSection[] = [
    {
      title: 'Products',
      links: PRODUCTS.map((p) => ({
        title: p.name,
        url: `/products/${p.slug}`,
        description: `${p.category} · ${p.proof}`,
      })),
    },
    {
      title: 'Cocktails & Recipes',
      links: [
        {
          title: 'Signature cocktails',
          url: '/cocktails',
          description: 'How to mix Touch Vodka — recipes and serves',
        },
      ],
    },
    {
      title: 'Company',
      links: [
        {
          title: 'Our Story',
          url: '/our-story',
          description: 'Brand story, 10X distillation process, and provenance',
        },
        { title: 'Where to Buy', url: '/find-us', description: 'Retailer and store locator' },
        { title: 'Journal', url: '/blog', description: 'News, cocktail guides, and tasting notes' },
      ],
    },
    {
      title: 'Optional',
      links: [
        { title: 'Privacy Policy', url: '/privacy' },
        { title: 'Terms', url: '/terms' },
        { title: 'Cookie Policy', url: '/cookie-policy' },
      ],
    },
  ];

  const body = llmsTxt(
    {
      title: BRAND,
      summary: BRAND_SUMMARY,
      details: 'Intended for legal-drinking-age (21+) audiences. Please enjoy responsibly.',
      sections,
    },
    { origin: SITE_ORIGIN },
  );

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600, must-revalidate',
    },
  });
}
