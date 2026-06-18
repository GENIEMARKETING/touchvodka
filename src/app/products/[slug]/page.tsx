import AreaInterest from '@/components/AreaInterest';
import CocktailCard from '@/components/CocktailCard';
import PageShell from '@/components/PageShell';
import { AddToCart } from '@/components/vinny/commerce/add-to-cart';
import { COCKTAILS } from '@/data/cocktails';
import { PRODUCTS, getProductBySlug } from '@/data/products';
import { STOCKISTS } from '@/data/stockists';
import { getCommerceProduct, priceOf } from '@/lib/commerce';
import { mediaUrl } from '@/lib/media';
import { breadcrumbJsonLd, jsonLdScript, pageMetadata, productJsonLd } from '@/lib/seo';
import { ArrowRight, Star } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) return { title: 'Not found' };
  return pageMetadata({
    title: product.name,
    description: product.description,
    path: `/products/${slug}`,
    ogType: 'product',
    images: [{ url: mediaUrl(product.image), alt: product.name }],
  });
}

/** Placeholder reviews until real ratings land (flagged in DEV-HANDOFF). */
const REVIEWS = [
  {
    quote: 'Smoothest vodka I’ve had in this price range. The finish is unbelievably clean.',
    name: 'Jordan M.',
    meta: 'Verified buyer',
  },
  {
    quote: 'Became our house pour the day it arrived. The bottle looks incredible on the bar too.',
    name: 'Priya S.',
    meta: 'Verified buyer',
  },
  {
    quote: 'Bought it for the label, stayed for the taste. Perfect in a martini.',
    name: 'Alex R.',
    meta: 'Verified buyer',
  },
];

