import LegalLayout from '@/components/LegalLayout';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Cookie Policy' };

export default function CookiePolicyPage() {
  return (
    <LegalLayout title="Cookie Policy" updated="June 2026">
      <p>
        We use a small set of necessary cookies to run the site, and — only with your consent —
        analytics and marketing cookies.
      </p>
      <h2>Categories</h2>
      <ul className="mt-3 list-disc space-y-2 pl-6">
        <li>
          <strong>Necessary</strong> — always on; session and security only.
        </li>
        <li>
          <strong>Analytics</strong> — self-hosted PostHog, IP anonymized; opt-in.
        </li>
        <li>
          <strong>Marketing</strong> — advertising pixels (e.g. Google); opt-in.
        </li>
      </ul>
      <p className="mt-3">
        Manage or withdraw your choices any time via “Cookie settings” in the footer.
      </p>
    </LegalLayout>
  );
}
