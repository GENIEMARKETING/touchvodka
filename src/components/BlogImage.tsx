'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * BlogImage — a fill image that walks a fallback chain: the post's own image →
 * an optional scene fallback → a warm placeholder tile. The blog seed references
 * stale unsplash IDs + CDN blog-images that aren't uploaded yet, so without a
 * fallback the cards render broken; the scene fallback keeps the blog looking
 * photographed until real article imagery lands. Client component (needs onError).
 */
export default function BlogImage({
  src,
  fallbackSrc,
  alt,
  label,
  sizes,
  className,
  priority,
}: {
  src?: string;
  fallbackSrc?: string;
  alt: string;
  label?: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  const chain = [src, fallbackSrc].filter((s): s is string => Boolean(s?.trim()));
  const [i, setI] = useState(0);
  const current = chain[i];

  if (!current) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-warm">
        <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
          {label ?? 'Touch'}
        </span>
      </div>
    );
  }

  return (
    <Image
      key={current}
      src={current}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setI((n) => n + 1)}
    />
  );
}
