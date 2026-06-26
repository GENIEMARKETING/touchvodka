/**
 * Recipe ratings seam — genuine, non-fakeable cocktail ratings that hydrate the
 * Recipe `aggregateRating` JSON-LD AND the on-page rating widget.
 *
 * Reads the SAME shared reviews module that powers product (PDP) reviews, via the
 * recipe-target variant of the /store/reviews endpoints (`recipe_slug` instead of
 * `product_id` — deployed + verified on the shared Medusa, 2026-06-25). Reads need
 * only the publishable key (server-side); WRITES require a signed-in customer (see
 * /api/recipe-reviews, which forwards the `tv_customer` session JWT).
 *
 * Env-gated + degrades to null/empty: no `NEXT_PUBLIC_MEDUSA_*` key (or zero ratings)
 * yields no rating — never a throw, never a fabricated rating. aggregateRating turns
 * on automatically the moment real ratings exist. (Mirrors lib/commerce.ts's contract.)
 */
import 'server-only';

const MEDUSA_URL = process.env.NEXT_PUBLIC_MEDUSA_URL;
const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY;

export type RecipeReviewSummary = {
  recipe_slug: string;
  average: number;
  count: number;
  /** Count per star bucket, index 0 = 1★ … index 4 = 5★. */
  histogram: [number, number, number, number, number];
};

export type RecipeReview = {
  id: string;
  rating: number;
  title?: string;
  body: string;
  author_name: string;
  created_at?: string;
  verified_purchase: boolean;
};

function configured(): boolean {
  return Boolean(MEDUSA_URL && PUBLISHABLE_KEY);
}

async function read<T>(path: string, params: Record<string, string>): Promise<T | null> {
  if (!configured()) return null;
  try {
    const url = new URL(`/store/${path}`, MEDUSA_URL);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const res = await fetch(url, {
      headers: { 'x-publishable-api-key': PUBLISHABLE_KEY as string },
      // Ratings change slowly; let ISR refresh. Never block the page.
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Aggregate rating for a recipe, or `null` when commerce is unwired or there are zero
 * ratings. Callers pass this straight into `recipeJsonLd({ rating })` — which itself
 * omits aggregateRating when count is 0.
 */
export async function getRecipeRatingSummary(slug: string): Promise<RecipeReviewSummary | null> {
  const data = await read<{ summary: RecipeReviewSummary }>('reviews/summary', { recipe_slug: slug });
  const summary = data?.summary;
  if (!summary || !summary.count) return null;
  return summary;
}

/** Approved reviews for a recipe (newest first). Empty when unwired/none. */
export async function getRecipeReviews(slug: string, limit = 8): Promise<RecipeReview[]> {
  const data = await read<{ reviews: RecipeReview[] }>('reviews', {
    recipe_slug: slug,
    limit: String(limit),
  });
  return data?.reviews ?? [];
}

export type RecipeReviewInput = { recipe_slug: string; rating: number; title?: string; body: string };

/**
 * Submit a recipe rating as the SIGNED-IN customer (token = the `tv_customer` session
 * JWT, forwarded by /api/recipe-reviews). Medusa derives customer_id + author_name
 * server-side and upserts one review per (customer, recipe) — the storefront can't
 * forge identity. Genuine ratings only; never call this with synthetic data.
 */
export async function submitRecipeReview(
  token: string,
  input: RecipeReviewInput,
): Promise<{ ok: boolean; status: number; message?: string }> {
  if (!configured()) return { ok: false, status: 503, message: 'Ratings are not available right now.' };
  try {
    const res = await fetch(new URL('/store/reviews', MEDUSA_URL), {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-publishable-api-key': PUBLISHABLE_KEY as string,
        authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(input),
      cache: 'no-store',
    });
    if (res.ok) return { ok: true, status: res.status };
    const j = (await res.json().catch(() => ({}))) as { message?: string };
    return { ok: false, status: res.status, message: j.message ?? 'Could not submit your rating.' };
  } catch {
    return { ok: false, status: 500, message: 'Could not submit your rating.' };
  }
}
