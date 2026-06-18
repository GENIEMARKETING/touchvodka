import PageShell from '@/components/PageShell';
import type { ReactNode } from 'react';

/**
 * LegalLayout — the shared legal-page shell (Figma 61:62). Plain white page (no
 * warm banner): big title + "Last updated" + prose with title-case h2 headings.
 * Used by /privacy, /terms, /cookie-policy.
 */
export default function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <PageShell>
      <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <h1 className="font-display text-4xl text-fg uppercase md:text-6xl">{title}</h1>
        <p className="mt-3 text-neutral-500 text-sm">Last updated {updated}</p>
        <div className="mt-10 text-neutral-700 leading-relaxed [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-fg [&_p]:mt-3 [&_a]:text-accent">
          {children}
        </div>
      </section>
    </PageShell>
  );
}
