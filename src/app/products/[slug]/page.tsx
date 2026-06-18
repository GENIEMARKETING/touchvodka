import PageShell from '@/components/PageShell';
import { AddToCart } from '@/components/vinny/commerce/add-to-cart';
import { TastingNotes } from '@/components/vinny/tasting-notes/tasting-notes';
import { COCKTAILS } from '@/data/cocktails';
import { PRODUCTS, getProductBySlug, toTastingNotes } from '@/data/products';
import { getCommerceProduct, priceOf } from '@/lib/commerce';
import { mediaUrl } from '@/lib/media';
import { breadcrumbJsonLd, jsonLdScript, pageMetadata, productJsonLd } from '@/lib/seo';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

type Params = { params: Promise<{ slug: string }> };

// Pre-render every product (SSG); pre-migration the seed is the source of truth.
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

export default async function ProductDetailPage({ params }: Params) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const cocktails = COCKTAILS.filter((c) => product.relatedCocktailIds?.includes(c.id));

  // Hydrate price/availability from Medusa when this brand has a sales channel
  // (S6/S3 + S10). Until then `commerce` is null and the Product JSON-LD emits
  // truthfully with no Offer — see lib/seo.productJsonLd.
  const commerce = await getCommerceProduct(slug);
  const price = commerce ? priceOf(commerce) : null;

  // schema.org Product + BreadcrumbList via @geniemarketing/seo (SSR; was hand-rolled
  // client-side in the Vite build, which drifted from the catalog).
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

  return (
    <PageShell>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD; jsonLdScript escapes "<".
        dangerouslySetInnerHTML={{ __html: jsonLdScript([productLd, breadcrumbLd]) }}
      />

      <section className="bg-warm py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-6 md:px-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-square overflow-hidden rounded-3xl bg-warm shadow-soft">
            <Image
              alt={product.name}
              src={mediaUrl(product.image)}
              fill
              sizes="(max-width:1024px) 100vw, 50vw"
              priority
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit rounded-full bg-accent/10 px-4 py-1.5 font-mono text-accent text-xs uppercase tracking-widest">
              {product.category}
            </span>
            <h1 className="mb-5 font-display text-5xl text-fg uppercase md:text-7xl">
              {product.name}
            </h1>
            <p className="mb-8 text-lg text-neutral-600 leading-relaxed">{product.description}</p>
            <dl className="grid grid-cols-2 gap-6">
              <div>
                <dt className="font-mono text-accent text-xs uppercase tracking-widest">Proof</dt>
                <dd className="mt-1 font-display text-fg text-xl">{product.proof}</dd>
              </div>
              <div>
                <dt className="font-mono text-accent text-xs uppercase tracking-widest">Process</dt>
                <dd className="mt-1 text-fg">{product.distillationProcess}</dd>
              </div>
            </dl>

            {/* S10: DTC buy box — only renders when this brand has a live Medusa
                channel (commerce != null); otherwise the PDP stays brand-only. */}
            {commerce ? (
              <div className="mt-8">
                <AddToCart product={commerce} />
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* REUSED shared block (S4): tasting-notes from @geniemarketing/blocks */}
      <TastingNotes heading={`${product.name} — Tasting Notes`} notes={toTastingNotes(product)} />

      <section className="mx-auto max-w-5xl px-6 py-12 md:px-10">
        <h3 className="mb-6 font-display text-2xl text-fg uppercase">Pairings</h3>
        <ul className="flex flex-wrap gap-3">
          {product.tastingNotes.pairings.map((p) => (
            <li
              key={p}
              className="rounded-full border border-neutral-300 px-5 py-2 text-neutral-700 text-sm"
            >
              {p}
            </li>
          ))}
        </ul>
      </section>

      {cocktails.length > 0 ? (
        <section className="mx-auto max-w-5xl px-6 pb-24 md:px-10">
          <h3 className="mb-6 font-display text-2xl text-fg uppercase">Make it into</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {cocktails.map((c) => (
              <Link
                key={c.id}
                href="/cocktails"
                className="group flex flex-col rounded-2xl bg-neutral-50 p-6 shadow-soft transition-all duration-300 ease-brand hover:-translate-y-1 hover:shadow-soft-lg"
              >
                <p className="font-display text-2xl text-fg uppercase transition-colors group-hover:text-accent">
                  {c.name}
                </p>
                <p className="mt-1 text-neutral-600">{c.tagline}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </PageShell>
  );
}
