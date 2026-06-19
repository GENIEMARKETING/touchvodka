import LegalLayout from '@/components/LegalLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms of Service' };

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="June 2026">
      <p>
        By using this site you confirm you are of legal drinking age (21+ in the United States) and
        agree to enjoy our products responsibly.
      </p>
      <h2>Intellectual property</h2>
      <p>
        All content, branding, and imagery on this site are the property of Touch Vodka / Fat Dog
        Spirits and may not be reproduced without permission.
      </p>
      <h2>Availability</h2>
      <p>This site is provided “as is.” Product availability varies by state and retailer.</p>
    </LegalLayout>
  );
}
