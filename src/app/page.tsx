import CommunityGrid from '@/components/CommunityGrid';
import Header from '@/components/Header';
import SiteFooterData from '@/components/SiteFooterData';
import Collection from '@/components/home/Collection';
import HomeHero from '@/components/home/HomeHero';
import Lifestyle from '@/components/home/Lifestyle';
import Process from '@/components/home/Process';
import PromoBanner from '@/components/home/PromoBanner';
import Recipes from '@/components/home/Recipes';
import Signup from '@/components/home/Signup';
import Stats from '@/components/home/Stats';
import PromoDialog from '@/components/PromoDialog';
import { getPage, getSiteProducts } from '@/lib/strapi';

/**
 * Home — composed server component (Refined-Bold redesign). Products come from
 * the shared Strapi (S6), falling back to the local seed pre-migration. Editable
 * section copy (collection + process headings, the 3 process cards) comes from
 * the Strapi `page` (slug=home) `sections`, falling back to the constants below.
 * Layout lives in code (the home/* section components); Strapi owns text/data.
 *
 * Section rhythm: Hero → Collection → Lifestyle → Process → Stats → Recipes →
 * Signup → Footer (warm / white / blue / dark cadence).
 */

/** Fallback copy = the seed in infrastructure/cms/onboarding/touchvodka-pages.json (slug=home). */
const FALLBACK = {
  collectionEyebrow: 'The Collection',
  collectionTitle: 'The Touch Collection',
  processEyebrow: 'Our Process',
  processTitle: 'The Art of Distillation',
  processLead:
    "Crafted with passion and precision, our proprietary process ensures the smoothest finish in every bottle. We don't just make spirits; we engineer experiences.",
} as const;

/** Default process content stays in code (numbered cards, Figma 151:576); CMS can override title + body per card. */
const PROCESS_CARDS = [
  {
    title: 'Premium Grains',
    body: 'Sourced from the finest local fields, our winter wheat provides a silky texture and a naturally sweet finish.',
  },
  {
    title: '10X Distilled',
    body: 'Refined exactly ten times for exceptional clarity, then charcoal filtered to remove impurities while keeping character.',
  },
  {
    title: 'Pure Spring Water',
    body: 'Blended with pristine, mineral-rich water from natural protected springs for a crisp, clean taste that defines our signature profile.',
  },
] as const;

type CmsCard = { title?: string; body?: string };

export default async function Home() {
  const [products, home] = await Promise.all([getSiteProducts(), getPage('home')]);
  const s = (home?.sections ?? {}) as Record<string, unknown>;

  const collectionEyebrow = (s.collectionEyebrow as string) || FALLBACK.collectionEyebrow;
  const collectionTitle = (s.collectionTitle as string) || FALLBACK.collectionTitle;
  const processEyebrow = home?.eyebrow || FALLBACK.processEyebrow;
  const processTitle = (s.processTitle as string) || FALLBACK.processTitle;
  const processLead = home?.lead || FALLBACK.processLead;
  const cmsCards: CmsCard[] = Array.isArray(s.processCards) ? (s.processCards as CmsCard[]) : [];
  const processCards = PROCESS_CARDS.map((preset, i) => {
    const cms = cmsCards[i];
    return { title: cms?.title ?? preset.title, body: cms?.body ?? preset.body };
  });

  return (
    <div className="min-h-screen bg-white text-fg">
      <Header />
      <HomeHero />
      <Collection products={products} eyebrow={collectionEyebrow} title={collectionTitle} />
      <Lifestyle />
      <Process eyebrow={processEyebrow} title={processTitle} lead={processLead} cards={processCards} />
      <Stats />
      <PromoBanner />
      <Recipes />
      <CommunityGrid className="bg-warm" />
      <Signup />
      <SiteFooterData />
      {/* Interactions: "Join the insiders" promo overlay ~3s after landing (S7-consent-aware). */}
      <PromoDialog />
    </div>
  );
}
