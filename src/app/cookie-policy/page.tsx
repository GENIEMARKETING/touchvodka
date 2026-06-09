import PageShell, { PageHero } from '@/components/PageShell';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Cookie Policy' };

export default function CookiePolicyPage() {
  return (
    <PageShell>
      <PageHero eyebrow="// LEGAL" title="Cookies" />
      <section className="mx-auto max-w-3xl space-y-6 px-6 py-16 font-mono text-sm leading-relaxed lowercase opacity-80">
        <p>
          We use a small set of necessary cookies to run the site, and — only with your consent —
          analytics and marketing cookies.
        </p>
        <h2 className="font-display text-2xl uppercase opacity-100">Categories</h2>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <strong>necessary</strong> — always on; session and security only.
          </li>
          <li>
            <strong>analytics</strong> — self-hosted PostHog, IP anonymized; opt-in.
          </li>
          <li>
            <strong>marketing</strong> — advertising pixels (e.g. Google); opt-in.
          </li>
        </ul>
        <p>Manage or withdraw your choices any time via “Cookie settings” in the footer.</p>
      </section>
    </PageShell>
  );
}
