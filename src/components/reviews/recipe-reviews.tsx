'use client';

/**
 * RecipeReviews — real ratings & reviews for a cocktail recipe page, backed by the
 * shared Medusa `product_review` module (recipe-target variant). Mirrors
 * ProductReviews: an approved review list + a submit form gated to SIGNED-IN
 * customers (the backend also enforces 401). Submissions appear immediately
 * (the list re-fetches no-store after a successful POST). Never fabricates a
 * rating — zero ratings invites the first one.
 */
import { useAuth } from '@/components/vinny/commerce/auth-context';
import {
  type RecipeReview,
  type RecipeReviewSummary,
  getRecipeReviewSummary,
  listRecipeReviews,
  submitRecipeReview,
} from '@/lib/reviews';
import { Star } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

function Stars({ value, className = 'h-4 w-4' }: { value: number; className?: string }) {
  return (
    <span className="inline-flex text-accent" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative">
            <Star className={`${className} text-concrete`} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={`${className} fill-current`} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
          aria-pressed={value === n}
          onClick={() => onChange(n)}
          className="p-1"
        >
          <Star className={`h-7 w-7 ${n <= value ? 'fill-current text-accent' : 'text-concrete'}`} />
        </button>
      ))}
    </div>
  );
}

export function RecipeReviews({
  recipeSlug,
  recipeName,
}: {
  recipeSlug: string;
  recipeName: string;
}) {
  const { customer, ready, configured } = useAuth();
  const [reviews, setReviews] = useState<RecipeReview[] | null>(null);
  const [summary, setSummary] = useState<RecipeReviewSummary | null>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const load = useCallback(async () => {
    const [list, sum] = await Promise.all([
      listRecipeReviews(recipeSlug, { cache: 'no-store' }),
      getRecipeReviewSummary(recipeSlug, { cache: 'no-store' }),
    ]);
    setReviews(list.reviews);
    setSummary(sum);
  }, [recipeSlug]);

  useEffect(() => {
    void load();
  }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await submitRecipeReview({
        recipe_slug: recipeSlug,
        rating,
        title: title.trim() || undefined,
        body: body.trim(),
      });
      setDone(true);
      setTitle('');
      setBody('');
      setRating(5);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit your rating.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section id="ratings" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-3xl text-fg">Ratings</h2>
          {summary && summary.count > 0 ? (
            <div className="flex items-center gap-3">
              <Stars value={summary.average} className="h-5 w-5" />
              <span className="font-display text-fg text-lg">{summary.average.toFixed(1)}</span>
              <span className="text-neutral-500 text-sm">
                from {summary.count} rating{summary.count === 1 ? '' : 's'}
              </span>
            </div>
          ) : null}
        </div>

        {/* Review list */}
        <div className="mt-8">
          {reviews === null ? (
            <p className="text-neutral-500 text-sm">Loading ratings…</p>
          ) : reviews.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-3">
              {reviews.map((r) => (
                <figure key={r.id} className="flex flex-col rounded-2xl bg-warm p-7 shadow-soft">
                  <div className="mb-4 flex items-center gap-2">
                    <Stars value={r.rating} className="h-4 w-4" />
                    {r.verified_purchase ? (
                      <span className="rounded-full bg-accent/10 px-2 py-0.5 font-mono text-[10px] text-accent uppercase tracking-wide">
                        Verified
                      </span>
                    ) : null}
                  </div>
                  {r.title ? <p className="mb-2 font-display text-fg text-lg">{r.title}</p> : null}
                  <blockquote className="flex-1 text-neutral-700 leading-relaxed">“{r.body}”</blockquote>
                  <figcaption className="mt-5">
                    <p className="font-display text-fg">{r.author_name}</p>
                    <p className="text-neutral-500 text-sm">
                      {new Date(r.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <p className="text-neutral-600">Be the first to rate {recipeName}.</p>
          )}
        </div>

        {/* Submit form — signed-in customers only (real, non-fakeable ratings). */}
        <div className="mt-10 max-w-xl rounded-2xl bg-warm p-7 shadow-soft">
          <h3 className="font-display text-fg text-xl">Rate this recipe</h3>
          {!configured ? (
            <p className="mt-3 text-neutral-500 text-sm">Ratings are temporarily unavailable.</p>
          ) : !ready ? (
            <p className="mt-3 text-neutral-500 text-sm">…</p>
          ) : !customer ? (
            <p className="mt-3 text-neutral-600">
              Please{' '}
              <Link href="/login" className="font-display text-accent underline">
                sign in
              </Link>{' '}
              to rate {recipeName}.
            </p>
          ) : done ? (
            <div className="mt-3">
              <p className="text-fg">Thanks, {customer.first_name || 'friend'} — your rating is posted.</p>
              <button
                type="button"
                onClick={() => setDone(false)}
                className="mt-2 font-display text-accent text-sm underline"
              >
                Edit your rating
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-4 space-y-4">
              <div>
                <span className="mb-1 block font-mono text-neutral-400 text-xs uppercase tracking-[0.2em]">
                  Your rating
                </span>
                <StarPicker value={rating} onChange={setRating} />
              </div>
              <label className="block">
                <span className="mb-1 block font-mono text-neutral-400 text-xs uppercase tracking-[0.2em]">
                  Title <span className="text-neutral-300">(optional)</span>
                </span>
                <input
                  type="text"
                  value={title}
                  maxLength={120}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border border-concrete bg-white px-4 py-3 text-fg"
                  placeholder="Sum it up"
                />
              </label>
              <label className="block">
                <span className="mb-1 block font-mono text-neutral-400 text-xs uppercase tracking-[0.2em]">
                  Your note
                </span>
                <textarea
                  value={body}
                  required
                  rows={4}
                  maxLength={5000}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full rounded-xl border border-concrete bg-white px-4 py-3 text-fg"
                  placeholder={`How was your ${recipeName}?`}
                />
              </label>
              {error ? <p className="text-red-600 text-sm">{error}</p> : null}
              <button
                type="submit"
                disabled={submitting || body.trim().length === 0}
                className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3 font-display text-white shadow-brand-glow transition-transform duration-300 ease-brand hover:-translate-y-0.5 disabled:opacity-50"
              >
                {submitting ? 'Posting…' : 'Post rating'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
