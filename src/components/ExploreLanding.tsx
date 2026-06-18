import ExploreCard from '@/components/ExploreCard';
import PageShell, { PageHero } from '@/components/PageShell';
import type { Cocktail } from '@/data/cocktails';
import type { ExploreEntry } from '@/data/explore';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

/**
 * ExploreLanding — the shared City / Season / Occasion explore landing (Figma
 * City/Season/Event Explore). Banner + a responsive grid of ExploreCards + a
 * close CTA. Each entry deep-links to its detail page.
 */
export default function ExploreLanding({
  eyebrow,
  title,
  lead,
  entries,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  entries: Array<{ entry: ExploreEntry; href: string; serve?: Cocktail }>;
}) {
  return (
    <PageShell>
      <PageHero eyebrow={eyebrow} title={title} lead={lead} />
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-20">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map(({ entry, href, serve }) => (
            <ExploreCard key={entry.slug} entry={entry} href={href} serve={serve} />
          ))}
        </div>
      </section>
      <section className="bg-warm py-16 text-center md:py-20">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="font-display text-3xl text-fg uppercase md:text-4xl">Can't find Touch?</h2>
          <p className="mt-3 text-neutral-600">Find a bottle near you, or shop the full collection.</p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/find-us"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 font-display text-lg text-white shadow-brand-glow transition-transform duration-300 ease-brand hover:-translate-y-0.5"
            >
              Find a store <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/products"
              className="inline-flex items-center justify-center rounded-full bg-fg px-8 py-4 font-display text-lg text-white transition-transform duration-300 ease-brand hover:-translate-y-0.5"
            >
              Shop the collection
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
