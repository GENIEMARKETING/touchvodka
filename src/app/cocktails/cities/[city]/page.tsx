import ExploreDetail from '@/components/ExploreDetail';
import { CITIES, getCity, signatureServe } from '@/data/explore';
import { pageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const c = getCity(city);
  if (!c) return { title: 'City not found' };
  return pageMetadata({
    title: `Touch Vodka in ${c.name}`,
    description: c.blurb,
    path: `/cocktails/cities/${c.slug}`,
  });
}

export default async function CityDetailPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const c = getCity(city);
  if (!c) notFound();
  return (
    <ExploreDetail
      eyebrow={`${c.name} · ${c.state}`}
      title={c.name}
      blurb={c.blurb}
      serve={signatureServe(c)}
      features={c.whyHere}
      exploreHref="/cocktails/cities"
      exploreLabel="Explore more cities"
    />
  );
}
