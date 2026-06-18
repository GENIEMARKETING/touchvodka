'use client';

import Image from 'next/image';
import { useState } from 'react';

/**
 * BlogImage — a fill image that gracefully falls back to a warm placeholder tile
 * when the source is missing OR fails to load (the blog seed references stale
 * unsplash IDs + CDN blog-images that aren't uploaded yet). Client component so it
 * can catch next/image `onError`. Replace the placeholder when real blog
 * photography lands via the asset pipeline.
 */
export default function BlogImage({
  src,
  alt,
  label,
  sizes,
  className,
  priority,
}: {
  src?: string;
  alt: string;
  label?: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(!src?.trim());

  if (failed || !src?.trim()) {
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
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={className}
      onError={() => setFailed(true)}
    />
  );
}
