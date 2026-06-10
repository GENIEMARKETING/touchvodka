import { siteI18n } from '@/lib/seo';
import { buildRobots } from '@geniemarketing/seo';
import type { MetadataRoute } from 'next';

// robots + sitemap host derive from the same @geniemarketing/seo i18n origin as the
// metadata builders — no hard-coded URL to fall out of sync with the domain.
export default function robots(): MetadataRoute.Robots {
  return buildRobots(siteI18n) as MetadataRoute.Robots;
}
