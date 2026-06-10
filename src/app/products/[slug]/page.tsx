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

      <section className="grid grid-cols-1 border-black border-b-4 lg:grid-cols-2">
        <div className="relative flex items-center justify-center border-black border-b-4 bg-neutral-50 p-12 lg:border-r-4 lg:border-b-0">
          <Image
            alt={product.name}
            src={mediaUrl(product.image)}
            width={500}
            height={700}
            priority
            className="h-auto w-auto max-w-xs object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.2)]"
          />
        </div>
        <div className="flex flex-col justify-center p-8 md:p-16">
          <span className="mb-2 inline-block w-fit bg-accent px-3 py-1 font-bold text-sm text-white">
            ID: {product.id}
          </span>
          <h1 className="my-6 font-display text-6xl uppercase leading-[0.85] md:text-7xl">
            {product.name}
          </h1>
          <p className="mb-8 font-mono text-lg lowercase opacity-80">{product.description}</p>
          <dl className="grid grid-cols-2 gap-4 font-mono text-sm">
            <div className="border-black border-l-4 pl-4">
              <dt className="text-accent text-xs uppercase tracking-widest">Proof</dt>
              <dd>{product.proof}</dd>
            </div>
            <div className="border-black border-l-4 pl-4">
              <dt className="text-accent text-xs uppercase tracking-widest">Process</dt>
              <dd className="lowercase">{product.distillationProcess}</dd>
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
      </section>

      {/* REUSED shared block (S4): tasting-notes from @geniemarketing/blocks */}
      <TastingNotes heading={`${product.name} — Tasting Notes`} notes={toTastingNotes(product)} />

      <section className="mx-auto max-w-5xl px-6 pb-8">
        <h3 className="mb-6 font-display text-2xl uppercase">Pairings</h3>
        <ul className="flex flex-wrap gap-3 font-mono text-sm lowercase">
          {product.tastingNotes.pairings.map((p) => (
            <li key={p} className="border-2 border-black px-4 py-2">
              {p}
            </li>
          ))}
        </ul>
      </section>

      {cocktails.length > 0 ? (
        <section className="mx-auto max-w-5xl px-6 py-16">
          <h3 className="mb-6 font-display text-2xl uppercase">Make it into</h3>
          {cocktails.map((c) => (
            <Link
              key={c.id}
              href="/cocktails"
              className="block border-4 border-black p-6 transition-colors hover:bg-accent hover:text-white"
            >
              <p className="font-display text-3xl">{c.name}</p>
              <p className="font-mono text-sm lowercase opacity-70">{c.tagline}</p>
            </Link>
          ))}
        </section>
      ) : null}
    </PageShell>
  );
}
