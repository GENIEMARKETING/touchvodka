import PageShell from '@/components/PageShell';
import { TastingNotes } from '@/components/vinny/tasting-notes/tasting-notes';
import { COCKTAILS } from '@/data/cocktails';
import { PRODUCTS, getProductBySlug, toTastingNotes } from '@/data/products';
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
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | Touch Vodka`,
      description: product.description,
      images: [product.image],
    },
  };
}

export default async function ProductDetailPage({ params }: Params) {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) notFound();

  const cocktails = COCKTAILS.filter((c) => product.relatedCocktailIds?.includes(c.id));

  return (
    <PageShell>
      {/* schema.org Product (SEO; the Vite build set this client-side, here it's SSR) */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: static JSON-LD
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            description: product.description,
            brand: { '@type': 'Brand', name: 'Touch Vodka' },
            category: product.category,
          }),
        }}
      />

      <section className="grid grid-cols-1 border-black border-b-4 lg:grid-cols-2">
        <div className="relative flex items-center justify-center border-black border-b-4 bg-neutral-50 p-12 lg:border-r-4 lg:border-b-0">
          <Image
            alt={product.name}
            src={product.image}
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
