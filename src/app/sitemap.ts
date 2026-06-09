import { PRODUCTS } from '@/data/products';
import { getPostSlugs } from '@/lib/blog';
import type { MetadataRoute } from 'next';

const BASE = 'https://touchvodka.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    '',
    '/products',
    '/cocktails',
    '/our-story',
    '/blog',
    '/find-us',
    '/privacy',
    '/terms',
    '/cookie-policy',
  ];
  const products = PRODUCTS.map((p) => `/products/${p.slug}`);
  const posts = (await getPostSlugs()).map((s) => `/blog/${s}`);
  return [...staticRoutes, ...products, ...posts].map((path) => ({
    url: `${BASE}${path}`,
    lastModified: new Date('2026-06-07'),
  }));
}
