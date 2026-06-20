/**
 * Reviews seam — talks to the shared Medusa `product_review` module
 * (Phase 7: /store/reviews + /store/reviews/summary, signed-in POST).
 *
 * Reads (summary/list) use the public publishable key and are safe server-side.
 * `submitReview` is client-only: it attaches the signed-in customer's JWT (held
 * by the shared `medusa` client after login) — the backend rejects an
 * unauthenticated POST with 401, so a logged-out visitor can never post.
 *
 * Env-gated like lib/commerce: with no NEXT_PUBLIC_MEDUSA_* it degrades to empty
 * (never throws), so the PDP keeps rendering its brand-only fallback.
 */
import { medusa } from '@/lib/commerce';

const BASE = process.env.NEXT_PUBLIC_MEDUSA_URL;
const PK = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

export type Review = {
  id: string;
  product_id: string;
  rating: number;
  title?: string;
  body: string;
  author_name: string;
  created_at: string;
  verified_purchase: boolean;
};

export type ReviewSummary = {
  product_id: string;
  average: number;
  count: number;
  histogram: [number, number, number, number, number];
};

const EMPTY_SUMMARY = (productId: string): ReviewSummary => ({
  product_id: productId,
  average: 0,
  count: 0,
  histogram: [0, 0, 0, 0, 0],
});

function headers(auth?: string): Record<string, string> {
  const h: Record<string, string> = { 'content-type': 'application/json' };
  if (PK) h['x-publishable-api-key'] = PK;
  if (auth) h.authorization = `Bearer ${auth}`;
  return h;
}

/** Aggregate rating for a product. Empty (not an error) when commerce is off. */
export async function getReviewSummary(productId: string): Promise<ReviewSummary> {
  if (!BASE || !PK || !productId) return EMPTY_SUMMARY(productId);
  try {
    const res = await fetch(
      `${BASE}/store/reviews/summary?product_id=${encodeURIComponent(productId)}`,
      { headers: headers(), next: { revalidate: 60 } },
    );
    if (!res.ok) return EMPTY_SUMMARY(productId);
    const { summary } = (await res.json()) as { summary: ReviewSummary };
    return summary ?? EMPTY_SUMMARY(productId);
  } catch {
    return EMPTY_SUMMARY(productId);
  }
}

/** Approved reviews for a product, newest first. */
export async function listReviews(
  productId: string,
  opts: { limit?: number; offset?: number; cache?: RequestCache } = {},
): Promise<{ reviews: Review[]; count: number }> {
  if (!BASE || !PK || !productId) return { reviews: [], count: 0 };
  const { limit = 20, offset = 0 } = opts;
  try {
    const res = await fetch(
      `${BASE}/store/reviews?product_id=${encodeURIComponent(productId)}&limit=${limit}&offset=${offset}`,
      opts.cache ? { headers: headers(), cache: opts.cache } : { headers: headers(), next: { revalidate: 60 } },
    );
    if (!res.ok) return { reviews: [], count: 0 };
    return (await res.json()) as { reviews: Review[]; count: number };
  } catch {
    return { reviews: [], count: 0 };
  }
}

export type SubmitReviewInput = {
  product_id: string;
  rating: number;
  title?: string;
  body: string;
};

/**
 * Submit a review as the signed-in customer (client-only). Throws with a
 * human-readable message on 401 (not signed in) or validation errors.
 */
export async function submitReview(input: SubmitReviewInput): Promise<Review> {
  if (!BASE || !PK) throw new Error('Reviews are unavailable right now.');
  const token = medusa.getAuthToken?.();
  if (!token) throw new Error('Please sign in to write a review.');
  if (input.rating < 1 || input.rating > 5) throw new Error('Pick a rating from 1 to 5 stars.');
  const res = await fetch(`${BASE}/store/reviews`, {
    method: 'POST',
    headers: headers(token),
    cache: 'no-store',
    body: JSON.stringify(input),
  });
  if (res.status === 401) throw new Error('Please sign in to write a review.');
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message || 'Could not submit your review. Please try again.');
  }
  const { review } = (await res.json()) as { review: Review };
  return review;
}
