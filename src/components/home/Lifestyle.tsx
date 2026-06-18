import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

/**
 * Lifestyle — Refined-Bold brand-moment block (new section, inspired by the
 * "Anywhere with…" feature on the reference site). Copy is the real Touch brand
 * voice harvested from Our Story + the footer. The image panel is a designed
 * placeholder until the lifestyle photography lands in the asset pass.
 */
export default function Lifestyle() {
  return (
    <section className="bg-warm py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 md:px-10 lg:grid-cols-2 lg:gap-16">
        {/* Placeholder for lifestyle photography — replaced in the asset pass */}
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-100 via-neutral-50 to-accent/10 shadow-soft">
          <span className="font-mono text-neutral-400 text-xs uppercase tracking-[0.25em]">
            Lifestyle photography · asset pass
          </span>
        </div>

        <div>
          <p className="mb-3 font-mono text-accent text-xs uppercase tracking-[0.25em]">The good company</p>
          <h2 className="mb-6 font-display text-4xl text-fg uppercase md:text-5xl">
            Anywhere with good company
          </h2>
          <p className="mb-5 text-lg text-neutral-600 leading-relaxed">
            From sunset balconies to long kitchen-table nights, Touch is made for the moments worth
            slowing down for. A smooth, refined pour that brings people together — and keeps the
            conversation going.
          </p>
          <p className="mb-8 text-neutral-600 leading-relaxed">
            Crafted for those who appreciate the finer details. Elevating spirits since 2012, in
            Tampa, Florida.
          </p>
          <Link
            href="/our-story"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-300 px-7 py-3.5 font-display text-fg transition-colors hover:border-fg"
          >
            Our story <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
