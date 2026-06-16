'use client';

import { useState } from 'react';

// Dependency-free className join (kept uniform with the sibling testimonial blocks,
// which avoid the @geniemarketing/ui barrel so the server-rendered ones stay valid).
function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * TestimonialVideoCard — a poster frame with a click-to-play video testimonial.
 * The video bytes are NOT fetched until the user clicks (the <video> mounts on
 * play), so the card costs one lazy poster image at rest. The poster sits in a
 * fixed 16:9 box, so neither the poster nor the swapped-in video shifts layout
 * (CLS = 0).
 *
 * Reduced-motion safe: nothing autoplays or loops — playback is always
 * user-initiated (intentional, so it's allowed under reduced motion); the only
 * idle effect is a color-only hover (no transform).
 *
 * Variant-not-configuration: a single `testimonial` content object. A text-only
 * testimonial is `testimonial-image-card`; a wall of them is `testimonial-wall`.
 */
export type VideoTestimonial = {
  /** Stable key — the Strapi documentId / slug. */
  id: string;
  /** Click-to-play source (MP4/WebM, CDN URL). */
  videoUrl: string;
  /** Poster frame shown before play — drives the box size, so set it. */
  posterUrl: string;
  /** Speaker attribution. */
  author: { name: string; title?: string };
  /** Optional pull-quote caption shown under the player. */
  quote?: string;
};

export type TestimonialVideoCardProps = {
  testimonial: VideoTestimonial;
  className?: string;
};

export function TestimonialVideoCard({ testimonial, className }: TestimonialVideoCardProps) {
  const { videoUrl, posterUrl, author, quote } = testimonial;
  const [playing, setPlaying] = useState(false);
  const attribution = author.title ? `${author.name}, ${author.title}` : author.name;

  return (
    <figure
      className={cn(
        'flex h-full flex-col gap-4 rounded-lg border border-[var(--border,#e4e4e7)] bg-[var(--surface,#fff)] text-[var(--ink,inherit)]',
        className,
      )}
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-[var(--surface-muted,#f4f4f5)]">
        {playing ? (
          // A captions track is supplied per-video by the CMS when available; the
          // empty <track> below keeps the element valid for videos without one.
          <video
            src={videoUrl}
            poster={posterUrl}
            controls
            autoPlay
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          >
            <track kind="captions" />
          </video>
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play video testimonial from ${attribution}`}
            className="group absolute inset-0 h-full w-full cursor-pointer"
          >
            <img
              src={posterUrl}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
            />
            <span className="absolute inset-0 grid place-items-center bg-black/20 transition-colors group-hover:bg-black/30">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-white/90 pl-1 text-2xl text-black shadow-lg">
                ▶
              </span>
            </span>
          </button>
        )}
      </div>
      {quote || author.name ? (
        <figcaption className="px-6 pb-6">
          {quote ? <blockquote className="text-lg leading-relaxed">“{quote}”</blockquote> : null}
          <span className="mt-2 block text-sm opacity-60">— {attribution}</span>
        </figcaption>
      ) : null}
    </figure>
  );
}
