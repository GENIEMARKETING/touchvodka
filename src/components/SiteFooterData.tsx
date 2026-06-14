import { getSiteConfig } from '@/lib/strapi';
import SiteFooter from './SiteFooter';

/**
 * Server wrapper for the (client) SiteFooter: pulls per-brand footer copy +
 * socials from the shared Strapi `site-config` (tenant-scoped via getSiteConfig),
 * falling back to SiteFooter's hardcoded defaults when the CMS is unwired/empty.
 * Keeps the fetch+map in one place so every page's footer is CMS-driven.
 */
function str(v: unknown): string | undefined {
  return typeof v === 'string' && v.trim() ? v : undefined;
}

export default async function SiteFooterData() {
  const config = await getSiteConfig();
  const c = (config ?? {}) as Record<string, unknown>;
  const socials = (c.socialLinks ?? c.social_links ?? {}) as Record<string, unknown>;
  return (
    <SiteFooter
      siteName={str(c.siteName ?? c.site_name)}
      tagline={str(c.footerText ?? c.footer_text)}
      instagram={str(socials.instagram)}
      twitter={str(socials.twitter ?? socials.x)}
    />
  );
}
