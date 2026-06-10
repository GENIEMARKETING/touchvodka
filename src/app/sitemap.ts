import { PRODUCTS } from '@/data/products';
import { getPostSlugs } from '@/lib/blog';
import { siteI18n } from '@/lib/seo';
import { type SitemapRoute, buildSitemap } from '@geniemarketing/seo';
import type { MetadataRoute } from 'next';

const LAST_MODIFIED = new Date('2026-06-09');

// SEO source of truth via @geniemarketing/seo: one i18n config drives canonical
// origin + (future) hreflang alternates, so the sitemap can't drift from the
// metadata builders in lib/seo.ts.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: SitemapRoute[] = [
    { path: '/', changeFrequency: 'weekly', priority: 1 },
    { path: '/products', changeFrequency: 'weekly', priority: 0.9 },
    { path: '/cocktails', changeFrequency: 'monthly', priority: 0.7 },
    { path: '/our-story', changeFrequency: 'yearly', priority: 0.6 },
    { path: '/blog', changeFrequency: 'weekly', priority: 0.7 },
    { path: '/find-us', changeFrequency: 'monthly', priority: 0.6 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.2 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.2 },
    { path: '/cookie-policy', changeFrequency: 'yearly', priority: 0.2 },
  ];
  const products: SitemapRoute[] = PRODUCTS.map((p) => ({
    path: `/products/${p.slug}`,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));
  const posts: SitemapRoute[] = (await getPostSlugs()).map((s) => ({
    path: `/blog/${s}`,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return buildSitemap(siteI18n, [...staticRoutes, ...products, ...posts]).map((e) => ({
    ...e,
    lastModified: e.lastModified ?? LAST_MODIFIED,
  }));
}
