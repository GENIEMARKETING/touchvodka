import PageShell from '@/components/PageShell';
import { getPage } from '@/lib/strapi';
import type { Metadata } from 'next';
import Image from 'next/image';

/**
 * Our Story (Figma 51:62) — split hero → "Meet Fat Dog Spirits" → timeline →
 * dark Mission & Vision. Editable copy reads the shared Strapi `page`
 * (slug=our-story, tenant=touch-vodka) and falls back to this seed. Distillery
 * photography is placeholder until the asset pass.
 *
 * ⚠ FLAG (DEV-HANDOFF): founding-year conflict — Touch lists Est. 2012; Fat Dog
 * Spirits founded 2016. Both shown in the timeline; confirm with Vinny.
 */
const FALLBACK = {
  eyebrow: 'Our Story',
  title: 'Made in Tampa since 2012',
  lead: 'Touch was born in Tampa, Florida with a single obsession: the smoothest finish. Ten times distilled and charcoal filtered in small batches, every expression is built on craft, patience, and good company — never shortcuts.',
  body: [
    'Touch is a Fat Dog Spirits brand — an independent, family-owned distillery in Tampa, Florida, named after the distillery’s first four-legged quality inspector.',
    'Small by design: fewer than 100 batches a year, each one hand-finished, tasted, and signed by our distillers. 98% of our waste is diverted — spent grain goes to local farms and bakeries.',
  ].join('\n\n'),
  seoTitle: 'Our Story',
  seoDescription:
    'The Touch Vodka story — made in Tampa, Florida since 2012. A Fat Dog Spirits brand: small-batch, 10× distilled, craft first.',
};

const TIMELINE = [
  { year: '2012', label: 'Touch Vodka established' },
  { year: '2016', label: 'Fat Dog Spirits founded' },
  { year: '2024', label: 'Awarded for flavor innovation' },
  { year: 'Today', label: '5 expressions · 10× distilled' },
];

const VALUES = [
  'Independent & family-owned',
  'Fewer than 100 batches a year',
  '98% waste diverted',
  'Hand-finished & signed',
];

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
  const lead = page?.lead || FALLBACK.lead;
  const title = page?.title && page.title !== 'Our Story' ? page.title : FALLBACK.title;
  const paragraphs = (page?.body || FALLBACK.body)
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <PageShell>
      {/* Hero split */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <div className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-warm shadow-soft">
            <Image
              src="/scenes/ourstory_hero.webp"
              alt="The Fat Dog Spirits distillery in Tampa, Florida"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-mono text-accent text-xs uppercase tracking-[0.25em]">{eyebrow}</p>
            <h1 className="mt-3 font-display text-4xl text-fg uppercase md:text-6xl">{title}</h1>
            <p className="mt-5 text-lg text-neutral-600 leading-relaxed">{lead}</p>
          </div>
        </div>
      </section>

      {/* Meet Fat Dog Spirits */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
          <div>
            <p className="font-mono text-accent text-xs uppercase tracking-[0.25em]">
              The distillery
            </p>
            <h2 className="mt-3 font-display text-4xl text-fg uppercase md:text-5xl">
              Meet Fat Dog Spirits
            </h2>
            <div className="mt-5 space-y-4">
              {paragraphs.map((p) => (
                <p key={p.slice(0, 40)} className="text-neutral-600 leading-relaxed">
                  {p}
                </p>
              ))}
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-warm shadow-soft md:order-last">
            <Image
              src="/scenes/distillery.webp"
              alt="Copper stills at the Touch distillery"
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="bg-warm py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <p className="font-mono text-accent text-xs uppercase tracking-[0.25em]">Timeline</p>
          <h2 className="mt-3 font-display text-4xl text-fg uppercase md:text-5xl">
            How we got here
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TIMELINE.map((t) => (
              <div key={t.year} className="rounded-2xl bg-white p-7 shadow-soft">
                <p className="font-display text-4xl text-accent">{t.year}</p>
                <p className="mt-2 text-neutral-600 text-sm">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission & vision — dark */}
      <section className="bg-fg py-16 text-white md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <p className="font-mono text-accent text-xs uppercase tracking-[0.25em]">
            What we stand for
          </p>
          <h2 className="mt-3 font-display text-4xl uppercase md:text-5xl">Mission &amp; vision</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <p className="font-mono text-accent text-xs uppercase tracking-[0.2em]">Our mission</p>
              <h3 className="mt-3 font-display text-2xl">Flavor first. Every drop matters.</h3>
              <p className="mt-3 text-white/70 leading-relaxed">
                Great spirits should be unpretentious, meticulously crafted, and shared with the
                people — and dogs — you love.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <p className="font-mono text-accent text-xs uppercase tracking-[0.2em]">Our vision</p>
              <h3 className="mt-3 font-display text-2xl">Out-pour the giants.</h3>
              <p className="mt-3 text-white/70 leading-relaxed">
                To prove that independent, small-batch craft can out-pour the giants — one honest
                bottle at a time.
              </p>
            </div>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-4">
            {VALUES.map((v) => (
              <div key={v} className="border-accent border-t pt-4 text-sm text-white/80">
                {v}
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
