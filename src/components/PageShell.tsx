import type { ReactNode } from 'react';
import Header from './Header';
import SiteFooterData from './SiteFooterData';

/** Standard inner-page chrome: header + content + footer (footer copy from Strapi site-config). */
export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-fg">
      <Header />
      <main>{children}</main>
      <SiteFooterData />
    </div>
  );
}

/**
 * PageHero — Refined-Bold inner-page banner (eyebrow + title + optional lead) on
 * a warm band that echoes the home hero (Figma banner pattern, PLP/Cocktails/
 * Blog/Find Us). An optional oversized `watermark` word sits faint behind the
 * copy, matching the Figma `Display/Watermark` treatment.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
  watermark,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  watermark?: string;
}) {
  return (
    <section className="relative overflow-hidden bg-warm py-20 md:py-28 lg:py-32">
      {watermark ? (
        <span
          aria-hidden
          className="pointer-events-none absolute right-0 bottom-0 select-none font-display text-[clamp(3.5rem,13vw,11rem)] text-black/[0.04] uppercase leading-[0.8] tracking-tight"
        >
          {watermark}
        </span>
      ) : null}
      <div className="relative mx-auto max-w-7xl px-6 md:px-10">
        <p className="mb-3 font-mono text-accent text-xs uppercase tracking-[0.25em]">{eyebrow}</p>
        <h1 className="mb-6 font-display text-5xl text-fg uppercase md:text-7xl lg:text-8xl">{title}</h1>
        {lead ? (
          <p className="max-w-3xl text-lg text-neutral-600 leading-relaxed md:text-xl">{lead}</p>
        ) : null}
      </div>
    </section>
  );
}
