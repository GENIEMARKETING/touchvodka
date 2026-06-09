'use client';

/**
 * Footer — multi-column footer with a brand mark and a legal strip.
 *
 * Variant-not-configuration: brand, columns, optional legal line. A newsletter-
 * capture footer is a NEW block (compose it from this + a NewsletterForm).
 */
export type FooterProps = {
  brand: string;
  columns: Array<{ heading: string; links: Array<{ label: string; href: string }> }>;
  legal?: string;
};

export function Footer({ brand, columns, legal }: FooterProps) {
  return (
    <footer className="bg-[var(--brand-fg)] text-[var(--surface)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 md:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="font-bold text-2xl uppercase tracking-widest">{brand}</div>
        {columns.slice(0, 3).map((col) => (
          <nav key={col.heading} aria-label={col.heading}>
            <h3 className="mb-4 text-sm uppercase tracking-wider opacity-60">{col.heading}</h3>
            <ul className="space-y-2">
              {col.links.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="text-sm hover:opacity-70">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      {legal ? (
        <div className="border-current/15 border-t px-6 py-6 text-center text-xs opacity-60">
          {legal}
        </div>
      ) : null}
    </footer>
  );
}
