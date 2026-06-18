import ExploreDetail from '@/components/ExploreDetail';
import CocktailCard from '@/components/CocktailCard';
import { type Season, cocktailsBySeason } from '@/data/cocktails';
import { SEASONS, getSeasonEntry, signatureServe } from '@/data/explore';
import { pageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return SEASONS.map((s) => ({ season: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ season: string }>;
}): Promise<Metadata> {
  const { season } = await params;
  const s = getSeasonEntry(season);
  if (!s) return { title: 'Season not found' };
  return pageMetadata({
    title: `${s.name} Cocktails`,
    description: s.blurb,
    path: `/cocktails/seasons/${s.slug}`,
  });
}

export default async function SeasonDetailPage({
  params,
}: {
  params: Promise<{ season: string }>;
}) {
  const { season } = await params;
  const s = getSeasonEntry(season);
  if (!s) notFound();
  const serves = cocktailsBySeason(s.name as Season);
  return (
    <ExploreDetail
      eyebrow="Season"
      title={s.name}
      blurb={s.blurb}
      serve={signatureServe(s)}
      exploreHref="/cocktails/seasons"
      exploreLabel="Explore more seasons"
      extra={
        serves.length > 0 ? (
          <section className="bg-warm py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-6 md:px-10">
              <h2 className="mb-8 font-display text-3xl text-fg uppercase md:text-4xl">
                More {s.name.toLowerCase()} serves
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
