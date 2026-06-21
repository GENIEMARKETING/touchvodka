import { SOCIALS } from '@/lib/socials';

/**
 * Instagram feed via the Meta Graph API (server-only). Pulls the brand's own
 * Business/Creator account media. Requires:
 *   - INSTAGRAM_ACCESS_TOKEN          a long-lived token (ideally a Business
 *                                     Manager System User token — non-expiring)
 *   - INSTAGRAM_BUSINESS_ACCOUNT_ID   the IG Business account id (resolve once via
 *                                     GET /{page-id}?fields=instagram_business_account)
 * Both are forwarded server-side in next.config.ts `env{}` (Amplify WEB_COMPUTE).
 *
 * Graceful by design: if either env var is missing, or the API errors, returns []
 * so the UI falls back to placeholder tiles instead of breaking the page.
 * Cached for 1h (ISR) — IG signed media URLs outlive that window.
 */
export type InstagramPost = {
  id: string;
  permalink: string;
  imageUrl: string;
  caption: string;
  mediaType: string;
};

const GRAPH_VERSION = 'v21.0';

export async function getInstagramPosts(limit = 6): Promise<InstagramPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  const userId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
  if (!token || !userId) return [];

  const fields = 'id,caption,media_type,media_url,permalink,thumbnail_url,timestamp';
  const url =
    `https://graph.facebook.com/${GRAPH_VERSION}/${userId}/media` +
    `?fields=${fields}&limit=${Math.min(limit * 2, 24)}&access_token=${token}`;

  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) {
      console.error('[instagram] graph API', res.status, await res.text().catch(() => ''));
      return [];
    }
    const json = (await res.json()) as { data?: unknown };
    const rows = Array.isArray(json.data) ? (json.data as Record<string, unknown>[]) : [];
    return rows
      .map((m): InstagramPost => {
        const mediaType = typeof m.media_type === 'string' ? m.media_type : 'IMAGE';
        // Videos expose a still in thumbnail_url; images/carousels use media_url.
        const imageUrl =
          (mediaType === 'VIDEO' ? (m.thumbnail_url as string) : (m.media_url as string)) ??
          (m.media_url as string) ??
          '';
        return {
          id: String(m.id ?? ''),
          permalink: (m.permalink as string) || SOCIALS.instagram,
          imageUrl,
          caption: typeof m.caption === 'string' ? m.caption : '',
          mediaType,
        };
      })
      .filter((p) => p.imageUrl && p.id)
      .slice(0, limit);
  } catch (err) {
    console.error('[instagram] fetch failed:', err);
    return [];
  }
}
