import AreaInterest from '@/components/AreaInterest';
import PageShell, { PageHero } from '@/components/PageShell';
import { LeadCapture } from '@/components/vinny/lead-capture/lead-capture';
import { StockistLocator } from '@/components/vinny/stockist-locator/stockist-locator';
import { getStockists } from '@/lib/strapi';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Us',
  description:
    'Find Touch Vodka at a store near you, or get notified the moment it lands in your area.',
};

export default async function FindUsPage() {
  const stockists = await getStockists();

  return (
    <PageShell>
      <PageHero
        eyebrow="Find Us"
        title="Find Touch near you"
        watermark="Find Us"
        lead="Search your ZIP for the nearest stockist — or get notified the moment Touch lands in your area."
      />

      {/* S10: stockist locator (BOFU "find a store") — ZIP search + nearest list. */}
      <StockistLocator heading="Stockists near you" stockists={stockists} />

      {/* Area-Interest geo capture (Figma "Want Touch in your area"). */}
      <AreaInterest variant="module" />

      {/* S8: wholesale / trade inquiry → /api/lead → Twenty + Mautic (consent-stamped). */}
      <LeadCapture
        brand="touch-vodka"
        heading="Stock Touch Vodka"
        sublead="Retailer, bar, or distributor? Tell us about your account and we'll be in touch."
        source="find-us-wholesale"
        variant="find-us-v1"
        submitLabel="Send inquiry"
        successMessage="Thanks — we'll be in touch shortly."
        fields={[
          { name: 'name', label: 'Name', type: 'text', required: true },
          { name: 'email', label: 'Email', type: 'email', required: true },
          { name: 'phone', label: 'Phone', type: 'tel' },
          { name: 'message', label: 'Tell us about your account', type: 'text' },
        ]}
        turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
      />
    </PageShell>
  );
}
