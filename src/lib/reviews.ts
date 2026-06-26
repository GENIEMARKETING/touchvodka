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

/** Browser event fired after a successful review submit so other islands on the
 *  page (the hero rating, the section summary) refresh immediately rather than
 *  wait for the server ISR window. */
export const REVIEW_SUBMITTED_EVENT = 'tv:review-submitted';

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

/** Aggregate rating for a product. Empty (not an error) when commerce is off.
 *  Pass `{ cache: 'no-store' }` from the browser for an up-to-the-second read. */
export async function getReviewSummary(
  productId: string,
  opts: { cache?: RequestCache } = {},
): Promise<ReviewSummary> {
  if (!BASE || !PK || !productId) return EMPTY_SUMMARY(productId);
  try {
    const res = await fetch(
      `${BASE}/store/reviews/summary?product_id=${encodeURIComponent(productId)}`,
      opts.cache
        ? { headers: headers(), cache: opts.cache }
        : { headers: headers(), next: { revalidate: 60 } },
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

// ── Recipe (cocktail) ratings ────────────────────────────────────────────────
// Same Medusa `product_review` module, recipe-target variant (`recipe_slug` instead
// of `product_id` — deployed + verified on the shared Medusa 2026-06-25). Mirrors the
// product helpers above so /cocktails ratings reuse the proven, signed-in flow.

export type RecipeReview = {
  id: string;
  recipe_slug: string;
  rating: number;
  title?: string;
  body: string;
  author_name: string;
  created_at: string;
  verified_purchase: boolean;
};

export type RecipeReviewSummary = {
  recipe_slug: string;
  average: number;
  count: number;
  histogram: [number, number, number, number, number];
};

const EMPTY_RECIPE_SUMMARY = (slug: string): RecipeReviewSummary => ({
  recipe_slug: slug,
  average: 0,
  count: 0,
  histogram: [0, 0, 0, 0, 0],
});

/** Aggregate rating for a recipe. Empty (not an error) when commerce is off. */
export async function getRecipeReviewSummary(
  slug: string,
  opts: { cache?: RequestCache } = {},
): Promise<RecipeReviewSummary> {
  if (!BASE || !PK || !slug) return EMPTY_RECIPE_SUMMARY(slug);
  try {
    const res = await fetch(
      `${BASE}/store/reviews/summary?recipe_slug=${encodeURIComponent(slug)}`,
      opts.cache
        ? { headers: headers(), cache: opts.cache }
        : { headers: headers(), next: { revalidate: 60 } },
    );
    if (!res.ok) return EMPTY_RECIPE_SUMMARY(slug);
    const { summary } = (await res.json()) as { summary: RecipeReviewSummary };
    return summary ?? EMPTY_RECIPE_SUMMARY(slug);
  } catch {
    return EMPTY_RECIPE_SUMMARY(slug);
  }
}

/** Approved reviews for a recipe, newest first. */
export async function listRecipeReviews(
  slug: string,
  opts: { limit?: number; offset?: number; cache?: RequestCache } = {},
): Promise<{ reviews: RecipeReview[]; count: number }> {
  if (!BASE || !PK || !slug) return { reviews: [], count: 0 };
  const { limit = 20, offset = 0 } = opts;
  try {
    const res = await fetch(
      `${BASE}/store/reviews?recipe_slug=${encodeURIComponent(slug)}&limit=${limit}&offset=${offset}`,
      opts.cache ? { headers: headers(), cache: opts.cache } : { headers: headers(), next: { revalidate: 60 } },
    );
    if (!res.ok) return { reviews: [], count: 0 };
    return (await res.json()) as { reviews: RecipeReview[]; count: number };
  } catch {
    return { reviews: [], count: 0 };
  }
}

export type SubmitRecipeReviewInput = {
  recipe_slug: string;
  rating: number;
  title?: string;
  body: string;
};

/** Submit a recipe rating as the signed-in customer (client-only; 401 if logged out). */
export async function submitRecipeReview(input: SubmitRecipeReviewInput): Promise<RecipeReview> {
  if (!BASE || !PK) throw new Error('Ratings are unavailable right now.');
  const token = medusa.getAuthToken?.();
  if (!token) throw new Error('Please sign in to rate this recipe.');
  if (input.rating < 1 || input.rating > 5) throw new Error('Pick a rating from 1 to 5 stars.');
  const res = await fetch(`${BASE}/store/reviews`, {
    method: 'POST',
    headers: headers(token),
    cache: 'no-store',
    body: JSON.stringify(input),
  });
  if (res.status === 401) throw new Error('Please sign in to rate this recipe.');
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { message?: string };
    throw new Error(err.message || 'Could not submit your rating. Please try again.');
  }
  const { review } = (await res.json()) as { review: RecipeReview };
  return review;
}
