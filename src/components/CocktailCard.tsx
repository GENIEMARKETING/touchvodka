import type { Cocktail } from '@/data/cocktails';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * CocktailCard — the shared serve card (Figma `Cocktail Card` 337:10). Warm
 * image area over a white body: blue SKU eyebrow → uppercase name → `Season ·
 * Event` meta → "View recipe →". The whole card links to the recipe; the visible
 * "View recipe" affordance bottom-aligns so ragged 1-/2-line names stay even.
 *
 * Cocktail photography is still pending (PART A) — the art falls back to the
 * expression's bottle shot on a warm field (object-contain) so labels stay sharp.
 */
export default function CocktailCard({ cocktail }: { cocktail: Cocktail }) {
  return (
    <Link
      href={`/cocktails/${cocktail.slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-concrete/60 bg-white shadow-soft transition-all duration-300 ease-brand hover:-translate-y-1 hover:shadow-soft-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-warm">
        <Image
          src={cocktail.image}
          alt={cocktail.name}
          fill
          sizes="(max-width: 768px) 50vw, 320px"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-mono text-accent text-xs uppercase tracking-[0.2em]">
          {cocktail.baseSpirit}
        </p>
        <h3 className="mt-2 font-display text-fg text-xl uppercase leading-tight">
          {cocktail.name}
        </h3>
        <p className="mt-1 text-neutral-500 text-sm">
          {cocktail.season} · {cocktail.event}
        </p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-5 font-display text-accent text-sm">
          View recipe
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
