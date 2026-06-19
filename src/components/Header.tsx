'use client';

import { AccountButton } from '@/components/AccountButton';
import { useAuth } from '@/components/vinny/commerce/auth-context';
import { CartButton } from '@/components/vinny/commerce/cart-button';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';

/**
 * Header — Refined-Bold redesign (2026-06). Modern, minimal nav.
 *
 * Transparent and merged into the hero at the top of the page (the hero image
 * shows through); on scroll it goes sticky with a solid black bar + white links.
 * The wordmark is Vinny's brand vector recolored two ways: electric-blue ink
 * (#0055FF) over the hero at the top, white ink on the black bar once scrolled —
 * the two crossfade with the bar so the texture stays legible in both states.
 * It is `sticky` (reserves its row) and the home hero pulls up under it with
 * `-mt-20`, so on pages without a hero the content never hides behind the bar.
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
  const [scrolled, setScrolled] = useState(false);
  const { customer, logout } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-[100] w-full transition-colors duration-300 ease-brand ${
        scrolled ? 'bg-fg text-white shadow-soft' : 'bg-transparent text-fg'
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-6 px-6 md:px-10">
        <Link
          href="/"
          aria-label="Touch Vodka home"
          className="relative block h-8 w-24 flex-shrink-0 md:h-9 md:w-28"
        >
          {/* Brand wordmark (Vinny's vector, recolored). Blue ink over the hero,
              white ink on the scrolled black bar — crossfaded with the bar. */}
          <Image
            src="/brand/touch-logo-blue.svg"
            alt="Touch Vodka"
            fill
            priority
            unoptimized
            sizes="112px"
            className={`object-contain object-left transition-opacity duration-300 ease-brand ${
              scrolled ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <Image
            src="/brand/touch-logo-white.svg"
            alt=""
            aria-hidden
            fill
            priority
            unoptimized
            sizes="112px"
            className={`object-contain object-left transition-opacity duration-300 ease-brand ${
              scrolled ? 'opacity-100' : 'opacity-0'
            }`}
          />
        </Link>

        <nav className="hidden flex-grow items-center justify-center gap-9 font-medium text-sm uppercase tracking-wide lg:flex">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="transition-opacity hover:opacity-60">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex-grow lg:hidden" />

        {customer ? (
          <button
            type="button"
            onClick={() => logout()}
            className="hidden font-medium text-sm uppercase tracking-wide transition-opacity hover:opacity-60 lg:inline-flex"
          >
            Log Out
          </button>
        ) : (
          <Link
            href="/signup"
            className={`hidden items-center rounded-full px-5 py-2.5 font-display text-sm uppercase tracking-wide transition-colors duration-300 lg:inline-flex ${
              scrolled ? 'bg-white text-fg hover:bg-accent hover:text-white' : 'bg-fg text-white hover:bg-accent'
            }`}
          >
            Sign Up
          </Link>
        )}
        <Link
          href="/find-us"
          className={`hidden items-center rounded-full px-6 py-2.5 font-display text-sm uppercase tracking-wide transition-colors duration-300 lg:inline-flex ${
            scrolled
              ? 'bg-accent text-white hover:bg-white hover:text-fg'
              : 'bg-accent text-white hover:bg-fg'
          }`}
        >
          Find Us
        </Link>

        {/* Account + cart icons (T48). Both render only when a Medusa channel is
            wired. The account icon → /account when signed in (accent dot), → /login
            otherwise; the cart opens the live drawer. */}
        <AccountButton className="ml-1" />
        <CartButton className="ml-1" />

        <button
          type="button"
          aria-label="Open menu"
          aria-expanded={open}
          className="lg:hidden"
          onClick={() => setOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-[200] flex flex-col bg-fg p-8 text-white">
          <div className="mb-16 flex items-center justify-between">
            <Image
              src="/brand/touch-logo-white.svg"
              alt="Touch Vodka"
              width={500}
              height={167}
              priority
              unoptimized
              className="h-9 w-auto"
            />
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="rounded-full border border-white/30 p-2 transition-colors hover:bg-white/10"
            >
              <X className="h-7 w-7" />
            </button>
          </div>
          <nav className="flex flex-col gap-7 font-display text-4xl uppercase">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="transition-transform hover:translate-x-3 hover:text-accent"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="mt-auto flex flex-col gap-4 border-white/10 border-t pt-8">
            {customer ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="font-display text-lg uppercase tracking-wide text-white/80 transition-colors hover:text-white"
                >
                  Hi, {customer.first_name || 'there'} — Your account
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    logout();
                  }}
                  className="inline-flex w-fit items-center rounded-full bg-accent px-6 py-3 font-display text-base uppercase tracking-wide text-white"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="font-display text-lg uppercase tracking-wide text-white/80 transition-colors hover:text-white"
                >
                  Log In
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="inline-flex w-fit items-center rounded-full bg-accent px-6 py-3 font-display text-base uppercase tracking-wide text-white"
                >
                  Sign Up
                </Link>
              </>
            )}
            <p className="mt-2 font-mono text-white/40 text-xs uppercase tracking-widest">
              21+ · Crafted in Tampa, Florida
            </p>
          </div>
        </div>
      ) : null}
    </header>
  );
}
