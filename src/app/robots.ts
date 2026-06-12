import { siteI18n } from '@/lib/seo';
import { buildRobots } from '@geniemarketing/seo';
import type { MetadataRoute } from 'next';

// robots + sitemap host derive from the same @geniemarketing/seo i18n origin as the
// metadata builders — no hard-coded URL to fall out of sync with the domain.
// T46 (AEO): `aiCrawlers: 'allow'` emits explicit allow directives for the AI
// crawlers (GPTBot/ClaudeBot/PerplexityBot/Google-Extended/CCBot, …) so the brand
// gets crawled and cited by ChatGPT / Perplexity / AI Overviews / Claude / Gemini.
export default function robots(): MetadataRoute.Robots {
  return buildRobots(siteI18n, { aiCrawlers: 'allow' }) as MetadataRoute.Robots;
}
