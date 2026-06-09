'use client';

import type { Product } from '@/data/products';
import { capture } from '@geniemarketing/foundation/tracking';
import { ArrowRight, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

/**
 * HomeHero — Touch Vodka's bespoke brutalist hero + product carousel + a
 * slide-over "spec panel" (tasting notes). Ported from the Vite App.tsx, with
 * framer-motion swapped for CSS transitions and <img> swapped for next/image.
 *
 * Analytics: a "view spec" click is reported via the consent-gated `capture`
 * (no-op until analytics consent), so the funnel sees product interest without
 * any pre-consent tracking.
 */
export default function HomeHero({ products }: { products: Product[] }) {
  const [active, setActive] = useState<Product>(products[0] as Product);
  const [specOpen, setSpecOpen] = useState(false);

  function openSpec() {
    setSpecOpen(true);
    capture('product_spec_viewed', { product: active.id });
  }

  return (
    <section className="flex min-h-[calc(100vh-6rem)] overflow-hidden border-black border-b-4">
      {/* Left: headline + CTAs */}
      <div className="relative flex w-full flex-col justify-end border-black border-r-4 bg-neutral-50 p-8 md:p-12 lg:w-[45%]">
        <div key={active.id} className="relative z-10 animate-[fadein_.4s_ease-out]">
          <div className="mb-6">
            <span className="mb-2 inline-block bg-accent px-3 py-1 font-bold text-sm text-white">
              ID: {active.id}
            </span>
            <br />
            <span className="font-bold text-accent text-lg tracking-widest md:text-xl">
              [ {active.category} ]
            </span>
          </div>

          <h1 className="mb-12 max-w-full break-words text-5xl uppercase leading-[0.9] md:text-7xl lg:text-8xl">
            {active.tagline.split(' ').map((word) => (
              <span key={word} className="block">
                {word}
              </span>
            ))}
          </h1>

          <div className="flex flex-col gap-3">
            <Link
              href="/products"
              className="block w-full bg-accent py-5 text-center font-display text-3xl text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:bg-black hover:shadow-none active:translate-y-1 md:text-4xl"
            >
              Discover_Collection
            </Link>
            <Link
              href="/our-story"
              className="block w-full border-4 border-black bg-white py-5 text-center font-display text-3xl text-black transition-colors hover:bg-black hover:text-white md:text-4xl"
            >
              Our_Story
            </Link>
          </div>
        </div>

        <div className="-translate-x-1/2 -translate-y-1/2 pointer-events-none absolute top-1/2 left-1/2 select-none whitespace-nowrap font-display text-[20vw] opacity-[0.03]">
          {active.name}
        </div>
      </div>

      {/* Right: product carousel */}
      <div className="group relative flex w-full flex-col overflow-hidden bg-transparent lg:w-[55%]">
        <div className="relative flex-grow overflow-hidden bg-transparent">
          <div
            key={active.id}
            className="absolute inset-0 flex animate-[fadein_.6s_ease-out] items-center justify-center"
          >
            <Image
              alt={active.name}
              src={active.image}
              width={600}
              height={800}
              priority
              className="h-full w-auto object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.2)]"
            />
          </div>

          {/* Beacon → spec panel */}
          <button
            type="button"
            onClick={openSpec}
            aria-label={`View spec for ${active.name}`}
            style={{ top: active.beaconPosition?.top, left: active.beaconPosition?.left }}
            className="absolute z-20 h-6 w-6 animate-pulse rounded-full border-2 border-white bg-accent shadow-lg"
          />

          {/* Carousel dots */}
          <div className="-translate-x-1/2 absolute bottom-8 left-1/2 z-20 flex gap-3">
            {products.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-label={`Show ${p.name}`}
                onClick={() => setActive(p)}
                className={`h-3 w-3 border-2 border-black transition-all ${
                  active.id === p.id
                    ? 'scale-125 border-accent bg-accent'
                    : 'bg-transparent hover:bg-black/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Spec panel (slide-over). The backdrop is a real <button> so closing is
          keyboard-accessible (Esc-like Enter/Space) — satisfies a11y lint. */}
      {specOpen ? (
        <div className="fixed inset-0 z-[150] flex justify-end">
          <button
            type="button"
            aria-label="Close spec panel"
            className="absolute inset-0 h-full w-full bg-black/40"
            onClick={() => setSpecOpen(false)}
          />
          <aside className="relative flex h-full w-full max-w-md flex-col overflow-auto border-black border-l-4 bg-white p-8">
            <div className="mb-8 flex items-start justify-between">
              <h2 className="font-display text-4xl uppercase">{active.name}</h2>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setSpecOpen(false)}
                className="border-2 border-black p-2"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="mb-6 font-mono text-sm lowercase opacity-70">{active.description}</p>
            <dl className="space-y-4 font-mono text-sm">
              <div>
                <dt className="font-bold text-accent uppercase tracking-widest">Nose</dt>
                <dd className="lowercase opacity-80">{active.tastingNotes.nose}</dd>
              </div>
              <div>
                <dt className="font-bold text-accent uppercase tracking-widest">Palate</dt>
                <dd className="lowercase opacity-80">{active.tastingNotes.palate}</dd>
              </div>
              <div>
                <dt className="font-bold text-accent uppercase tracking-widest">Finish</dt>
                <dd className="lowercase opacity-80">{active.tastingNotes.finish}</dd>
              </div>
              <div>
                <dt className="font-bold text-accent uppercase tracking-widest">Proof</dt>
                <dd className="lowercase opacity-80">
                  {active.proof} · {active.distillationProcess}
                </dd>
              </div>
            </dl>
            <Link
              href={`/products/${active.slug}`}
              className="mt-auto flex items-center justify-center gap-2 border-4 border-black bg-accent py-4 font-display text-2xl text-white transition-colors hover:bg-black"
            >
              Explore <ArrowRight className="h-5 w-5" />
            </Link>
          </aside>
        </div>
      ) : null}
    </section>
  );
}
