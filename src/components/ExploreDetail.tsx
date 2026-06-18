import PageShell from '@/components/PageShell';
import type { Cocktail } from '@/data/cocktails';
import { titleCase } from '@/data/cocktails';
import { ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * ExploreDetail — the shared City / Season / Occasion detail template (Figma City
 * Detail 510:2336; seasons/occasions reuse it). Hero → optional "why here"
 * feature cards (cities) → Signature Serve → CTA. The Area-Interest strip in the
 * footer (site-wide) covers the geo capture.
 */
export default function ExploreDetail({
  eyebrow,
  title,
  blurb,
  serve,
  heroImage,
  features,
  extra,
  exploreHref,
  exploreLabel,
}: {
  eyebrow: string;
  title: string;
  blurb: string;
  serve?: Cocktail;
  heroImage?: string;
  features?: Array<{ title: string; body: string }>;
  /** Optional content rendered inside the shell, after the serve, before the CTA. */
  extra?: ReactNode;
  exploreHref: string;
  exploreLabel: string;
}) {
  const heroArt = heroImage ?? serve?.image ?? '/products/one.png';
  return (
    <PageShell>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <div className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-warm">
            <Image
              src={heroArt}
              alt={title}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 560px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-mono text-accent text-xs uppercase tracking-[0.25em]">{eyebrow}</p>
            <h1 className="mt-3 font-display text-5xl text-fg uppercase md:text-6xl">{title}</h1>
            <p className="mt-5 max-w-md text-lg text-neutral-600 leading-relaxed">{blurb}</p>
          </div>
        </div>
      </section>

      {/* Why here — feature cards (cities only). */}
      {features && features.length > 0 ? (
        <section className="bg-warm py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-6 md:px-10">
            <h2 className="font-display text-3xl text-fg uppercase md:text-4xl">
              Why Touch belongs here
            </h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {features.map((f) => (
                <div key={f.title} className="rounded-2xl bg-white p-6 shadow-soft">
                  <h3 className="font-display text-fg text-xl">{f.title}</h3>
                  <p className="mt-2 text-neutral-600 leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* Signature serve */}
      {serve ? (
        <section className="py-16 md:py-24">
          <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 md:grid-cols-2 md:px-10 lg:gap-16">
            <div>
              <p className="font-mono text-accent text-xs uppercase tracking-[0.25em]">
                Signature serve
              </p>
              <h2 className="mt-3 font-display text-4xl text-fg md:text-5xl">
                {titleCase(serve.name)}
              </h2>
              <p className="mt-4 max-w-md text-neutral-600 leading-relaxed">{serve.description}</p>
              <Link
                href={`/cocktails/${serve.slug}`}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 font-display text-lg text-white shadow-brand-glow transition-transform duration-300 ease-brand hover:-translate-y-0.5"
              >
                View the recipe <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative order-first aspect-[4/3] overflow-hidden rounded-3xl bg-warm md:order-last">
              <Image
                src={serve.image}
                alt={serve.name}
                fill
                sizes="(max-width: 768px) 100vw, 560px"
                className="object-cover"
              />
            </div>
          </div>
        </section>
      ) : null}

      {extra}

      {/* CTA */}
      <section className="bg-[#e9e0d0] py-16 text-center md:py-24">
        <div className="mx-auto max-w-2xl px-6">
          <h2 className="font-display text-4xl text-fg md:text-5xl">Bring Touch to you</h2>
          <p className="mt-4 text-neutral-600 leading-relaxed">
            Find a bottle near you, or keep exploring.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/find-us"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 font-display text-lg text-white shadow-brand-glow transition-transform duration-300 ease-brand hover:-translate-y-0.5"
            >
              Find a store <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={exploreHref}
              className="inline-flex items-center justify-center rounded-full bg-fg px-8 py-4 font-display text-lg text-white transition-transform duration-300 ease-brand hover:-translate-y-0.5"
            >
              {exploreLabel}
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
