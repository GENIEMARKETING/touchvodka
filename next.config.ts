import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @geniemarketing/ui ships ESM with 'use client' banners; transpile it through Next.
  transpilePackages: ['@geniemarketing/ui', '@geniemarketing/foundation'],
  images: {
    // Registry trap `nextjs-image-remote-host-allowlist`: every next/image host
    // must be allowlisted. Production media (bottle/blog shots) resolves via
    // src/lib/media.ts#mediaUrl → NEXT_PUBLIC_MEDIA_BASE; local /products/* and
    // /logo/* are the bundled-static fallback while the base is unset.
    remotePatterns: [
      { protocol: 'https', hostname: 'img.fatdogspirits.com' }, // CloudFront/imgproxy edge (S5/T33; deferred)
      { protocol: 'https', hostname: '**.fatdogspirits.com' }, // shared CDN / imgproxy (S5/T33)
      { protocol: 'https', hostname: 'marketing.fatdogspirits.com' }, // shared Strapi media (S6)
      { protocol: 'https', hostname: 'vinny-agency-media.s3.amazonaws.com' }, // S3 media bucket / CDN origin (S5)
      { protocol: 'https', hostname: '**.touchvodka.com' }, // brand CDN subdomain
    ],
  },
  // Registry trap `amplify-nextconfig-env`: NEXT_PUBLIC_* is inlined at build
  // time by Amplify, but server-runtime vars must be forwarded explicitly so the
  // standalone server sees them. Keep this list in sync with .env.example.
  env: {
    NEXT_PUBLIC_STRAPI_URL: process.env.NEXT_PUBLIC_STRAPI_URL,
    // S9 CDP (#22): canonical analytics path → RudderStack → warehouse. Write key
    // is WRITE_KEY_TOUCH (RudderStack source `touch-vodka`, in SOPS); data plane is
    // the live events.fatdogspirits.com gateway. Browser-inlined NEXT_PUBLIC_*.
    NEXT_PUBLIC_RUDDERSTACK_WRITE_KEY: process.env.NEXT_PUBLIC_RUDDERSTACK_WRITE_KEY,
    NEXT_PUBLIC_RUDDERSTACK_DATAPLANE: process.env.NEXT_PUBLIC_RUDDERSTACK_DATAPLANE,
    // PostHog kept optional (box not deployed; no-ops while the key is empty).
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    NEXT_PUBLIC_GA_ID: process.env.NEXT_PUBLIC_GA_ID,
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
    NEXT_PUBLIC_SITE_KEY: process.env.NEXT_PUBLIC_SITE_KEY,
    // S5 (#7) production-media tier: base URL for client-editable media (bottle/
    // blog shots) — the Strapi media host today (`https://marketing.fatdogspirits.com`),
    // the `https://img.fatdogspirits.com` CloudFront/imgproxy edge once it lands.
    // Unset → src/lib/media.ts falls back to the local public/ statics. Browser-
    // inlined (NEXT_PUBLIC), so no server forward is strictly needed; listed for docs.
    NEXT_PUBLIC_MEDIA_BASE: process.env.NEXT_PUBLIC_MEDIA_BASE,
    // Server-only runtime secrets (NOT NEXT_PUBLIC) — must be forwarded explicitly
    // or the WEB_COMPUTE standalone server never sees them (registry trap
    // `amplify-nextconfig-env`).
    REVALIDATION_SECRET: process.env.REVALIDATION_SECRET, // /api/revalidate (Strapi ISR webhook)
    // S6/S3 content fetch: scoped read-only TOUCH_VODKA_API_TOKEN. Read server-side
    // by src/lib/strapi.ts; without this forward the WEB_COMPUTE runtime falls back
    // to the local seed (stale) instead of live Strapi.
    STRAPI_API_TOKEN: process.env.STRAPI_API_TOKEN,
    // S8 leads → n8n + Turnstile verify (server side).
    LEAD_WEBHOOK_URL: process.env.LEAD_WEBHOOK_URL,
    LEAD_WEBHOOK_SECRET: process.env.LEAD_WEBHOOK_SECRET,
    TURNSTILE_SECRET: process.env.TURNSTILE_SECRET,
    // S8 transactional email via SMTP2GO (+ legacy Office365 fallback, cutover-guarded).
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
    SMTP2GO_SMTP_HOST: process.env.SMTP2GO_SMTP_HOST,
    SMTP2GO_SMTP_PORT: process.env.SMTP2GO_SMTP_PORT,
    SMTP2GO_SMTP_USER: process.env.SMTP2GO_SMTP_USER,
    SMTP2GO_SMTP_PASSWORD: process.env.SMTP2GO_SMTP_PASSWORD,
    CONTACT_RECIPIENT_EMAIL: process.env.CONTACT_RECIPIENT_EMAIL,
    OFFICE365_EMAIL: process.env.OFFICE365_EMAIL,
    OFFICE365_APP_PASSWORD: process.env.OFFICE365_APP_PASSWORD,
    // S4·I commerce seam: the Medusa endpoint + publishable key + Meilisearch
    // host/key are NEXT_PUBLIC_* (build-time inlined, no forward needed). The
    // sales-channel id is NOT public (it's a server-side search filter), so it
    // MUST be forwarded here or lib/commerce.ts#searchProducts can't scope to the
    // channel on the WEB_COMPUTE runtime (registry trap `amplify-nextconfig-env`).
    MEDUSA_SALES_CHANNEL_ID: process.env.MEDUSA_SALES_CHANNEL_ID,
  },
};

export default nextConfig;
