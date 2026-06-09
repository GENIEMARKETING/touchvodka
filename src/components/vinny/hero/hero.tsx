'use client';

import { buttonVariants } from '@vinny/ui';
import { ParallaxImage, ScrollReveal, TextSplit } from '@vinny/ui/motion';

/**
 * Hero — full-bleed brand opener.
 *
 * Variant-not-configuration: four content-only props. If you need a different
 * layout (split hero, video hero), that's a NEW block — don't add a `layout` prop.
 * You own this copy; restyle freely.
 */
export type HeroProps = {
  eyebrow?: string;
  headline: string;
  sublead?: string;
  cta: { label: string; href: string };
};

export function Hero({ eyebrow, headline, sublead, cta }: HeroProps) {
  return (
    <section className="relative grid min-h-[88vh] place-items-center overflow-hidden">
      <ParallaxImage
        src="/hero.jpg"
        alt=""
        speed={0.3}
        className="absolute inset-0 -z-10 h-full w-full"
      />
      <div className="absolute inset-0 -z-10 bg-black/45" />

      <div className="mx-auto max-w-3xl px-6 text-center text-white">
        {eyebrow ? (
          <p className="mb-4 text-sm uppercase tracking-[0.3em] opacity-80">{eyebrow}</p>
        ) : null}
        <TextSplit by="word" as="h1" className="font-bold text-5xl leading-tight md:text-7xl">
          {headline}
        </TextSplit>
        {sublead ? (
          <ScrollReveal className="mt-6">
            <p className="mx-auto max-w-xl text-lg opacity-90">{sublead}</p>
          </ScrollReveal>
        ) : null}
        <ScrollReveal className="mt-10">
          {/* Anchor styled as a Button so the CTA is a real link (SEO + a11y). */}
          <a href={cta.href} className={buttonVariants({ size: 'lg' })}>
            {cta.label}
          </a>
        </ScrollReveal>
      </div>
    </section>
  );
}
