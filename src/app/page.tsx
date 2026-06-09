import Header from '@/components/Header';
import SiteFooter from '@/components/SiteFooter';
import HomeHero from '@/components/home/HomeHero';
import { getSiteProducts } from '@/lib/strapi';
import { Droplets, Sprout, Waves } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Home — composed server component. Products come from the shared Strapi (S6),
 * falling back to the local seed pre-migration. The interactive hero is the only
 * client island; the collection + process sections render on the server.
 */
export default async function Home() {
  const products = await getSiteProducts();

  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      <HomeHero products={products} />

      {/* Collection */}
      <section id="collection" className="border-black border-b-4">
        <div className="flex flex-col items-start justify-between gap-6 border-black border-b-4 bg-neutral-50 p-8 md:flex-row md:items-center md:p-12">
          <div>
            <span className="mb-2 block font-bold text-accent text-sm tracking-[0.3em]">
              {'// 01_CATALOGUE'}
            </span>
            <h2 className="text-5xl md:text-7xl">The Touch Collection</h2>
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
                  src={product.image}
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
          <span className="mb-6 block font-bold text-accent tracking-[0.3em]">
            {'// PROCESS_REPORT_04'}
          </span>
          <h2 className="mb-10 text-7xl md:text-9xl">The Art of Distillation</h2>
          <p className="border-accent border-l-8 pl-8 font-mono text-lg leading-relaxed lowercase opacity-80 md:text-xl">
            Crafted with passion and precision, our proprietary process ensures the smoothest finish
            in every bottle. We don't just make spirits; we engineer experiences.
          </p>
          <Link
            href="/our-story"
            className="mt-12 w-fit bg-black px-12 py-5 font-display text-3xl text-white transition-all hover:-translate-y-1 hover:bg-accent active:translate-y-0"
          >
            Learn_More
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:col-span-2">
          <div className="group border-black border-r-2 border-b-2 bg-white p-10 transition-colors hover:bg-accent hover:text-white">
            <Sprout className="mb-8 h-12 w-12 text-accent group-hover:text-white" />
            <h3 className="mb-4 text-4xl">Premium Grains</h3>
            <p className="font-mono text-sm lowercase opacity-70 group-hover:opacity-100">
              Sourced from the finest local fields, our winter wheat provides a silky texture and a
              naturally sweet finish.
            </p>
          </div>
          <div className="group border-black border-b-2 bg-neutral-50 p-10 transition-colors hover:bg-accent hover:text-white">
            <Droplets className="mb-8 h-12 w-12 text-accent group-hover:text-white" />
            <h3 className="mb-4 text-4xl">10X Distilled</h3>
            <p className="font-mono text-sm lowercase opacity-70 group-hover:opacity-100">
              Refined exactly ten times for exceptional clarity, then charcoal filtered to remove
              impurities while keeping character.
            </p>
          </div>
          <div className="group border-black border-r-2 bg-neutral-100 p-10 transition-colors hover:bg-accent hover:text-white sm:col-span-2">
            <Waves className="mb-8 h-12 w-12 text-accent group-hover:text-white" />
            <h3 className="mb-4 text-4xl">Pure Spring Water</h3>
            <p className="max-w-md font-mono text-sm lowercase opacity-70 group-hover:opacity-100">
              Blended with pristine, mineral-rich water from natural protected springs for a crisp,
              clean taste that defines our signature profile.
            </p>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
