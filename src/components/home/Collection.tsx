import type { Product } from '@/data/products';
import { mediaUrl } from '@/lib/media';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Collection — Refined-Bold product grid (replaces the brutalist bordered grid).
 * Soft rounded cards, full-colour bottle shots, generous spacing. Section copy is
 * Strapi-overridable (passed from the home page); product data is Strapi/seed.
 */
export default function Collection({
  products,
  eyebrow,
  title,
}: {
  products: Product[];
  eyebrow: string;
  title: string;
}) {
  return (
    <section id="collection" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="mb-3 font-mono text-accent text-xs uppercase tracking-[0.25em]">{eyebrow}</p>
            <h2 className="font-display text-4xl text-fg uppercase md:text-6xl">{title}</h2>
          </div>
          <Link
            href="/products"
            className="group inline-flex items-center gap-2 rounded-full border border-neutral-300 px-6 py-3 font-display text-fg text-sm uppercase tracking-wide transition-colors hover:border-fg"
          >
            View all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 md:gap-6 lg:grid-cols-5">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group flex flex-col rounded-2xl bg-neutral-50 p-5 shadow-soft transition-all duration-300 ease-brand hover:-translate-y-1 hover:shadow-soft-lg"
            >
              <div className="relative mb-5 aspect-square overflow-hidden rounded-xl bg-warm">
                <Image
                  alt={product.name}
                  src={mediaUrl(product.image)}
                  fill
                  sizes="(max-width:1024px) 50vw, 20vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="font-mono text-accent text-xs uppercase tracking-widest">{product.proof}</p>
              {/* Reserve 2 lines so 1- and 2-line names keep the rows below aligned across cards. */}
              <h3 className="mt-1 flex min-h-12 items-start font-display text-xl text-fg uppercase transition-colors group-hover:text-accent md:text-2xl">
                {product.name}
              </h3>
              <p className="text-neutral-500 text-sm">{product.category}</p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-4 font-display text-accent text-sm uppercase tracking-wide">
                Explore <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
