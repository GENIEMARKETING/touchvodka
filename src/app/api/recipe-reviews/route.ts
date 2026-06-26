/**
 * POST /api/recipe-reviews — submit a SIGNED-IN recipe rating.
 *
 * Reads the httpOnly `tv_customer` session JWT (set by /api/auth/*) and forwards it
 * server-to-server to Medusa `/store/reviews { recipe_slug, ... }` (so the JWT never
 * touches page JS and we skip Medusa's AUTH_CORS — same pattern as lib/medusa-auth).
 * No token → 401. Medusa derives the author + dedupes one review per (customer,recipe).
 */
import { AUTH_COOKIE } from '@/lib/medusa-auth';
import { submitRecipeReview } from '@/lib/recipe-reviews';
import { type NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  if (!token) {
    return NextResponse.json({ error: 'Please sign in to leave a rating.' }, { status: 401 });
  }

  const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
  const recipe_slug = String(body.recipe_slug ?? '').trim();
  const rating = Number(body.rating);
  const text = String(body.body ?? '').trim();
  const title = body.title ? String(body.title).trim().slice(0, 120) : undefined;

  if (!recipe_slug) return NextResponse.json({ error: 'Missing recipe.' }, { status: 400 });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Pick a rating from 1 to 5 stars.' }, { status: 400 });
  }
  if (text.length < 1 || text.length > 5000) {
    return NextResponse.json({ error: 'Add a short note with your rating.' }, { status: 400 });
  }

  const result = await submitRecipeReview(token, { recipe_slug, rating, title, body: text });
  if (!result.ok) {
    return NextResponse.json({ error: result.message ?? 'Could not submit your rating.' }, { status: result.status });
  }
  return NextResponse.json({ ok: true });
}
