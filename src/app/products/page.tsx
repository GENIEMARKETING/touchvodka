import PageShell, { PageHero } from '@/components/PageShell';
import { mediaUrl } from '@/lib/media';
import { pageMetadata } from '@/lib/seo';
import { getSiteProducts } from '@/lib/strapi';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = pageMetadata({
  title: 'The Collection',
  description:
    'Explore the full Touch Vodka collection — artisan-distilled, 10x refined premium spirits.',
  path: '/products',
});

export default async function ProductsPage() {
  const products = await getSiteProducts();

  return (
    <PageShell>
      <PageHero
        eyebrow="Five expressions"
        title="The Collection"
        watermark="Collection"
        lead="Five expressions, one obsession with the smoothest finish. Each bottle is 10× distilled and charcoal filtered."
      />
      {/* Editorial PLP cards (Figma 45:32): warm image → proof eyebrow → name →
          category → Explore. Buying lives on the PDP, so no inline add-to-cart. */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-16 sm:grid-cols-2 md:px-10 md:py-24 lg:grid-cols-3">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group flex flex-col overflow-hidden rounded-2xl border border-concrete/60 bg-white shadow-soft transition-all duration-300 ease-brand hover:-translate-y-1 hover:shadow-soft-lg"
          >
            <div className="relative aspect-[4/5] overflow-hidden bg-warm">
              <Image
                alt={product.name}
                src={mediaUrl(product.image)}
                fill
                sizes="(max-width:1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <p className="font-mono text-accent text-xs uppercase tracking-[0.2em]">
                {product.proof}
              </p>
              <h2 className="mt-2 font-display text-2xl text-fg uppercase transition-colors group-hover:text-accent">
                {product.name}
              </h2>
              <p className="mt-1 text-neutral-500 text-sm">{product.category}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-6 font-display text-accent text-sm">
                Explore
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
