import LegalLayout from '@/components/LegalLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy Policy' };

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 2026">
      <p>
        Touch Vodka (a Fat Dog Spirits brand) respects your privacy. This policy explains what we
        collect and how we use it.
      </p>
      <h2>Information we collect</h2>
      <p>
        With your consent, we use self-hosted analytics (PostHog, IP-anonymized) and, if you opt in,
        marketing pixels. Nothing non-essential is loaded before you choose in the cookie banner. If
        you submit a form, we store your contact details and your marketing-consent state in our CRM
        to respond to you.
      </p>
      <h2>How we use it</h2>
      <p>
        To fulfil orders, respond to enquiries, send updates you’ve opted into, and improve the
        experience. We never sell your personal data.
      </p>
      <h2>Your rights</h2>
      <p>
        You can withdraw consent any time via “Cookie settings” in the footer, and you can request a
        copy or deletion of your data by emailing <a href="mailto:info@touchvodka.com">info@touchvodka.com</a>.
        We honor data-subject requests across our analytics and CRM systems.
      </p>
    </LegalLayout>
  );
}
