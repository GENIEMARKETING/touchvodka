// Dependency-free + a *server component*: keep it out of `@geniemarketing/ui`'s
// barrel, whose `export *` over 'use client' modules makes Next reject a server
// import ("export * in a client boundary"). A 3-line className join is all we need.
function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * TestimonialImageCard — one social-proof card: optional star rating, the quote,
 * and an attributed author (avatar + name + optional title). Pure, static, and
 * SSR-first: the quote is real markup so it's crawlable + instantly visible (a
 * trust surface should never wait on JS to read). Entrance motion is owned by the
 * container (`testimonial-wall`), exactly like product-card ↔ product-grid.
 *
 * Variant-not-configuration: a single `testimonial` content object. A video
 * testimonial is a NEW block (`testimonial-video-card`); a wall of these is
 * `testimonial-wall`.
 */
export type Testimonial = {
  /** Stable key — the Strapi documentId / slug. */
  id: string;
  /** The testimonial text (rendered inside a <blockquote>). */
  quote: string;
  /** Who said it — avatar, name, and an optional role/title travel together. */
  author: { name: string; title?: string; avatarUrl?: string };
  /** 0–5 star rating; omit to hide the stars entirely. */
  rating?: number;
};

export type TestimonialImageCardProps = {
  testimonial: Testimonial;
  className?: string;
};

function Stars({ value }: { value: number }) {
  const rounded = Math.max(0, Math.min(5, Math.round(value)));
  return (
    <span
      role="img"
      aria-label={`${rounded} out of 5 stars`}
      className="text-[var(--accent,#111)] tracking-tight"
    >
      {'★★★★★'.slice(0, rounded)}
      <span className="opacity-25">{'★★★★★'.slice(rounded)}</span>
    </span>
  );
}

export function TestimonialImageCard({ testimonial, className }: TestimonialImageCardProps) {
  const { quote, author, rating } = testimonial;
  return (
    <figure
      className={cn(
        'flex h-full flex-col gap-4 rounded-lg border border-[var(--border,#e4e4e7)] bg-[var(--surface,#fff)] p-6 text-[var(--ink,inherit)]',
        className,
      )}
    >
      {typeof rating === 'number' ? <Stars value={rating} /> : null}
      <blockquote className="flex-1 text-lg leading-relaxed">“{quote}”</blockquote>
      <figcaption className="mt-2 flex items-center gap-3">
        {author.avatarUrl ? (
          <img
            src={author.avatarUrl}
            alt=""
            width={40}
            height={40}
            loading="lazy"
            decoding="async"
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--surface-muted,#f4f4f5)] font-semibold"
          >
            {author.name.charAt(0)}
          </span>
        )}
        <span className="leading-tight">
          <span className="block font-semibold">{author.name}</span>
          {author.title ? <span className="block text-sm opacity-60">{author.title}</span> : null}
        </span>
      </figcaption>
    </figure>
  );
}
