import PageShell from '@/components/PageShell';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Email confirmed',
  description: 'Your Touch Vodka email subscription is confirmed.',
  robots: { index: false, follow: false },
};

/**
 * /confirmed — the landing page the double-opt-in (DOI) flow redirects to after a
 * subscriber clicks "Confirm my email". The confirmation email links to the n8n
 * webhook (`n8n.fatdogspirits.com/webhook/doi/confirm?token=…`), which validates
 * + records the consent, then 302-redirects here. (This page used to 404 — the
 * route simply didn't exist.)
 *
 * The webhook may pass an optional `?status=` (expired | invalid | already);
 * with no param we treat it as a success, since the redirect only fires once the
 * token has been accepted.
 */
type Params = { searchParams: Promise<{ status?: string }> };

const STATES = {
  success: {
    icon: CheckCircle2,
    tone: 'text-accent',
    eyebrow: "You're on the list",
    title: 'Email confirmed',
    body: "Thanks for confirming — you'll be the first to hear about new releases, cocktail recipes, and members-only offers.",
  },
  already: {
    icon: CheckCircle2,
    tone: 'text-accent',
    eyebrow: 'Already confirmed',
    title: "You're all set",
    body: 'This email was already confirmed — no need to do anything else. Welcome to the Touch Vodka list.',
  },
  expired: {
    icon: Clock,
    tone: 'text-neutral-500',
    eyebrow: 'Link expired',
    title: 'This link has expired',
    body: 'Confirmation links are valid for 48 hours. Sign up again from any newsletter form and we’ll send a fresh one.',
  },
  invalid: {
    icon: XCircle,
    tone: 'text-neutral-500',
    eyebrow: 'Something went wrong',
    title: "We couldn't confirm that link",
    body: 'The confirmation link looks invalid or has already been used. Try signing up again and we’ll send a new email.',
  },
} as const;

export default async function ConfirmedPage({ searchParams }: Params) {
  const { status } = await searchParams;
  const key = (status && status in STATES ? status : 'success') as keyof typeof STATES;
  const s = STATES[key];
  const Icon = s.icon;

  return (
    <PageShell>
      <section className="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center md:py-32">
        <Icon className={`h-14 w-14 ${s.tone}`} aria-hidden />
        <p className="mt-6 font-mono text-accent text-xs uppercase tracking-[0.25em]">{s.eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl text-fg uppercase md:text-5xl">{s.title}</h1>
        <p className="mt-5 text-lg text-neutral-600 leading-relaxed">{s.body}</p>
        <div className="mt-9 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/products"
            className="inline-flex items-center justify-center rounded-full bg-accent px-8 py-4 font-display text-white shadow-brand-glow transition-transform duration-300 ease-brand hover:-translate-y-0.5"
          >
            Explore the collection
          </Link>
          <Link
            href="/blog"
            className="inline-flex items-center justify-center rounded-full border border-concrete px-8 py-4 font-display text-fg transition-colors hover:border-fg"
          >
            Read the journal
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
