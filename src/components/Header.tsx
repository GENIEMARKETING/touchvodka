'use client';

import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

/**
 * Header — Touch Vodka's bespoke neo-brutalist nav.
 *
 * REUSE DECISION (S4): the shared @geniemarketing `navbar` block is transparent-over-a-
 * dark-hero with white text — it suits image-led heroes, not Touch Vodka's
 * light, high-contrast brutalist grid. So the brand *chrome* stays bespoke while
 * the *functional* blocks (consent, leads, locator, tasting-notes) are reused.
 * Ported from the Vite build, swapping the hash router for next/link routes and
 * framer-motion for CSS transitions (one fewer dependency).
 */
const NAV_ITEMS: Array<{ label: string; href: string }> = [
  { label: 'Our Story', href: '/our-story' },
  { label: 'Collection', href: '/products' },
  { label: 'Cocktails', href: '/cocktails' },
  { label: 'Blog', href: '/blog' },
  { label: 'Find Us', href: '/find-us' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[100] border-black border-b-4 bg-white">
      <div className="flex h-20 items-stretch md:h-24">
        <Link
          href="/"
          className="flex flex-shrink-0 items-center justify-center border-black border-r-4 px-4 font-display text-2xl uppercase tracking-tight transition-opacity hover:opacity-70 md:px-6 md:text-3xl"
        >
          Touch
        </Link>

        <nav className="hidden flex-grow items-center gap-10 px-8 font-bold text-xs uppercase tracking-widest lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group relative transition-colors hover:text-accent"
            >
              {item.label}
              <span className="-bottom-1 absolute left-0 h-0.5 w-0 bg-accent transition-all group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex-grow lg:hidden" />

        <Link
          href="/find-us"
          className="hidden items-center gap-2 bg-white p-6 font-display text-black text-xl uppercase transition-colors hover:bg-accent hover:text-white lg:flex"
        >
          Find_Us
        </Link>

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          className="flex items-center gap-2 bg-white p-6 text-black transition-colors hover:bg-accent hover:text-white lg:hidden"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[200] flex flex-col bg-accent p-8 text-white">
          <div className="mb-16 flex items-center justify-between">
            <h2 className="font-display text-4xl uppercase">Menu</h2>
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="border-4 border-white p-2"
            >
              <X className="h-8 w-8" />
            </button>
          </div>
          <nav className="flex flex-col gap-8 font-display text-5xl uppercase">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="transition-transform hover:translate-x-4"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
