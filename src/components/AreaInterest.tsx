'use client';

import NotifyModal from '@/components/NotifyModal';
import TurnstileWidget, { TURNSTILE_ENABLED } from '@/components/TurnstileWidget';
import { CONSENT_VERSION, useConsent } from '@geniemarketing/foundation/consent';
import type { LeadPayload } from '@geniemarketing/foundation/lead-contract';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { type FormEvent, useState } from 'react';

/**
 * AreaInterest — the geo-interest capture (Figma `Section/Area Interest` 547:79).
 * Zip + email + "Show your interest" posts a NEW lead type to the shared
 * `/api/lead` (S8): `source: 'area-interest'`, `meta.interest = 'area'`, and the
 * `meta.zipcode`. On success it opens the Notify Thank-You modal, which routes to
 * the $10-off survey.
 *
 * Two variants share one form:
 *   • `module` — full section (Find Us, PDP, City Detail).
 *   • `strip`  — slim site-wide blue band rendered inside the footer.
 *
 * Spam gate mirrors LeadCapture: honeypot (`company_website`) + a Turnstile token
 * (the hidden `cf-turnstile-response`, empty in dev where the server skips it).
 */
function track(event: string, props: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  (
    window as { posthog?: { capture: (e: string, p?: Record<string, unknown>) => void } }
  ).posthog?.capture(event, props);
}

export default function AreaInterest({
  variant = 'module',
  heading = 'Want Touch in your area?',
  sublead = 'Get notified the moment Touch lands near you — and unlock $10 off your first bottle.',
}: {
  variant?: 'module' | 'strip';
  heading?: string;
  sublead?: string;
}) {
  const { hasConsent, record } = useConsent();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle');
  const [modalOpen, setModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  // Turnstile readiness: the real Managed widget issues a token ~1s after mount,
  // so submit waits for it (empty token → /api/lead 400). `tsKey` remounts the
  // single-use widget for a fresh token after a failed attempt.
  const [tsToken, setTsToken] = useState('');
  const [tsKey, setTsKey] = useState(0);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    const data = new FormData(e.currentTarget);
    const get = (k: string) => {
      const v = data.get(k);
      return typeof v === 'string' ? v : '';
    };
    const submittedEmail = get('email');

    const payload: LeadPayload = {
      brand: 'touch-vodka',
      source: 'area-interest',
      landingPage: typeof window !== 'undefined' ? window.location.pathname : '/',
      email: submittedEmail,
      consent: {
        marketing: hasConsent('marketing'),
        timestamp: record?.decidedAt ?? new Date().toISOString(),
        policyVersion: String(CONSENT_VERSION),
        source: 'form-checkbox',
      },
      turnstileToken: tsToken || get('cf-turnstile-response'),
      honeypot: get('company_website'),
      meta: { interest: 'area', zipcode: get('zipcode') },
    };

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`lead ${res.status}`);
      track('area_interest_submitted', { zipcode: get('zipcode') });
      setEmail(submittedEmail);
      setStatus('idle');
      setModalOpen(true);
    } catch {
      track('area_interest_failed', {});
      setStatus('error');
      // Single-use token consumed → mint a fresh one for the retry.
      setTsToken('');
      setTsKey((k) => k + 1);
    }
  }

  const honeypot = (
    <input
      type="text"
      name="company_website"
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      className="hidden"
    />
  );

  if (variant === 'strip') {
    // Site-wide slim band — a CTA to the Find Us page (which carries the full
    // capture module), NOT a second inline form. This matches the Figma "Strip CTA
    // → Find Us" intent and avoids a duplicate capture stacking under the module on
    // the high-intent pages (PDP / Find Us / City Detail).
    return (
      <div className="bg-accent text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-5 md:flex-row md:px-10">
          <p className="text-center font-medium text-sm md:text-left">
            Want Touch near you? Get notified the moment it lands in your area.
          </p>
          <Link
            href="/find-us"
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full bg-white px-5 py-2.5 font-display text-accent text-sm transition-transform duration-300 ease-brand hover:-translate-y-0.5"
          >
            Show your interest <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  // module
  return (
    <section className="bg-accent text-white">
      <div className="mx-auto max-w-7xl px-6 py-16 md:px-10 md:py-24">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="mb-3 font-mono text-white/70 text-xs uppercase tracking-[0.25em]">
              Touch in your area
            </p>
            <h2 className="font-display text-4xl uppercase md:text-5xl">{heading}</h2>
            <p className="mt-4 max-w-md text-white/85 leading-relaxed">{sublead}</p>
          </div>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            {honeypot}
            <div className="flex flex-col gap-4 sm:flex-row">
              <input
                name="zipcode"
                inputMode="numeric"
                placeholder="ZIP code"
                aria-label="ZIP code"
                required
                className="w-full rounded-full bg-white/15 px-5 py-4 text-white placeholder:text-white/60 focus:bg-white/25 focus:outline-none sm:w-40"
              />
              <input
                name="email"
                type="email"
                placeholder="Email address"
                aria-label="Email address"
                required
                className="w-full flex-1 rounded-full bg-white/15 px-5 py-4 text-white placeholder:text-white/60 focus:bg-white/25 focus:outline-none"
              />
            </div>
            <TurnstileWidget key={tsKey} onToken={setTsToken} />
            <button
              type="submit"
              disabled={status === 'submitting' || (TURNSTILE_ENABLED && !tsToken)}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-display text-accent text-lg transition-transform duration-300 ease-brand hover:-translate-y-0.5 disabled:opacity-60"
            >
              {status === 'submitting'
                ? 'Sending…'
                : TURNSTILE_ENABLED && !tsToken
                  ? 'Verifying…'
                  : 'Show your interest'}
              <ArrowRight className="h-5 w-5" />
            </button>
            <p aria-live="polite" className={status === 'error' ? 'text-sm text-white' : 'sr-only'}>
              {status === 'error' ? 'Something went wrong — please try again.' : ''}
            </p>
          </form>
        </div>
      </div>
      <NotifyModal open={modalOpen} email={email} onClose={() => setModalOpen(false)} />
    </section>
  );
}
