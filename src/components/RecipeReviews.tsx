'use client';

/**
 * Recipe ratings widget — displays the genuine aggregate + reviews and, for a
 * SIGNED-IN customer, a submit form (posts to /api/recipe-reviews, which forwards
 * the session JWT to Medusa). The aggregate it shows is the SAME data behind the
 * Recipe `aggregateRating` JSON-LD. Never renders a fabricated rating: with zero
 * ratings it invites the first one rather than inventing stars.
 */
import { useCustomer } from '@/components/auth/customer-context';
import type { RecipeReview, RecipeReviewSummary } from '@/lib/recipe-reviews';
import { Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function Stars({ value, className = 'h-4 w-4' }: { value: number; className?: string }) {
  const rounded = Math.round(value);
  return (
    <span className="inline-flex items-center" aria-hidden>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={`${className} ${n <= rounded ? 'fill-accent text-accent' : 'text-neutral-300'}`}
        />
      ))}
    </span>
  );
}

export default function RecipeReviews({
  recipeSlug,
  recipeName,
  summary,
  initialReviews,
}: {
  recipeSlug: string;
  recipeName: string;
  summary: RecipeReviewSummary | null;
  initialReviews: RecipeReview[];
}) {
  const { customer, loading } = useCustomer();
  const router = useRouter();
  const [reviews] = useState(initialReviews);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done'>('idle');
  const [error, setError] = useState('');

  const average = summary?.average ?? 0;
  const count = summary?.count ?? 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (rating < 1) {
      setError('Pick a rating from 1 to 5 stars.');
      return;
    }
    if (body.trim().length < 1) {
      setError('Add a short note with your rating.');
      return;
    }
    setStatus('submitting');
    try {
      const res = await fetch('/api/recipe-reviews', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ recipe_slug: recipeSlug, rating, title: title.trim() || undefined, body: body.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setStatus('idle');
        setError(data.error ?? 'Could not submit your rating.');
        return;
      }
      setStatus('done');
      router.refresh(); // pull the recomputed aggregate from the server
    } catch {
      setStatus('idle');
      setError('Could not submit your rating. Please try again.');
    }
  }

  return (
    <section id="ratings" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="font-display text-3xl text-fg">Ratings</h2>
          {count > 0 ? (
            <div className="flex items-center gap-3">
              <span className="font-display text-4xl text-fg">{average.toFixed(1)}</span>
              <span className="font-mono text-sm">
                <Stars value={average} />
                <span className="ml-2 text-neutral-500 lowercase">
                  {count} {count === 1 ? 'rating' : 'ratings'}
                </span>
              </span>
            </div>
          ) : (
            <p className="font-mono text-neutral-500 text-sm">No ratings yet — be the first.</p>
          )}
        </div>

        {/* Reviews list */}
        {reviews.length > 0 ? (
          <ul className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <li key={r.id} className="rounded-3xl bg-warm p-6 shadow-soft">
                <div className="flex items-center gap-2">
                  <Stars value={r.rating} />
                  {r.verified_purchase ? (
                    <span className="font-mono text-accent text-xs uppercase tracking-widest">
                      ✓ verified
                    </span>
                  ) : null}
                </div>
                {r.title ? <p className="mt-3 font-display text-fg text-lg">{r.title}</p> : null}
                <p className="mt-2 text-neutral-700 leading-relaxed">{r.body}</p>
                <p className="mt-4 font-mono text-neutral-400 text-xs uppercase tracking-widest">
                  {r.author_name}
                </p>
              </li>
            ))}
          </ul>
        ) : null}

        {/* Submit — signed-in customers only (real, non-fakeable ratings). */}
        <div className="mt-10 max-w-xl">
          {loading ? null : status === 'done' ? (
            <p className="rounded-2xl bg-warm p-5 font-mono text-fg text-sm">
              Thanks for rating {recipeName}! Your rating will appear shortly.
            </p>
          ) : customer ? (
            <form onSubmit={submit} className="rounded-3xl bg-warm p-6 shadow-soft md:p-8">
              <p className="font-display text-fg text-xl">Rate this recipe</p>
              <div className="mt-4 flex items-center gap-1" role="radiogroup" aria-label="Your rating">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} star${n > 1 ? 's' : ''}`}
                    aria-checked={rating === n}
                    role="radio"
                    onClick={() => setRating(n)}
                    onMouseEnter={() => setHover(n)}
                    onMouseLeave={() => setHover(0)}
                    className="p-1"
                  >
                    <Star
                      className={`h-8 w-8 transition-colors ${
                        n <= (hover || rating) ? 'fill-accent text-accent' : 'text-neutral-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title (optional)"
                maxLength={120}
                className="mt-4 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-fg outline-none focus:border-accent"
              />
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Tell us what you thought…"
                rows={3}
                maxLength={5000}
                className="mt-3 w-full rounded-xl border border-neutral-200 bg-white px-4 py-3 text-fg outline-none focus:border-accent"
              />
              {error ? <p className="mt-3 font-mono text-red-600 text-sm">{error}</p> : null}
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="mt-4 inline-flex items-center justify-center rounded-full bg-accent px-8 py-3 font-display text-lg text-white transition-transform duration-300 ease-brand hover:-translate-y-0.5 disabled:opacity-60"
              >
                {status === 'submitting' ? 'Submitting…' : 'Submit rating'}
              </button>
            </form>
          ) : (
            <p className="rounded-2xl bg-warm p-5 font-mono text-neutral-600 text-sm">
              Sign in to rate {recipeName} — use the account menu in the header.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
