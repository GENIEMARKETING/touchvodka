import PageShell, { PageHero } from '@/components/PageShell';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <PageShell>
      <PageHero eyebrow="// LEGAL" title="Privacy" />
      <section className="mx-auto max-w-3xl space-y-6 px-6 py-16 font-mono text-sm leading-relaxed lowercase opacity-80">
        <p>
          Touch Vodka (a Fat Dog Spirits brand) respects your privacy. This policy explains what we
          collect and how we use it.
        </p>
        <h2 className="font-display text-2xl uppercase opacity-100">What we collect</h2>
        <p>
          With your consent, we use self-hosted analytics (PostHog, IP-anonymized) and, if you opt
          in, marketing pixels. Nothing non-essential is loaded before you choose in the cookie
          banner. If you submit a form, we store your contact details and your marketing-consent
          state in our CRM to respond to you.
        </p>
        <h2 className="font-display text-2xl uppercase opacity-100">Your rights</h2>
        <p>
          You can withdraw consent any time via “Cookie settings” in the footer, and you can request
          a copy or deletion of your data by emailing info@touchvodka.com. We honor data-subject
          requests across our analytics and CRM systems.
        </p>
      </section>
    </PageShell>
  );
}
