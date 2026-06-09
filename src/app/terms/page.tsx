import PageShell, { PageHero } from '@/components/PageShell';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <PageShell>
      <PageHero eyebrow="// LEGAL" title="Terms" />
      <section className="mx-auto max-w-3xl space-y-6 px-6 py-16 font-mono text-sm leading-relaxed lowercase opacity-80">
        <p>
          By using this site you confirm you are of legal drinking age (21+ in the United States)
          and agree to enjoy our products responsibly.
        </p>
        <p>
          All content, branding, and imagery on this site are the property of Touch Vodka / Fat Dog
          Spirits and may not be reproduced without permission.
        </p>
        <p>This site is provided “as is.” Product availability varies by state and retailer.</p>
      </section>
    </PageShell>
  );
}
