'use client';

import { buttonVariants, cn } from '@vinny/ui';
import { useEffect, useState } from 'react';

/**
 * Navbar — sticky top nav that condenses (shrinks + gains a backdrop) after the
 * user scrolls past the hero.
 *
 * Variant-not-configuration: brand, links, optional CTA. A mega-menu or a
 * transparent-over-hero-only variant is a NEW block.
 */
export type NavbarProps = {
  brand: string;
  links: Array<{ label: string; href: string }>;
  cta?: { label: string; href: string };
};

export function Navbar({ brand, links, cta }: NavbarProps) {
  const [condensed, setCondensed] = useState(false);

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 80);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300 motion-reduce:transition-none',
        condensed
          ? 'bg-[var(--surface)]/90 py-3 shadow-sm backdrop-blur'
          : 'bg-transparent py-6 text-white',
      )}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6">
        <a href="/" className="font-bold text-lg uppercase tracking-widest">
          {brand}
        </a>
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="text-sm uppercase tracking-wider hover:opacity-70">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        {cta ? (
          <a href={cta.href} className={buttonVariants({ size: 'sm' })}>
            {cta.label}
          </a>
        ) : null}
      </nav>
    </header>
  );
}
