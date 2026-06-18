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
        eyebrow="Get in Touch"
        title="Find Us"
        lead="Find Touch Vodka at a store near you — or reach out about stocking, wholesale, or collaboration."
      />

      {/* Contact strip */}
      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-6 md:grid-cols-3 md:px-10">
          <div className="rounded-2xl bg-neutral-50 p-8 shadow-soft">
            <div className="mb-6 flex items-center gap-4">
              <Mail className="h-7 w-7 text-accent" />
              <h3 className="font-display text-xl text-fg uppercase">Email</h3>
            </div>
            <a
              href="mailto:info@touchvodka.com"
              className="text-neutral-600 transition-colors hover:text-accent"
            >
              info@touchvodka.com
            </a>
          </div>
          <div className="rounded-2xl bg-neutral-50 p-8 shadow-soft">
            <div className="mb-6 flex items-center gap-4">
              <Phone className="h-7 w-7 text-accent" />
              <h3 className="font-display text-xl text-fg uppercase">Phone</h3>
            </div>
            <a
              href="tel:813-242-4459"
              className="text-neutral-600 transition-colors hover:text-accent"
            >
              813-242-4459
            </a>
          </div>
          <div className="rounded-2xl bg-neutral-50 p-8 shadow-soft">
            <div className="mb-6 flex items-center gap-4">
              <MapPin className="h-7 w-7 text-accent" />
              <h3 className="font-display text-xl text-fg uppercase">Location</h3>
            </div>
            <p className="text-neutral-600 leading-relaxed">
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
