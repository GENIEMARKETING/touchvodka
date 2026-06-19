import ExploreLanding from '@/components/ExploreLanding';
import { OCCASIONS, signatureServe } from '@/data/explore';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cocktails by Occasion',
  description: 'The right Touch Vodka serve for date night, game day, brunch, the beach and more.',
};

export default function OccasionsPage() {
  return (
    <ExploreLanding
      eyebrow="Explore"
      title="Serves by Occasion"
      watermark="Occasions"
      lead="Whatever the moment, there's a Touch serve for it. Find yours."
      entries={OCCASIONS.map((o) => ({
        entry: o,
        href: `/cocktails/occasions/${o.slug}`,
        serve: signatureServe(o),
      }))}
    />
  );
}
