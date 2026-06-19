import CocktailCard from '@/components/CocktailCard';
import { COCKTAILS } from '@/data/cocktails';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

/**
 * Recipes — the home "Featured Recipes" rail (Figma home Cocktail Grid). Three
 * signature serves rendered with the shared CocktailCard so the card → recipe
 * navigation matches /cocktails. Horizontal snap-scroll on mobile, 3-up grid on
 * desktop. The featured set can move to Strapi site-config later.
 */
const FEATURED_SLUGS = ['key-lime-paradise', 'ruby-berry-crush', 'orange-sunburst'];

export default function Recipes() {
  const featured = FEATURED_SLUGS.map((slug) => COCKTAILS.find((c) => c.slug === slug)).filter(
    (c): c is NonNullable<typeof c> => Boolean(c),
  );

  return (
    <section className="bg-warm py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 font-mono text-accent text-xs uppercase tracking-[0.25em]">
              Signature Serves
            </p>
            <h2 className="font-display text-4xl text-fg uppercase md:text-6xl">Featured Recipes</h2>
          </div>
          <Link
            href="/cocktails"
            className="group inline-flex items-center gap-2 rounded-full border border-neutral-300 px-6 py-3 font-display text-fg text-sm uppercase tracking-wide transition-colors hover:border-fg"
          >
            All cocktails
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="-mx-6 flex snap-x gap-5 overflow-x-auto px-6 pb-4 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
          {featured.map((c) => (
            <div key={c.id} className="w-72 shrink-0 snap-start md:w-auto">
              <CocktailCard cocktail={c} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
