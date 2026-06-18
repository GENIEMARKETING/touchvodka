import PageShell, { PageHero } from '@/components/PageShell';
import { AddToCart } from '@/components/vinny/commerce/add-to-cart';
import { getCommerceProducts } from '@/lib/commerce';
import { mediaUrl } from '@/lib/media';
import { pageMetadata } from '@/lib/seo';
import { getSiteProducts } from '@/lib/strapi';
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
  // Brand catalogue (Strapi/seed) drives the editorial card; Medusa — matched by
  // handle == slug — hydrates the price + quick-add. Empty until S6/S3 wires the
  // channel, so the card silently has no buy button rather than breaking.
  const [products, commerceProducts] = await Promise.all([
    getSiteProducts(),
    getCommerceProducts(),
  ]);
  const byHandle = new Map(commerceProducts.map((p) => [p.handle, p]));

  return (
    <PageShell>
      <PageHero
        eyebrow="The Collection"
        title="The Collection"
        lead="Five expressions, one obsession with the smoothest finish. Each bottle is 10x distilled and charcoal filtered."
      />
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 py-20 sm:grid-cols-2 md:px-10 md:py-28 lg:grid-cols-3">
        {products.map((product) => {
          const mp = byHandle.get(product.slug);
          return (
            <div
              key={product.id}
              className="group flex flex-col rounded-3xl bg-neutral-50 p-6 shadow-soft transition-all duration-300 ease-brand hover:-translate-y-1 hover:shadow-soft-lg"
            >
              <Link href={`/products/${product.slug}`} className="flex flex-1 flex-col">
                <div className="relative mb-6 aspect-square overflow-hidden rounded-2xl bg-warm">
                  <Image
                    alt={product.name}
                    src={mediaUrl(product.image)}
                    fill
                    sizes="(max-width:1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 rounded-full bg-white/90 px-3 py-1 font-mono text-accent text-xs uppercase tracking-wider shadow-sm">
                    {product.proof}
                  </div>
                </div>
                {/* Reserve 2 lines so 1- and 2-line names keep the rows below aligned across cards. */}
                <h2 className="mb-1 flex min-h-16 items-start font-display text-2xl text-fg uppercase transition-colors group-hover:text-accent md:text-3xl">
                  {product.name}
                </h2>
                <p className="mb-3 text-neutral-500 text-sm">{product.category}</p>
                <p className="text-neutral-600 leading-relaxed">{product.tagline}</p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-6 font-display text-accent text-sm uppercase tracking-wide">
                  Explore →
                </span>
              </Link>
              {mp ? (
                <div className="mt-6">
                  <AddToCart product={mp} layout="compact" />
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
