import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @geniemarketing/ui ships ESM with 'use client' banners; transpile it through Next.
  transpilePackages: ['@geniemarketing/ui', '@geniemarketing/foundation'],
  images: {
    // Registry trap `nextjs-image-remote-host-allowlist`: every next/image host
    // must be allowlisted. Heavy media is served from the shared CDN (S5) +
    // Strapi media (S6); local /products/* and /logo/* are bundled statics.
    remotePatterns: [
      { protocol: 'https', hostname: '**.vinny.agency' }, // shared CDN / imgproxy (S5/T33)
      { protocol: 'https', hostname: 'marketing.fatdogspirits.com' }, // shared Strapi media (S6)
      { protocol: 'https', hostname: 'vinny-agency-media.s3.amazonaws.com' }, // S3 masters/CDN origin (S5)
      { protocol: 'https', hostname: '**.touchvodka.com' }, // brand CDN subdomain
    ],
  },
  // Registry trap `amplify-nextconfig-env`: NEXT_PUBLIC_* is inlined at build
  // time by Amplify, but server-runtime vars must be forwarded explicitly so the
  // standalone server sees them. Keep this list in sync with .env.example.
  env: {
    NEXT_PUBLIC_STRAPI_URL: process.env.NEXT_PUBLIC_STRAPI_URL,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_SITE_KEY: process.env.NEXT_PUBLIC_SITE_KEY,
  },
};

export default nextConfig;
