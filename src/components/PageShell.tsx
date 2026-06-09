import type { ReactNode } from 'react';
import Header from './Header';
import SiteFooter from './SiteFooter';

/** Standard inner-page chrome: brutalist header + content + footer. */
export default function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-black">
      <Header />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

/** Reusable brutalist page hero (eyebrow + title + lead). */
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
    <section className="border-black border-b-4 bg-neutral-50 p-8 md:p-12 lg:p-16">
      <div className="mx-auto max-w-6xl">
        <span className="mb-4 block font-bold text-accent text-sm tracking-[0.3em]">{eyebrow}</span>
        <h1 className="mb-8 font-display text-6xl uppercase leading-[0.85] md:text-8xl lg:text-9xl">
          {title}
        </h1>
        {lead ? (
          <p className="max-w-3xl border-accent border-l-4 pl-8 font-mono text-lg leading-relaxed lowercase opacity-80 md:text-xl">
            {lead}
          </p>
        ) : null}
      </div>
    </section>
  );
}
