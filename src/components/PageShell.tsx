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
 * PageHero — Refined-Bold inner-page header (eyebrow + title + optional lead) on
 * a warm band that echoes the home hero. Replaces the brutalist bordered hero.
 */
export function PageHero({
  eyebrow,
  title,
  lead,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
}) {
  return (
    <section className="bg-warm py-20 md:py-28 lg:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <p className="mb-3 font-mono text-accent text-xs uppercase tracking-[0.25em]">{eyebrow}</p>
        <h1 className="mb-6 font-display text-5xl text-fg uppercase md:text-7xl lg:text-8xl">{title}</h1>
        {lead ? (
          <p className="max-w-3xl text-lg text-neutral-600 leading-relaxed md:text-xl">{lead}</p>
        ) : null}
      </div>
    </section>
  );
}
