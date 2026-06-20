'use client';

/**
 * RatingStat — the hero "Rating" badge on the PDP. The reviews list/summary are
 * client-fetched (the server-rendered page is ISR-cached and can lag a fresh
 * review by the revalidate window), so this reads the summary live in the browser
 * and refreshes the instant a review is posted (REVIEW_SUBMITTED_EVENT). `initial`
 * is the server value, used for the first paint / SEO and as a no-flash fallback.
 */
import { REVIEW_SUBMITTED_EVENT, getReviewSummary } from '@/lib/reviews';
import { Star } from 'lucide-react';
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

export function RatingStat({
  productId,
  initialAverage,
  initialCount,
}: {
  productId: string;
  initialAverage: number;
  initialCount: number;
}) {
  const [average, setAverage] = useState(initialAverage);
  const [count, setCount] = useState(initialCount);

  const refresh = useCallback(async () => {
    const s = await getReviewSummary(productId, { cache: 'no-store' });
    setAverage(s.average);
    setCount(s.count);
  }, [productId]);

  useEffect(() => {
    void refresh();
    const handler = () => void refresh();
    window.addEventListener(REVIEW_SUBMITTED_EVENT, handler);
    return () => window.removeEventListener(REVIEW_SUBMITTED_EVENT, handler);
  }, [refresh]);

  return (
    <a href="#reviews" className="mt-1 flex items-center gap-2">
      {count > 0 ? (
        <>
          <Stars value={average} className="h-4 w-4" />
          <span className="font-display text-fg text-xl">{average.toFixed(1)}</span>
          <span className="text-neutral-500 text-sm">({count})</span>
        </>
      ) : (
        <span className="font-display text-fg text-base">Be the first to review</span>
      )}
    </a>
  );
}
