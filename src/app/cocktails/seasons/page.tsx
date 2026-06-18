import ExploreLanding from '@/components/ExploreLanding';
import { SEASONS, signatureServe } from '@/data/explore';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cocktails by Season',
  description: 'Touch Vodka serves for every season — from bright summer coolers to cozy winter sips.',
};

export default function SeasonsPage() {
  return (
    <ExploreLanding
      eyebrow="Explore"
      title="Serves by Season"
      lead="A serve for every season — find the right Touch cocktail for the weather."
      entries={SEASONS.map((s) => ({
        entry: s,
        href: `/cocktails/seasons/${s.slug}`,
        serve: signatureServe(s),
      }))}
    />
  );
}
