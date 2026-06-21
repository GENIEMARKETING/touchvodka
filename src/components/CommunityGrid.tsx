import { getInstagramPosts } from '@/lib/instagram';
import { SOCIALS } from '@/lib/socials';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import Image from 'next/image';

/**
 * CommunityGrid — "From the community / Tagged #TouchVodka": the latest Instagram
 * posts (Meta Graph API via getInstagramPosts), each tile linking to its IG
 * permalink, plus a follow/share row (Instagram · Facebook · YouTube).
 *
 * Server component. Falls back to placeholder tiles when the IG token isn't set
 * yet, so the section is safe to ship before the operator drops the credential.
 * Shared by the PDP and the homepage.
 */
export default async function CommunityGrid({
  eyebrow = 'From the community',
  heading = 'Tagged #TouchVodka',
  limit = 6,
  className = '',
}: {
  eyebrow?: string;
  heading?: string;
  limit?: number;
  className?: string;
}) {
  const posts = await getInstagramPosts(limit);

  return (
    <section className={`mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24 ${className}`}>
      <p className="font-mono text-accent text-xs uppercase tracking-[0.25em]">{eyebrow}</p>
      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h2 className="font-display text-4xl text-fg uppercase md:text-5xl">{heading}</h2>
        <a
          href={SOCIALS.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-accent text-xs uppercase tracking-widest transition-colors hover:text-fg"
        >
          Follow @{SOCIALS.instagramHandle} →
        </a>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {posts.length > 0
          ? posts.map((p) => (
              <a
                key={p.id}
                href={p.permalink}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={p.caption ? p.caption.slice(0, 80) : 'View on Instagram'}
                className="group relative aspect-square overflow-hidden rounded-xl bg-warm"
              >
                <Image
                  src={p.imageUrl}
                  alt={p.caption ? p.caption.slice(0, 120) : 'Touch Vodka on Instagram'}
                  fill
                  unoptimized
                  sizes="(max-width: 640px) 33vw, 16vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 text-white opacity-0 transition-all duration-300 group-hover:bg-black/40 group-hover:opacity-100">
                  <Instagram className="h-6 w-6" />
                </span>
              </a>
            ))
          : Array.from({ length: limit }).map((_, i) => (
              <div
                key={i}
                className="flex aspect-square items-center justify-center rounded-xl bg-warm"
              >
                <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
                  photo
                </span>
              </div>
            ))}
      </div>

      {/* Follow / share row — like & follow on every channel. */}
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <a
          href={SOCIALS.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-fg/15 px-5 py-2.5 font-display text-fg text-sm transition-colors hover:border-accent hover:text-accent"
        >
          <Instagram className="h-4 w-4" /> Instagram
        </a>
        <a
          href={SOCIALS.facebook}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-fg/15 px-5 py-2.5 font-display text-fg text-sm transition-colors hover:border-accent hover:text-accent"
        >
          <Facebook className="h-4 w-4" /> Facebook
        </a>
        <a
          href={SOCIALS.youtube}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-fg/15 px-5 py-2.5 font-display text-fg text-sm transition-colors hover:border-accent hover:text-accent"
        >
          <Youtube className="h-4 w-4" /> YouTube
        </a>
      </div>
    </section>
  );
}
