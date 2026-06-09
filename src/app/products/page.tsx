import PageShell, { PageHero } from '@/components/PageShell';
import { getSiteProducts } from '@/lib/strapi';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'The Collection',
  description:
    'Explore the full Touch Vodka collection — artisan-distilled, 10x refined premium spirits.',
};

export default async function ProductsPage() {
  const products = await getSiteProducts();

  return (
    <PageShell>
      <PageHero
        eyebrow="// 01_CATALOGUE"
        title="The Collection"
        lead="Five expressions, one obsession with the smoothest finish. Each bottle is 10x distilled and charcoal filtered."
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group flex flex-col border-black border-r-2 border-b-2 p-8 transition-colors hover:bg-neutral-50"
          >
            <div className="relative mb-6 aspect-[3/4] overflow-hidden border border-neutral-200 bg-neutral-100">
              <Image
                alt={product.name}
                src={product.image}
                fill
                sizes="(max-width:1024px) 50vw, 33vw"
                className="scale-90 object-contain p-6 grayscale transition-all duration-500 group-hover:scale-100 group-hover:grayscale-0"
              />
              <div className="absolute top-0 right-0 bg-black p-1.5 font-bold text-[10px] text-white">
                {product.proof}
              </div>
            </div>
            <h2 className="mb-1 text-3xl transition-colors group-hover:text-accent">
              {product.name}
            </h2>
            <p className="mb-4 font-mono text-[10px] text-neutral-500 lowercase tracking-wider">
              {product.category}
            </p>
            <p className="font-mono text-sm lowercase opacity-70">{product.tagline}</p>
            <span className="mt-auto pt-6 font-display text-accent text-xl group-hover:underline">
              Explore →
            </span>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
