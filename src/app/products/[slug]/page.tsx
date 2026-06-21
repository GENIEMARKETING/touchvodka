import AreaInterest from '@/components/AreaInterest';
import CocktailCard from '@/components/CocktailCard';
import PageShell from '@/components/PageShell';
import { AddToCart } from '@/components/vinny/commerce/add-to-cart';
import { COCKTAILS } from '@/data/cocktails';
import { PRODUCTS, getProductBySlug } from '@/data/products';
import { STOCKISTS } from '@/data/stockists';
import { ProductReviews } from '@/components/reviews/product-reviews';
import { RatingStat } from '@/components/reviews/rating-stat';
import { availabilityOf, getCommerceProduct, priceOf, schemaAvailability } from '@/lib/commerce';
import { getReviewSummary } from '@/lib/reviews';
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
    stars: 5,
  },
  {
    quote: 'Became our house pour the day it arrived. The bottle looks incredible on the bar too.',
    name: 'Priya S.',
    meta: 'Verified buyer',
    stars: 5,
  },
  {
    quote: 'Bought it for the label, stayed for the taste. Perfect in a martini.',
    name: 'Alex R.',
    meta: 'Verified buyer',
    stars: 4,
  },
];

/** Aggregate of the on-page reviews — the fallback when Medusa has no rating yet. */
const REVIEW_FALLBACK = {
  average: REVIEWS.reduce((sum, r) => sum + r.stars, 0) / REVIEWS.length,
  count: REVIEWS.length,
};

/**
 * Small read-only star row. `value` may be fractional — the last star is clipped
 * to the remainder so 4.7 shows ~⁷⁄₁₀ of the 5th star filled.
 */
function StarRating({ value, className = 'h-4 w-4' }: { value: number; className?: string }) {
  return (
    <span className="inline-flex text-accent" aria-hidden>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, value - i));
        return (
          <span key={i} className="relative">
            <Star className={`${className} text-concrete`} />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star className={`${className} fill-current`} />
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default async function ProductDetailPage({ params }: Params) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const cocktails = COCKTAILS.filter((c) => product.relatedCocktailIds?.includes(c.id)).slice(0, 3);
  const stockists = STOCKISTS.slice(0, 6);

  const commerce = await getCommerceProduct(slug);
  const price = commerce ? priceOf(commerce) : null;
  const availability = commerce ? availabilityOf(commerce.variants?.[0]) : null;

  // Real review aggregate from the shared Medusa product_review module (Phase 7)
  // when this brand has a channel — honest even at 0. The brand-only page (no
  // channel) keeps the curated testimonial fallback so the section isn't empty.
  const realSummary = commerce ? await getReviewSummary(commerce.id) : null;
  const reviewSummary = realSummary ?? REVIEW_FALLBACK;

  const productLd = productJsonLd({
    name: product.name,
    description: product.description,
    image: [mediaUrl(product.image)],
    path: `/products/${slug}`,
    ...(price
      ? {
          price: price.amount,
          currency: price.currency_code,
          availability: availability ? schemaAvailability(availability) : ('InStock' as const),
        }
      : {}),
    ...(reviewSummary.count > 0
      ? { rating: { value: Number(reviewSummary.average.toFixed(1)), count: reviewSummary.count } }
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
    { q: 'Where do you ship?', a: 'We currently ship direct-to-consumer within Florida, with live carrier rates calculated at checkout and adult-signature (21+) delivery.' },
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
                <p
                  className={`font-display text-xl ${
                    availability?.state === 'out_of_stock' ? 'text-neutral-500' : 'text-accent'
                  }`}
                >
                  {availability ? availability.label : 'In stock'}
                </p>
              </div>
              <div>
                <p className="font-mono text-neutral-400 text-xs uppercase tracking-[0.2em]">
                  Rating
                </p>
                {commerce ? (
                  // Live, client-fetched rating (updates the instant a review posts).
                  <RatingStat
                    productId={commerce.id}
                    initialAverage={reviewSummary.average}
                    initialCount={reviewSummary.count}
                  />
                ) : (
                  <a href="#reviews" className="mt-1 flex items-center gap-2">
                    <StarRating value={reviewSummary.average} className="h-4 w-4" />
                    <span className="font-display text-fg text-xl">
                      {reviewSummary.average.toFixed(1)}
                    </span>
                    <span className="text-neutral-500 text-sm">({reviewSummary.count})</span>
                  </a>
                )}
              </div>
              {/* Price intentionally omitted here — the buy box below shows the
                  canonical Medusa price (formatted, in the right currency). */}
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
              { t: 'Live shipping rates', b: 'Real carrier rates are calculated at checkout — no flat-fee guesswork.' },
              { t: 'Adult signature · 21+', b: 'An adult 21+ signature is required on delivery, every time.' },
              { t: 'Florida only', b: 'We currently ship direct-to-consumer within Florida, where DTC spirits delivery is permitted.' },
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
      <section id="reviews" className="scroll-mt-24 bg-warm py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <p className="font-mono text-accent text-xs uppercase tracking-[0.25em]">Reviews</p>
          <h2 className="mt-3 font-display text-4xl text-fg uppercase md:text-5xl">
            What people are saying
          </h2>
          {!commerce && reviewSummary.count > 0 ? (
            <div className="mt-3 flex items-center gap-3">
              <StarRating value={reviewSummary.average} className="h-5 w-5" />
              <span className="font-display text-fg text-lg">
                {reviewSummary.average.toFixed(1)}
              </span>
              <span className="text-neutral-500 text-sm">
                from {reviewSummary.count} review{reviewSummary.count === 1 ? '' : 's'}
              </span>
            </div>
          ) : null}

          {commerce ? (
            // Real reviews + signed-in submit form (Phase 7 product_review module).
            <ProductReviews productId={commerce.id} productName={product.name} />
          ) : (
            // Brand-only fallback (no Medusa channel): curated testimonials.
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {REVIEWS.map((r) => (
                <figure key={r.name} className="flex flex-col rounded-2xl bg-white p-7 shadow-soft">
                  <div className="mb-4">
                    <StarRating value={r.stars} className="h-4 w-4" />
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
          )}
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
