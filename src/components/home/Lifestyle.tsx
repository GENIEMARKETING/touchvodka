import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

/**
 * Lifestyle — Refined-Bold brand-moment block ("Anywhere with good company").
 * Copy is the real Touch brand voice. The image is the golden-hour Tampa rooftop
 * "good company" scene (Higgsfield, optimized → public/scenes/lifestyle.webp).
 */
export default function Lifestyle() {
  return (
    <section className="bg-warm py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 md:px-10 lg:grid-cols-2 lg:gap-16">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-warm shadow-soft">
          <Image
            src="/scenes/lifestyle.webp"
            alt="Friends sharing Touch cocktails at golden hour on a Tampa rooftop"
            fill
            sizes="(max-width: 1024px) 100vw, 600px"
            className="object-cover"
          />
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
