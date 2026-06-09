'use client';

import { Instagram, Twitter } from 'lucide-react';
import Link from 'next/link';
import { openConsentPreferences } from './vinny/consent-banner/consent-banner';

/**
 * SiteFooter — Touch Vodka's bespoke neo-brutalist footer.
 *
 * REUSE DECISION (S4): the shared @vinny `footer` block hardcodes its palette to
 * `--brand-fg` (background) + `--surface` (text), which only works when
 * `--brand-fg` is a DARK brand color. Touch Vodka's `--brand-fg` is WHITE (it's
 * the on-blue button text), so the shared footer would render white-on-white.
 * Rather than fight the token contract we keep the bespoke footer (it also
 * carries the brand's brutalist border language) and wire the "Cookie settings"
 * link to the shared consent block's `openConsentPreferences` (S7 right-to-
 * withdraw). See LEARNINGS: token-fg-dual-use.
 */
const COLS: Array<{ heading: string; links: Array<{ label: string; href: string }> }> = [
  {
    heading: 'Explore',
    links: [
      { label: 'Collection', href: '/products' },
      { label: 'Cocktails', href: '/cocktails' },
      { label: 'Find Us', href: '/find-us' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'Our Story', href: '/our-story' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
      { label: 'Cookie Policy', href: '/cookie-policy' },
    ],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-black border-t-4 bg-black p-8 text-white md:p-16">
      <div className="grid grid-cols-1 gap-16 md:grid-cols-12">
        <div className="flex flex-col gap-12 md:col-span-5">
          <span className="font-display text-4xl uppercase tracking-tight">Touch Vodka</span>
          <p className="max-w-xs border-accent border-l-2 pl-6 font-mono text-sm leading-relaxed opacity-60">
            Elevating spirits since 2012. Crafted for those who appreciate the finer details.
            Industrial precision meets artisanal soul.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-12 sm:grid-cols-3 md:col-span-7">
          {COLS.map((col) => (
            <div key={col.heading} className="space-y-6">
              <h4 className="font-bold text-accent text-xl tracking-widest">[ {col.heading} ]</h4>
              <nav className="flex flex-col gap-3 font-mono text-sm opacity-70">
                {col.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="hover:text-accent hover:underline"
                  >
                    {link.label}
                  </Link>
                ))}
                {col.heading === 'Legal' ? (
                  <button
                    type="button"
                    onClick={openConsentPreferences}
                    className="mt-1 text-left hover:text-accent hover:underline"
                  >
                    Cookie settings
                  </button>
                ) : null}
              </nav>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-24 flex flex-col items-center justify-between gap-8 border-white/20 border-t-2 pt-10 sm:flex-row">
        <p className="text-center font-mono text-[10px] tracking-widest opacity-40 sm:text-left">
          {'© 2026 Touch Vodka // please enjoy responsibly // all rights reserved'}
        </p>
        <div className="flex gap-6">
          <a
            href="https://instagram.com"
            aria-label="Instagram"
            className="group border-2 border-white p-3 transition-all hover:border-accent hover:bg-accent"
          >
            <Instagram className="h-6 w-6" />
          </a>
          <a
            href="https://twitter.com"
            aria-label="Twitter / X"
            className="group border-2 border-white p-3 transition-all hover:border-accent hover:bg-accent"
          >
            <Twitter className="h-6 w-6" />
          </a>
        </div>
      </div>
    </footer>
  );
}
