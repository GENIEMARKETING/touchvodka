import CocktailsBrowser from '@/components/CocktailsBrowser';
import ExploreCard from '@/components/ExploreCard';
import PageShell, { PageHero } from '@/components/PageShell';
import { cocktailsBySku } from '@/data/cocktails';
import { CITIES, OCCASIONS, SEASONS, signatureServe } from '@/data/explore';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Signature Cocktails',
  description:
    'Fifty signature serves built on the Touch Vodka collection — filter by expression, season, occasion or city, then make it at home.',
};

export default function CocktailsPage() {
  const groups = cocktailsBySku();
  const seasons = SEASONS.map((s) => ({ slug: s.slug, name: s.name }));
  const occasions = OCCASIONS.map((o) => ({ slug: o.slug, name: o.name }));
  const cities = CITIES.map((c) => ({ slug: c.slug, name: c.name }));

  return (
    <PageShell>
      <PageHero
        eyebrow="Signature Serves"
        title="Cocktails"
        lead="Fifty signature serves engineered for the smoothest finish. Filter by expression, season, occasion, or your city."
      />

      <CocktailsBrowser
        groups={groups}
        seasons={seasons}
        occasions={occasions}
        cities={cities}
      />

      {/* Best by City — curated, drives the City Explore route. */}
      <section className="bg-warm py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-3 font-mono text-accent text-xs uppercase tracking-[0.25em]">
                Touch, city by city
              </p>
              <h2 className="font-display text-3xl text-fg uppercase md:text-4xl">
                Find your signature serve
              </h2>
            </div>
            <Link
              href="/cocktails/cities"
              className="group inline-flex items-center gap-2 rounded-full border border-neutral-300 px-6 py-3 font-display text-fg text-sm uppercase tracking-wide transition-colors hover:border-fg"
            >
              All cities
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {CITIES.map((city) => (
              <ExploreCard
                key={city.slug}
                entry={city}
                href={`/cocktails/cities/${city.slug}`}
                serve={signatureServe(city)}
              />
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
