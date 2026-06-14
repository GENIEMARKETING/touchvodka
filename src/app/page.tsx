import Header from '@/components/Header';
import SiteFooterData from '@/components/SiteFooterData';
import HomeFaq from '@/components/home/HomeFaq';
import HomeHero from '@/components/home/HomeHero';
import { mediaUrl } from '@/lib/media';
import { getPage, getSiteProducts } from '@/lib/strapi';
import { Droplets, type LucideIcon, Sprout, Waves } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Home — composed server component. Products come from the shared Strapi (S6),
 * falling back to the local seed pre-migration. The editable section copy
 * (collection + process headings, the 3 process cards) comes from the Strapi
 * `page` (slug=home) `sections`, falling back to the constants below. The
 * interactive hero stays in code (Plasmic composes it; Strapi feeds its product
 * data) — content-ownership boundary: Strapi owns text/data, code owns layout.
 */

/** Fallback copy = the seed in infrastructure/cms/onboarding/touchvodka-pages.json (slug=home). */
const FALLBACK = {
  collectionEyebrow: '// 01_CATALOGUE',
  collectionTitle: 'The Touch Collection',
  processEyebrow: '// PROCESS_REPORT_04',
  processTitle: 'The Art of Distillation',
  processLead:
    "Crafted with passion and precision, our proprietary process ensures the smoothest finish in every bottle. We don't just make spirits; we engineer experiences.",
} as const;

/** CMS may send an icon by name; resolve it to the component, else use the per-card default. */
const PROCESS_ICONS: Record<string, LucideIcon> = { Sprout, Droplets, Waves };

// Per-card presentation + default content stays in code (the 3-up grid is a fixed
// brutalist layout); only icon name + title + body are editable from the CMS.
const PROCESS_CARDS = [
  {
    Icon: Sprout,
    wrapper:
      'group border-black border-r-2 border-b-2 bg-white p-10 transition-colors hover:bg-accent hover:text-white',
    bodyClass: 'font-mono text-sm lowercase opacity-70 group-hover:opacity-100',
    title: 'Premium Grains',
    body: 'Sourced from the finest local fields, our winter wheat provides a silky texture and a naturally sweet finish.',
  },
  {
    Icon: Droplets,
    wrapper:
      'group border-black border-b-2 bg-neutral-50 p-10 transition-colors hover:bg-accent hover:text-white',
    bodyClass: 'font-mono text-sm lowercase opacity-70 group-hover:opacity-100',
    title: '10X Distilled',
    body: 'Refined exactly ten times for exceptional clarity, then charcoal filtered to remove impurities while keeping character.',
  },
  {
    Icon: Waves,
    wrapper:
      'group border-black border-r-2 bg-neutral-100 p-10 transition-colors hover:bg-accent hover:text-white sm:col-span-2',
    bodyClass: 'max-w-md font-mono text-sm lowercase opacity-70 group-hover:opacity-100',
    title: 'Pure Spring Water',
    body: 'Blended with pristine, mineral-rich water from natural protected springs for a crisp, clean taste that defines our signature profile.',
  },
] as const;

type CmsCard = { icon?: string; title?: string; body?: string };

export default async function Home() {
  const [products, home] = await Promise.all([getSiteProducts(), getPage('home')]);
  const s = (home?.sections ?? {}) as Record<string, unknown>;

  const collectionEyebrow = (s.collectionEyebrow as string) || FALLBACK.collectionEyebrow;
  const collectionTitle = (s.collectionTitle as string) || FALLBACK.collectionTitle;
  const processEyebrow = home?.eyebrow || FALLBACK.processEyebrow;
  const processTitle = (s.processTitle as string) || FALLBACK.processTitle;
  const processLead = home?.lead || FALLBACK.processLead;
  const cmsCards: CmsCard[] = Array.isArray(s.processCards) ? (s.processCards as CmsCard[]) : [];

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      <HomeHero products={products} />

      {/* Collection */}
      <section id="collection" className="border-black border-b-4">
        <div className="flex flex-col items-start justify-between gap-6 border-black border-b-4 bg-neutral-50 p-8 md:flex-row md:items-center md:p-12">
          <div>
            <span className="mb-2 block font-bold text-accent text-sm tracking-[0.3em]">
              {collectionEyebrow}
            </span>
            <h2 className="text-5xl md:text-7xl">{collectionTitle}</h2>
          </div>
          <Link
            href="/products"
            className="group flex items-center gap-3 border-4 border-black px-8 py-4 font-bold transition-all hover:bg-accent hover:text-white"
          >
            View_All
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group flex flex-col border-black border-r-2 border-b-2 p-6 transition-colors last:border-r-0 hover:bg-neutral-50"
            >
              <div className="relative mb-6 aspect-[3/4] overflow-hidden border border-neutral-200 bg-neutral-100">
                <Image
                  alt={product.name}
                  src={mediaUrl(product.image)}
                  fill
                  sizes="(max-width:1024px) 50vw, 20vw"
                  className="scale-90 object-contain p-4 grayscale transition-all duration-500 group-hover:scale-100 group-hover:grayscale-0"
                />
                <div className="absolute top-0 right-0 bg-black p-1.5 font-bold text-[10px] text-white">
                  {product.proof}
                </div>
              </div>
              <h3 className="mb-1 text-2xl transition-colors group-hover:text-accent md:text-3xl">
                {product.name}
              </h3>
              <p className="mb-6 font-mono text-[10px] text-neutral-500 lowercase tracking-wider">
                {product.category}
              </p>
              <span className="mt-auto border-2 border-black p-3 text-center font-display text-xl transition-all group-hover:bg-accent group-hover:text-white">
                Explore_Link
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Process */}
      <section id="distillery" className="grid grid-cols-1 border-black border-b-4 lg:grid-cols-4">
        <div className="flex flex-col justify-center border-black border-r-4 bg-neutral-50 p-8 md:p-16 lg:col-span-2">
          <span className="mb-6 block font-bold text-accent tracking-[0.3em]">{processEyebrow}</span>
          <h2 className="mb-10 text-7xl md:text-9xl">{processTitle}</h2>
          <p className="border-accent border-l-8 pl-8 font-mono text-lg leading-relaxed lowercase opacity-80 md:text-xl">
            {processLead}
          </p>
          <Link
            href="/our-story"
            className="mt-12 w-fit bg-black px-12 py-5 font-display text-3xl text-white transition-all hover:-translate-y-1 hover:bg-accent active:translate-y-0"
          >
            Learn_More
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:col-span-2">
          {PROCESS_CARDS.map((preset, i) => {
            const cms = cmsCards[i];
            const Icon = (cms?.icon ? PROCESS_ICONS[cms.icon] : undefined) ?? preset.Icon;
            return (
              <div key={preset.title} className={preset.wrapper}>
                <Icon className="mb-8 h-12 w-12 text-accent group-hover:text-white" />
                <h3 className="mb-4 text-4xl">{cms?.title ?? preset.title}</h3>
                <p className={preset.bodyClass}>{cms?.body ?? preset.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* T46 (AEO): answer-shaped FAQ — visible Q&A + matching FAQPage JSON-LD. */}
      <HomeFaq />

      <SiteFooterData />
    </div>
  );
}
