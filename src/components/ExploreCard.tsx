import type { Cocktail } from '@/data/cocktails';
import type { ExploreEntry } from '@/data/explore';
import { mediaUrl } from '@/lib/media';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * ExploreCard — a City / Season / Occasion tile (Figma explore-card: scene image
 * + name + signature serve). The whole card links to the matching detail page.
 * Scene imagery is mock (PART B), so the art falls back to the signature serve's
 * cocktail shot on a warm field.
 */
export default function ExploreCard({
  entry,
  href,
  serve,
}: {
  entry: ExploreEntry;
  href: string;
  serve?: Cocktail;
}) {
  const art = entry.image ?? serve?.image ?? '/products/one.png';
  return (
    <Link
      href={href}
      className="group flex flex-col overflow-hidden rounded-2xl border border-concrete/60 bg-white shadow-soft transition-all duration-300 ease-brand hover:-translate-y-1 hover:shadow-soft-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-warm">
        <Image
          src={mediaUrl(art)}
          alt={entry.name}
          fill
          sizes="(max-width: 768px) 100vw, 320px"
          className="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-accent text-xs uppercase tracking-[0.2em]">{entry.kicker}</p>
        <h3 className="mt-2 font-display text-fg text-xl uppercase leading-tight">{entry.name}</h3>
        {serve ? (
          <p className="mt-1 text-neutral-500 text-sm">Signature serve · {serve.name}</p>
        ) : null}
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 font-display text-accent text-sm">
          View
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
