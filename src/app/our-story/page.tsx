import PageShell, { PageHero } from '@/components/PageShell';
import { getPage } from '@/lib/strapi';
import type { Metadata } from 'next';

/**
 * Our Story — editable marketing copy. Reads the shared Strapi `page`
 * (slug=our-story, tenant=touch-vodka) via the tenant-scoped data-provider and
 * falls back to this hardcoded copy when the CMS is unwired/empty. Strapi is the
 * source of truth once content lands; this copy is the seed + offline safety net.
 */
const FALLBACK = {
  eyebrow: 'Est. 2012',
  title: 'Our Story',
  lead: 'Industrial precision meets artisanal soul. Elevating spirits since 2012 for those who appreciate the finer details.',
  body: [
    'Touch Vodka began with a simple obsession: the smoothest finish, every time. We engineer our spirits the way an industrial designer engineers an object — relentless iteration, no wasted material, every detail deliberate.',
    'Our winter wheat is sourced from local fields and distilled ten times, then charcoal-filtered to strip impurities while keeping character. Blended with mineral-rich spring water, the result is a vodka that is clean, crisp, and unmistakably ours.',
    'Touch Vodka is a Fat Dog Spirits brand, crafted in Tampa, Florida. Please enjoy responsibly.',
  ].join('\n\n'),
  seoTitle: 'Our Story',
  seoDescription:
    'The Touch Vodka story — industrial precision meets artisanal soul. Crafting premium spirits since 2012.',
};

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('our-story');
  return {
    title: page?.seoTitle || page?.title || FALLBACK.seoTitle,
    description: page?.seoDescription || FALLBACK.seoDescription,
  };
}

export default async function OurStoryPage() {
  const page = await getPage('our-story');
  const eyebrow = page?.eyebrow || FALLBACK.eyebrow;
  const title = page?.title || FALLBACK.title;
  const lead = page?.lead || FALLBACK.lead;
  const paragraphs = (page?.body || FALLBACK.body)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <PageShell>
      <PageHero eyebrow={eyebrow} title={title} lead={lead} />
      <section className="mx-auto max-w-3xl space-y-6 px-6 py-20 md:py-28">
        {paragraphs.map((p, i) => (
          <p
            key={p.slice(0, 48)}
            className={
              i === 0
                ? 'text-neutral-800 text-xl leading-relaxed md:text-2xl'
                : 'text-lg text-neutral-600 leading-relaxed'
            }
          >
            {p}
          </p>
        ))}
      </section>
    </PageShell>
  );
}
