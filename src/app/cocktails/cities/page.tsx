import ExploreLanding from '@/components/ExploreLanding';
import { CITIES, signatureServe } from '@/data/explore';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Touch, City by City',
  description: 'Find your signature Touch Vodka serve, city by city — from Tampa to New York.',
};

export default function CitiesPage() {
  return (
    <ExploreLanding
      eyebrow="Explore"
      title="Touch, City by City"
      watermark="Cities"
      lead="Every city drinks a little differently. Find the signature Touch serve where you are."
      entries={CITIES.map((city) => ({
        entry: city,
        href: `/cocktails/cities/${city.slug}`,
        serve: signatureServe(city),
      }))}
    />
  );
}
