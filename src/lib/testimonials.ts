/**
 * Testimonials for the homepage wall (T47). Same tenant-scoped access path as
 * products/stockists in `lib/strapi.ts`: fetch from the shared Strapi, filter by
 * the REAL deployed tenant field `client` (the platform block schema names it
 * `site` — see the strapi-tenant-field reconciliation note in lib/strapi.ts),
 * and fall back to the local seed so the page never depends on the CMS being up.
 *
 * Maps the flat Strapi row → the block's `Testimonial` prop shape. Strapi stays
 * READ-ONLY (content-ownership rule).
 */
import type { Testimonial } from '@/components/vinny/testimonial-image-card/testimonial-image-card';
import { TESTIMONIALS } from '@/data/testimonials';
import { SITE_KEY } from '@/lib/strapi';

const STRAPI_URL =
  process.env.NEXT_PUBLIC_STRAPI_URL ??
  process.env.STRAPI_URL ??
  'https://marketing.fatdogspirits.com';
const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN;

type Row = {
  id: number;
  documentId?: string;
  quote?: string;
  authorName?: string;
  authorTitle?: string | null;
  avatarUrl?: string | null;
  rating?: number | null;
};

function mapRow(r: Row): Testimonial | null {
  if (!r.quote || !r.authorName) return null;
  return {
    id: r.documentId ?? String(r.id),
    quote: r.quote,
    author: {
      name: r.authorName,
      title: r.authorTitle ?? undefined,
      avatarUrl: r.avatarUrl ?? undefined,
    },
    ...(typeof r.rating === 'number' ? { rating: r.rating } : {}),
  };
}

/** Testimonials for this brand. Falls back to the local seed pre-migration. */
export async function getTestimonials(client = SITE_KEY): Promise<Testimonial[]> {
  if (!STRAPI_URL || !STRAPI_TOKEN || STRAPI_URL.includes('localhost')) return TESTIMONIALS;
  try {
    const url = new URL('/api/testimonials', STRAPI_URL);
    url.searchParams.set('filters[client][$eq]', client);
    url.searchParams.set('sort', 'order:asc');
    url.searchParams.set('pagination[pageSize]', '50');
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${STRAPI_TOKEN}` },
      next: { revalidate: 300 },
    });
    if (!res.ok) throw new Error(`Strapi ${res.status} for /api/testimonials`);
    const { data } = (await res.json()) as { data: Row[] };
    const mapped = data.map(mapRow).filter((t): t is Testimonial => t !== null);
    return mapped.length > 0 ? mapped : TESTIMONIALS;
  } catch (err) {
    console.warn('[strapi] testimonials failed, using local seed:', err);
    return TESTIMONIALS;
  }
}
