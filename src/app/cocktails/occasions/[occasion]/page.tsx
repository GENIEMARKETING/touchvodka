import CocktailCard from '@/components/CocktailCard';
import ExploreDetail from '@/components/ExploreDetail';
import { type Occasion, cocktailsByOccasion } from '@/data/cocktails';
import { OCCASIONS, getOccasionEntry, signatureServe } from '@/data/explore';
import { pageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return OCCASIONS.map((o) => ({ occasion: o.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ occasion: string }>;
}): Promise<Metadata> {
  const { occasion } = await params;
  const o = getOccasionEntry(occasion);
  if (!o) return { title: 'Occasion not found' };
  return pageMetadata({
    title: `${o.name} Cocktails`,
    description: o.blurb,
    path: `/cocktails/occasions/${o.slug}`,
  });
}

export default async function OccasionDetailPage({
  params,
}: {
  params: Promise<{ occasion: string }>;
}) {
  const { occasion } = await params;
  const o = getOccasionEntry(occasion);
  if (!o) notFound();
  const serves = cocktailsByOccasion(o.name as Occasion);
  return (
    <ExploreDetail
      eyebrow="Occasion"
      title={o.name}
      blurb={o.blurb}
      serve={signatureServe(o)}
      heroImage={o.image}
      exploreHref="/cocktails/occasions"
      exploreLabel="Explore more occasions"
      extra={
        serves.length > 0 ? (
          <section className="bg-warm py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
              <h2 className="mb-8 font-display text-3xl text-fg uppercase md:text-4xl">
                More serves for {o.name.toLowerCase()}
              </h2>
              <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
                {serves.map((c) => (
                  <CocktailCard key={c.id} cocktail={c} />
                ))}
              </div>
            </div>
          </section>
        ) : null
      }
    />
  );
}
