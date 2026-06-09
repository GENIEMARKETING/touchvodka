import PageShell, { PageHero } from '@/components/PageShell';
import { LeadCapture } from '@/components/vinny/lead-capture/lead-capture';
import { StockistLocator } from '@/components/vinny/stockist-locator/stockist-locator';
import { getStockists } from '@/lib/strapi';
import { Mail, MapPin, Phone } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Find Us',
  description:
    'Find Touch Vodka at a store near you, or get in touch about stocking and wholesale.',
};

export default async function FindUsPage() {
  const stockists = await getStockists();

  return (
    <PageShell>
      <PageHero
        eyebrow="// CONTACT"
        title="Find Us"
        lead="Find Touch Vodka at a store near you — or reach out about stocking, wholesale, or collaboration."
      />

      {/* Contact strip (ported from the Vite FindUs page) */}
      <section className="border-black border-b-4 bg-white p-8 md:p-12">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
          <div className="border-4 border-black p-8">
            <div className="mb-6 flex items-center gap-4">
              <Mail className="h-8 w-8 text-accent" />
              <h3 className="font-display text-2xl uppercase">Email</h3>
            </div>
            <a
              href="mailto:info@touchvodka.com"
              className="font-mono text-sm lowercase opacity-80 hover:text-accent"
            >
              info@touchvodka.com
            </a>
          </div>
          <div className="border-4 border-black bg-neutral-50 p-8">
            <div className="mb-6 flex items-center gap-4">
              <Phone className="h-8 w-8 text-accent" />
              <h3 className="font-display text-2xl uppercase">Phone</h3>
            </div>
            <a
              href="tel:813-242-4459"
              className="font-mono text-sm lowercase opacity-80 hover:text-accent"
            >
              813-242-4459
            </a>
          </div>
          <div className="border-4 border-black p-8">
            <div className="mb-6 flex items-center gap-4">
              <MapPin className="h-8 w-8 text-accent" />
              <h3 className="font-display text-2xl uppercase">Location</h3>
            </div>
            <p className="font-mono text-sm lowercase opacity-80">
              Fat Dog Spirits
              <br />
              3212 N 40th St, Ste 701
              <br />
              Tampa, FL
            </p>
          </div>
        </div>
      </section>

      {/* S10: stockist locator (BOFU "find a store") */}
      <StockistLocator heading="Find Touch Vodka near you" stockists={stockists} />

      {/* S8: lead capture → /api/lead → Twenty + Mautic (consent-stamped) */}
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
