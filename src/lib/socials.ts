/**
 * Canonical Touch Vodka social accounts. Hardcoded defaults = the live accounts;
 * Strapi `site-config.socialLinks` can override per-brand at runtime (resolveSocials,
 * used by SiteFooterData). Client-safe — pure constants, no server-only imports —
 * so both the client SiteFooter and server sections (CommunityGrid) can import it.
 */
export const SOCIALS = {
  instagram: 'https://www.instagram.com/touch.vodka/',
  facebook: 'https://www.facebook.com/touchvodka',
  youtube: 'https://www.youtube.com/@fatdogspirits2929',
  /** Display handle for "Follow @…" CTAs. */
  instagramHandle: 'touch.vodka',
} as const;

export type SocialKey = 'instagram' | 'facebook' | 'youtube';

/** Merge Strapi site-config socials over the live defaults (blanks ignored). */
export function resolveSocials(cfg?: Record<string, unknown> | null): Record<SocialKey, string> {
  const s = (cfg ?? {}) as Record<string, unknown>;
  const pick = (k: string, fallback: string) =>
    typeof s[k] === 'string' && (s[k] as string).trim() ? (s[k] as string) : fallback;
  return {
    instagram: pick('instagram', SOCIALS.instagram),
    facebook: pick('facebook', SOCIALS.facebook),
    youtube: pick('youtube', SOCIALS.youtube),
  };
}
