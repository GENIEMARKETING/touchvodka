import Analytics from '@/components/Analytics';
import { AgeGate } from '@/components/vinny/age-gate/age-gate';
import { CartProvider } from '@/components/vinny/commerce/cart-context';
import { CartDrawer } from '@/components/vinny/commerce/cart-drawer';
import { ConsentBanner } from '@/components/vinny/consent-banner/consent-banner';
import { jsonLdScript, organizationJsonLd } from '@/lib/seo';
import type { Metadata } from 'next';
import { Anton, Space_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import './globals.css';

// next/font (S5 perf): self-hosted, no layout-shift, no render-blocking CDN
// @import (the Vite build pulled fonts from fonts.googleapis.com at runtime).
const display = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});
const mono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://touchvodka.com'),
  title: {
    default: 'Touch Vodka | Premium Craft Vodka with Industrial Elegance',
    template: '%s | Touch Vodka',
  },
  description:
    'Discover Touch Vodka — brutalist, high-contrast premium spirits crafted with precision. Explore our collection of artisan-distilled vodkas and signature cocktails.',
  keywords: [
    'premium vodka',
    'craft spirits',
    'artisan vodka',
    'luxury alcohol',
    'high-proof vodka',
    'distillery',
    'cocktails',
  ],
  authors: [{ name: 'Touch Vodka' }],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Touch Vodka | Premium Craft Vodka with Industrial Elegance',
    description:
      'Brutalist premium spirits. Crafted with precision. Industrial elegance in every bottle.',
    url: 'https://touchvodka.com/',
    siteName: 'Touch Vodka',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Touch Vodka | Premium Craft Vodka with Industrial Elegance',
    description:
      'Brutalist premium spirits. Crafted with precision. Industrial elegance in every bottle.',
    creator: '@touchvodka',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body>
        {/* schema.org Organization (@geniemarketing/seo, S4·I) — site-wide knowledge-panel node. */}
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD; jsonLdScript escapes "<".
          dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd()) }}
        />
        {/* S10: age-gate (21+) for the regulated spirits category. */}
        <AgeGate brand="Touch Vodka" minAge={21} />
        {/* S10: DTC cart state + slide-over (inert until Medusa is wired). */}
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
        {/* S7: consent banner — the keystone the trackers are gated on. */}
        <ConsentBanner
          brand="Touch Vodka"
          privacyHref="/privacy"
          categories={['analytics', 'marketing']}
        />
        {/* S7: register consent-gated PostHog + gtag (no tracking pre-consent). */}
        <Analytics />
      </body>
    </html>
  );
}
