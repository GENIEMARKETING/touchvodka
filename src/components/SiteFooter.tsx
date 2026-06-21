'use client';

import AreaInterest from '@/components/AreaInterest';
import { SOCIALS } from '@/lib/socials';
import { Facebook, Instagram, Youtube } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { DoNotSellLink, openConsentPreferences } from './vinny/consent-banner/consent-banner';

/**
 * SiteFooter — Touch Vodka's Refined-Bold footer (de-brutalized 2026-06).
 *
 * REUSE DECISION (S4): the shared @geniemarketing `footer` block hardcodes its
 * palette to `--brand-fg` (background) + `--surface` (text), which only works
 * when `--brand-fg` is a DARK brand color. Touch Vodka's `--brand-fg` is WHITE,
 * so the shared footer would render white-on-white. We keep a bespoke footer and
 * wire "Cookie settings" to the shared consent block's `openConsentPreferences`
 * (S7 right-to-withdraw) + the CPRA "Do Not Sell or Share" link (T45). See
 * LEARNINGS: token-fg-dual-use.
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

/** Hardcoded defaults = today's footer; overridden per-brand by Strapi site-config (via SiteFooterData). */
const DEFAULTS = {
  siteName: 'Touch Vodka',
  tagline:
    'Elevating spirits since 2012. Crafted for those who appreciate the finer details. Industrial precision meets artisanal soul.',
  instagram: SOCIALS.instagram,
  facebook: SOCIALS.facebook,
  youtube: SOCIALS.youtube,
};

export default function SiteFooter({
  siteName = DEFAULTS.siteName,
  tagline = DEFAULTS.tagline,
  instagram = DEFAULTS.instagram,
  facebook = DEFAULTS.facebook,
  youtube = DEFAULTS.youtube,
}: {
  siteName?: string;
  tagline?: string;
  instagram?: string;
  facebook?: string;
  youtube?: string;
} = {}) {
  return (
    <>
      {/* Site-wide geo-interest strip (Figma footer Area Interest band) — a CTA to Find Us. */}
      <AreaInterest variant="strip" />
      <footer className="border-white/10 border-t bg-fg px-6 py-16 text-white md:px-10 md:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-12 md:grid-cols-12 md:gap-16">
            <div className="flex flex-col gap-6 md:col-span-5">
              <Image
                src="/brand/touch-logo-white.svg"
                alt={siteName}
                width={500}
                height={167}
                unoptimized
                className="h-9 w-auto"
              />
              <p className="max-w-xs text-neutral-400 text-sm leading-relaxed">{tagline}</p>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
              {COLS.map((col) => (
                <div key={col.heading} className="space-y-4">
                  <h4 className="font-display text-accent text-sm uppercase tracking-widest">
                    {col.heading}
                  </h4>
                  <nav className="flex flex-col gap-3 text-neutral-400 text-sm">
                    {col.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    ))}
                    {col.heading === 'Legal' ? (
                      <>
                        <button
                          type="button"
                          onClick={openConsentPreferences}
                          className="text-left transition-colors hover:text-white"
                        >
                          Cookie settings
                        </button>
                        {/* CPRA "Do Not Sell or Share" (T45) — opts out of marketing/ad
                            pixels, keeps analytics/preferences; GPC-honored. */}
                        <DoNotSellLink className="text-left transition-colors hover:text-white" />
                      </>
                    ) : null}
                  </nav>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-16 flex flex-col items-center justify-between gap-6 border-white/10 border-t pt-8 sm:flex-row">
            <p className="text-center text-neutral-500 text-xs sm:text-left">
              © 2026 Touch Vodka · Please enjoy responsibly · 21+
            </p>
            <div className="flex gap-3">
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="rounded-full border border-white/15 p-3 transition-colors hover:border-accent hover:text-accent"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="rounded-full border border-white/15 p-3 transition-colors hover:border-accent hover:text-accent"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href={youtube}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="rounded-full border border-white/15 p-3 transition-colors hover:border-accent hover:text-accent"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