export default async function ProductDetailPage({ params }: Params) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const cocktails = COCKTAILS.filter((c) => product.relatedCocktailIds?.includes(c.id)).slice(0, 3);
  const stockists = STOCKISTS.slice(0, 6);

  const commerce = await getCommerceProduct(slug);
  const price = commerce ? priceOf(commerce) : null;

  const productLd = productJsonLd({
    name: product.name,
    description: product.description,
    image: [mediaUrl(product.image)],
    path: `/products/${slug}`,
    ...(price
      ? { price: price.amount, currency: price.currency_code, availability: 'InStock' as const }
      : {}),
    ...(commerce?.rating && commerce.rating.count > 0
      ? { rating: { value: commerce.rating.average, count: commerce.rating.count } }
      : {}),
  });
  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Home', path: '/' },
    { name: 'The Collection', path: '/products' },
    { name: product.name, path: `/products/${slug}` },
  ]);

  const taste: Array<{ label: string; value: string }> = [
    { label: 'Nose', value: product.tastingNotes.nose },
    { label: 'Palate', value: product.tastingNotes.palate },
    { label: 'Finish', value: product.tastingNotes.finish },
  ];

  const faqs = [
    {
      q: `What makes ${product.name} different?`,
      a: `${product.name} is ${product.distillationProcess.toLowerCase()} for an exceptionally clean, refined finish — then small-batch bottled in Tampa, Florida.`,
    },
    { q: `What proof is ${product.name}?`, a: `${product.proof} — a classic, balanced strength for sipping or mixing.` },
    {
      q: `What is ${product.name} distilled from?`,
      a: 'Premium winter wheat and pure, mineral-rich Florida spring water.',
    },
    {
      q: 'How should I serve it?',
      a: 'Neat, over a large cube, or in any of our signature cocktails. Chill the bottle for the smoothest pour.',
    },
    { q: 'Where do you ship?', a: 'We ship where legal across the US, with flat $10 shipping and adult-signature delivery.' },
  ];

  return (
    <PageShell>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD; jsonLdScript escapes "<".
        dangerouslySetInnerHTML={{ __html: jsonLdScript([productLd, breadcrumbLd]) }}
      />

      {/* Hero — gallery + buy box. */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-warm">
              <Image
                alt={product.name}
                src={mediaUrl(product.image)}
                fill
                sizes="(max-width:1024px) 100vw, 50vw"
                priority
                className="object-contain p-8"
              />
            </div>
            {/* Thumbnail strip (single asset today → repeats; first active). */}
            <div className="mt-4 grid grid-cols-4 gap-3">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className={`relative aspect-square overflow-hidden rounded-xl bg-warm ${
                    i === 0 ? 'ring-2 ring-accent' : 'border border-concrete'
                  }`}
                >
                  <Image
                    alt=""
                    aria-hidden
                    src={mediaUrl(product.image)}
                    fill
                    sizes="120px"
                    className="object-contain p-2"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <p className="font-mono text-accent text-xs uppercase tracking-[0.25em]">
              {product.category}
            </p>
            <h1 className="mt-3 font-display text-5xl text-fg uppercase md:text-6xl">
              {product.name}
            </h1>
            <p className="mt-5 text-lg text-neutral-600 leading-relaxed">{product.description}</p>

            <div className="mt-6 flex items-center gap-6">
              <div>
                <p className="font-mono text-neutral-400 text-xs uppercase tracking-[0.2em]">Proof</p>
                <p className="font-display text-fg text-xl">{product.proof}</p>
              </div>
              <div>
                <p className="font-mono text-neutral-400 text-xs uppercase tracking-[0.2em]">
                  Availability
                </p>
                <p className="font-display text-accent text-xl">In stock</p>
              </div>
              {price ? (
                <div>
                  <p className="font-mono text-neutral-400 text-xs uppercase tracking-[0.2em]">
                    Price
                  </p>
                  <p className="font-display text-fg text-xl">
                    ${(price.amount / 100).toFixed(2)}
                  </p>
                </div>
              ) : null}
            </div>

            <div className="mt-8">
              {commerce ? (
                <AddToCart product={commerce} />
              ) : (
                <Link
                  href="/find-us"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 font-display text-lg text-white shadow-brand-glow transition-transform duration-300 ease-brand hover:-translate-y-0.5"
                >
                  Find a store <ArrowRight className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How it tastes — taste profile + pairings. */}
      <section className="bg-warm py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <p className="font-mono text-accent text-xs uppercase tracking-[0.25em]">Taste profile</p>
          <h2 className="mt-3 font-display text-4xl text-fg uppercase md:text-5xl">How it tastes</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {taste.map((t) => (
              <div key={t.label} className="rounded-2xl bg-white p-7 shadow-soft">
                <p className="font-mono text-accent text-xs uppercase tracking-[0.2em]">{t.label}</p>
                <p className="mt-3 text-neutral-700 leading-relaxed">{t.value}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {product.tastingNotes.pairings.map((p) => (
              <span
                key={p}
                className="rounded-full border border-concrete bg-white px-5 py-2 text-neutral-700 text-sm"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Find Touch near you — stockists. */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
        <div className="mb-8 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="font-mono text-accent text-xs uppercase tracking-[0.25em]">Where to buy</p>
            <h2 className="mt-3 font-display text-4xl text-fg uppercase md:text-5xl">
              Find Touch near you
            </h2>
          </div>
          <Link
            href="/find-us"
            className="inline-flex items-center gap-1.5 font-display text-accent text-sm uppercase tracking-wide"
          >
            View full map <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stockists.map((s) => (
            <div key={s.name} className="rounded-2xl bg-neutral-50 p-6">
              <p className="font-display text-fg text-lg">{s.name}</p>
              <p className="mt-1 text-neutral-600 text-sm">{s.address}</p>
              <p className="text-neutral-500 text-sm">
                {s.city}, {s.state}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Getting it to you — shipping. */}
      <section className="bg-warm py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <p className="font-mono text-accent text-xs uppercase tracking-[0.25em]">
            Shipping &amp; returns
          </p>
          <h2 className="mt-3 font-display text-4xl text-fg uppercase md:text-5xl">
            Getting it to you
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {[
              { t: 'Flat $10 shipping', b: 'One flat rate to anywhere we ship — no surprises at checkout.' },
              { t: 'Adult signature · 21+', b: 'An adult 21+ signature is required on delivery, every time.' },
              { t: 'Ships where legal', b: 'We ship across the US wherever DTC spirits delivery is permitted.' },
            ].map((c) => (
              <div key={c.t}>
                <h3 className="font-display text-fg text-xl">{c.t}</h3>
                <p className="mt-2 text-neutral-600 leading-relaxed">{c.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Questions, answered — FAQ accordion. */}
      <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <p className="font-mono text-accent text-xs uppercase tracking-[0.25em]">FAQ</p>
        <h2 className="mt-3 font-display text-4xl text-fg uppercase md:text-5xl">
          Questions, answered
        </h2>
        <div className="mt-8 divide-y divide-concrete border-concrete border-y">
          {faqs.map((f) => (
            <details key={f.q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-fg text-lg">
                {f.q}
                <span className="text-accent transition-transform group-open:rotate-45">＋</span>
              </summary>
              <p className="mt-3 text-neutral-600 leading-relaxed">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* What people are saying — reviews. */}
      <section className="bg-warm py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <p className="font-mono text-accent text-xs uppercase tracking-[0.25em]">Reviews</p>
          <h2 className="mt-3 font-display text-4xl text-fg uppercase md:text-5xl">
            What people are saying
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {REVIEWS.map((r) => (
              <figure key={r.name} className="flex flex-col rounded-2xl bg-white p-7 shadow-soft">
                <div className="mb-4 flex gap-1 text-accent">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="flex-1 text-neutral-700 leading-relaxed">
                  “{r.quote}”
                </blockquote>
                <figcaption className="mt-5">
                  <p className="font-display text-fg">{r.name}</p>
                  <p className="text-neutral-500 text-sm">{r.meta}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* Tagged #TouchVodka — UGC tiles (placeholder). */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
        <p className="font-mono text-accent text-xs uppercase tracking-[0.25em]">From the community</p>
        <h2 className="mt-3 font-display text-4xl text-fg uppercase md:text-5xl">Tagged #TouchVodka</h2>
        <div className="mt-8 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex aspect-square items-center justify-center rounded-xl bg-warm"
            >
              <span className="font-mono text-[10px] text-neutral-400 uppercase tracking-widest">
                photo
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Make it into — related serves → recipes. */}
      {cocktails.length > 0 ? (
        <section className="bg-warm py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <p className="font-mono text-accent text-xs uppercase tracking-[0.25em]">Mix it</p>
            <h2 className="mt-3 mb-8 font-display text-4xl text-fg uppercase md:text-5xl">
              Make it into
            </h2>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3">
              {cocktails.map((c) => (
                <CocktailCard key={c.id} cocktail={c} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* High-intent geo capture. */}
      <AreaInterest variant="module" />
    </PageShell>
  );
}
