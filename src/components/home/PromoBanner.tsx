import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

/**
 * PromoBanner — the home "LIMITED RELEASE / DISCOVER TOUCH KEY LIME" band
 * (Figma home Promo section). A warm-dark interstitial between the Stats and
 * Featured Recipes that drives to the Key Lime PDP. Static copy for now; the
 * featured SKU can move to Strapi site-config later.
 */
export default function PromoBanner() {
  return (
    <section className="bg-[#c9b79a] text-fg">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-6 py-16 md:flex-row md:items-center md:px-10 md:py-20">
        <div className="max-w-2xl">
          <p className="mb-3 font-mono text-fg/60 text-xs uppercase tracking-[0.25em]">
            Limited Release
          </p>
          <h2 className="font-display text-4xl text-fg uppercase md:text-5xl">
            Discover Touch Key Lime
          </h2>
          <p className="mt-4 max-w-md text-fg/70 leading-relaxed">
            Bright Florida citrus, 10× distilled. The taste of the Gulf at golden hour — for a
            limited run.
          </p>
        </div>
        <Link
          href="/products/touch-key-lime"
          className="inline-flex shrink-0 items-center gap-2 rounded-full bg-accent px-8 py-4 font-display text-lg text-white shadow-brand-glow transition-transform duration-300 ease-brand hover:-translate-y-0.5"
        >
          Shop Key Lime <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
