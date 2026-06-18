'use client';

import { CONSENT_VERSION, useConsent } from '@geniemarketing/foundation/consent';
import type { LeadPayload } from '@geniemarketing/foundation/lead-contract';
import { X } from 'lucide-react';
import Image from 'next/image';
import { type FormEvent, useEffect, useState } from 'react';

/**
 * PromoDialog — the "Join the insiders" overlay (Figma Promo Dialog 109:74) that
 * opens ~3s after landing on the home page. Split card: a key-lime cocktail image
 * beside an email capture ("First taste, first access."). Dismissal is remembered
 * for the session (`sessionStorage`) so it doesn't nag on every navigation, and it
 * never opens before the age gate / for repeat visitors in the same session.
 *
 * Submits to the shared `/api/lead` (S8) with `source: 'promo-dialog'`.
 */
const SEEN_KEY = 'tv_promo_seen';

function track(event: string, props: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  (
    window as { posthog?: { capture: (e: string, p?: Record<string, unknown>) => void } }
  ).posthog?.capture(event, props);
}

export default function PromoDialog({ delayMs = 3000 }: { delayMs?: number }) {
  const { hasConsent, record } = useConsent();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (sessionStorage.getItem(SEEN_KEY)) return;
    const t = setTimeout(() => {
      setOpen(true);
      track('promo_dialog_shown', {});
    }, delayMs);
    return () => clearTimeout(t);
  }, [delayMs]);

  function close() {
    setOpen(false);
    if (typeof window !== 'undefined') sessionStorage.setItem(SEEN_KEY, '1');
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    const data = new FormData(e.currentTarget);
    const get = (k: string) => {
      const v = data.get(k);
      return typeof v === 'string' ? v : '';
    };
    const payload: LeadPayload = {
      brand: 'touch-vodka',
      source: 'promo-dialog',
      landingPage: typeof window !== 'undefined' ? window.location.pathname : '/',
      email: get('email'),
      consent: {
        marketing: hasConsent('marketing'),
        timestamp: record?.decidedAt ?? new Date().toISOString(),
        policyVersion: String(CONSENT_VERSION),
        source: 'form-checkbox',
      },
      turnstileToken: get('cf-turnstile-response'),
      honeypot: get('company_website'),
    };
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`lead ${res.status}`);
      track('promo_dialog_subscribed', {});
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-fg/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="promo-title"
    >
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={close}
      />
      <div className="relative z-10 grid w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-soft-lg sm:grid-cols-2">
        <div className="relative hidden min-h-[280px] bg-warm sm:block">
          <Image
            src="/cocktails/touch-key-lime-0.webp"
            alt="Touch Key Lime cocktail"
            fill
            sizes="320px"
            className="object-cover"
          />
        </div>
        <div className="relative p-8 md:p-10">
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute top-4 right-4 rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-fg"
          >
            <X className="h-5 w-5" />
          </button>

          {status === 'done' ? (
            <div className="flex h-full flex-col justify-center py-8">
              <h2 id="promo-title" className="font-display text-3xl text-fg">
                You're in.
              </h2>
              <p className="mt-3 text-neutral-600">Check your inbox for first access.</p>
            </div>
          ) : (
            <>
              <p className="font-mono text-accent text-xs uppercase tracking-[0.25em]">
                Join the insiders
              </p>
              <h2 id="promo-title" className="mt-3 font-display text-4xl text-fg leading-[0.95]">
                First taste, first access.
              </h2>
              <p className="mt-4 text-neutral-600 leading-relaxed">
                Early drops, new recipes, and members-only tastings — straight to your inbox.
              </p>
              <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
                <input
                  type="text"
                  name="company_website"
                  tabIndex={-1}
                  autoComplete="off"
                  aria-hidden="true"
                  className="hidden"
                />
                <input
                  name="email"
                  type="email"
                  required
                  placeholder="Email address"
                  aria-label="Email address"
                  className="min-w-0 flex-1 rounded-full border border-concrete px-5 py-3 text-fg placeholder:text-neutral-400 focus:border-accent focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="inline-flex shrink-0 items-center justify-center rounded-full bg-accent px-6 py-3 font-display text-sm text-white transition-transform duration-300 ease-brand hover:-translate-y-0.5 disabled:opacity-60"
                >
                  {status === 'submitting' ? 'Sending…' : 'Sign Me Up'}
                </button>
              </form>
              <p className="mt-3 text-neutral-400 text-xs">
                {status === 'error'
                  ? 'Something went wrong — please try again.'
                  : 'No spam. Unsubscribe anytime. Must be 21+.'}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
