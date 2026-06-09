import PageShell, { PageHero } from '@/components/PageShell';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Our Story',
  description:
    'The Touch Vodka story — industrial precision meets artisanal soul. Crafting premium spirits since 2012.',
};

export default function OurStoryPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="// 00_ORIGIN"
        title="Our Story"
        lead="Industrial precision meets artisanal soul. Elevating spirits since 2012 for those who appreciate the finer details."
      />
      <section className="mx-auto max-w-3xl space-y-8 px-6 py-16 font-mono text-base leading-relaxed lowercase opacity-80">
        <p>
          Touch Vodka began with a simple obsession: the smoothest finish, every time. We engineer
          our spirits the way an industrial designer engineers an object — relentless iteration, no
          wasted material, every detail deliberate.
        </p>
        <p>
          Our winter wheat is sourced from local fields and distilled ten times, then
          charcoal-filtered to strip impurities while keeping character. Blended with mineral-rich
          spring water, the result is a vodka that is clean, crisp, and unmistakably ours.
        </p>
        <p>
          Touch Vodka is a Fat Dog Spirits brand, crafted in Tampa, Florida. Please enjoy
          responsibly.
        </p>
      </section>
    </PageShell>
  );
}
