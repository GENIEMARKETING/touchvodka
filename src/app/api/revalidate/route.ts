/**
 * POST /api/revalidate — Strapi ISR webhook target (S6 CMS cutover).
 *
 * The shared Strapi (marketing.fatdogspirits.com) fires a webhook on
 * publish/update/delete; this route revalidates only the affected paths so the
 * Next standalone server serves fresh content without a full rebuild.
 *
 * Auth: a shared secret in the `?secret=` query (Strapi webhooks can't set
 * arbitrary headers reliably) — register the hook as
 *   https://touchvodka.com/api/revalidate?secret=$REVALIDATION_SECRET
 * The secret stays server-side (NOT NEXT_PUBLIC). If unset (pre-cutover), the
 * route refuses every request rather than allow unauthenticated cache busting.
 */
import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

// Strapi content model → the listing path(s) it drives on this site.
const MODEL_PATHS: Record<string, string[]> = {
  product: ['/products'],
  cocktail: ['/cocktails'],
  'cocktail-recipe': ['/cocktails'],
  article: ['/blog'],
  'blog-post': ['/blog'],
};

// Global config (footer/socials/site-config) renders on EVERY page → bust the
// whole root layout, not a single path. Handle both webhook model spellings.
const GLOBAL_CONFIG_MODELS = new Set(['siteconfig', 'site-config']);

export async function POST(req: NextRequest) {
  const secret = process.env.REVALIDATION_SECRET;
  // Fail closed: never allow cache busting without a configured secret.
  if (!secret) {
    return NextResponse.json(
      { revalidated: false, message: 'revalidation not configured' },
      { status: 503 },
    );
  }
  if (req.nextUrl.searchParams.get('secret') !== secret) {
    return NextResponse.json({ revalidated: false, message: 'invalid secret' }, { status: 401 });
  }

  // Strapi v5 webhook body: { event, model, entry: { slug, ... } }.
  let body: { model?: string; entry?: { slug?: string } } = {};
  try {
    body = (await req.json()) as typeof body;
  } catch {
    // Empty/invalid body → fall through to a safe homepage revalidate.
  }

  const revalidated: string[] = [];
  const model = body.model;
  const slug = body.entry?.slug;

  if (model && GLOBAL_CONFIG_MODELS.has(model)) {
    // Layout-level: refresh every route under the root layout (footer is global).
    revalidatePath('/', 'layout');
    revalidated.push('/ (layout)');
  } else if (model === 'page') {
    // Marketing-copy page → a top-level route equal to its slug (home → /).
    const path = !slug || slug === 'home' ? '/' : `/${slug}`;
    revalidatePath(path);
    revalidated.push(path);
  } else {
    const listings = (model && MODEL_PATHS[model]) || ['/'];
    for (const path of listings) {
      revalidatePath(path);
      revalidated.push(path);
    }
    // Also revalidate the specific entry detail page when we can derive it.
    if (slug && model && MODEL_PATHS[model]?.[0] && MODEL_PATHS[model][0] !== '/') {
      const detail = `${MODEL_PATHS[model][0]}/${slug}`;
      revalidatePath(detail);
      revalidated.push(detail);
    }
  }

  return NextResponse.json({ revalidated: true, paths: revalidated, now: Date.now() });
}
