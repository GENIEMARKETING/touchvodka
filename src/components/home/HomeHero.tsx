'use client';

import { ScrollReveal, TextSplit } from '@geniemarketing/ui/motion';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * HomeHero — single full-bleed hero (Refined-Bold redesign 2026-06).
 *
 * One cinematic image (no split). The Higgsfield hero is composed for a
 * left-to-right eye-flow (the design-workflow "eye-flow composition" principle):
 * clean negative space on the LEFT holds the headline; the bottle pour forms a
 * diagonal leading line on the RIGHT → glass → CTA. A left-side scrim keeps the
 * headline legible over the warm image. The product carousel + spec panel now
 * live in the Collection section below (this hero is brand-led, like Tito's).
 *
 * Motion uses the house primitives (TextSplit / ScrollReveal) so the reduced-
 * motion + will-change guards `preflight` enforces are handled for us.
 */
export default function HomeHero() {
  return (
    <section className="-mt-20 relative flex h-[92vh] min-h-[600px] w-full items-center overflow-hidden">
      {/* Full-bleed hero image (eye-flow composed) */}
      <Image
        src="/hero/touch-hero.webp"
        alt="Touch Vodka poured over ice with a citrus twist"
        fill
        priority
        sizes="100vw"
        className="object-cover object-right"
      />
      {/* Left readability scrim — fades into the bottle/pour on the right */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-white/90 via-white/45 to-transparent" />

      {/* Overlay — left-aligned, riding the negative space */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-20 md:px-10">
        <div className="max-w-xl">
          <ScrollReveal>
            <p className="mb-4 font-mono text-accent text-sm uppercase tracking-[0.25em]">
              10× Distilled · Crafted in Tampa, Florida
            </p>
          </ScrollReveal>

          <TextSplit
            by="word"
            as="h1"
            className="font-display text-5xl text-fg uppercase md:text-7xl lg:text-8xl"
          >
            Crafted with tradition
          </TextSplit>

          <ScrollReveal className="mt-6 max-w-md">
            <p className="text-lg text-neutral-700 leading-relaxed">
              A smooth, elegant vodka distilled ten times for an exceptionally clean,
              refined finish — made for good company.
            </p>
          </ScrollReveal>

          <ScrollReveal className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 font-display text-lg text-white shadow-brand-glow transition-transform duration-300 ease-brand hover:-translate-y-0.5"
            >
              Shop the Collection <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/cocktails"
              className="inline-flex items-center justify-center rounded-full border border-neutral-400/60 bg-white/85 px-8 py-4 font-display text-fg text-lg transition-colors duration-300 hover:bg-fg hover:text-surface"
            >
              Find Recipes
            </Link>
          </ScrollReveal>
        </div>
      </div>

      {/* subtle scroll cue */}
      <div className="-translate-x-1/2 absolute bottom-6 left-1/2 z-10 hidden flex-col items-center gap-1 text-neutral-500 md:flex">
        <span className="font-mono text-[10px] uppercase tracking-[0.3em]">Scroll</span>
        <span className="h-8 w-px animate-pulse bg-neutral-400" />
      </div>
    </section>
  );
}
