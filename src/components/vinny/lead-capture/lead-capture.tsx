'use client';

import { CONSENT_VERSION, useConsent } from '@geniemarketing/foundation/consent';
import type { LeadBrand, LeadPayload } from '@geniemarketing/foundation/lead-contract';
import { Button, Input, cn } from '@geniemarketing/ui';
import { ScrollReveal } from '@geniemarketing/ui/motion';
import { type FormEvent, useEffect, useId, useState } from 'react';

/**
 * LeadCapture — the funnel's capture step. The single block every landing page
 * and footer newsletter wires to the shared `/api/lead` contract (S8).
 *
 * It is the meeting point of three cross-team contracts (all verified against the
 * in-tree code — see COORDINATION.md):
 *   • POST `/api/lead`           (S8) — serializes to S8's `LeadPayload` exactly
 *   • `useConsent()`             (S7) — stamps `consent.marketing` + the policy
 *                                       version onto the lead (lawful-basis record)
 *   • PostHog (`window.posthog`) (S7) — events only fire post-consent, because the
 *                                       loader only attaches posthog after opt-in
 *
 * Spam gate (S8 requires both): a Cloudflare **Turnstile** token + a **honeypot**.
 * Turnstile injects a hidden `cf-turnstile-response` input we read from the form;
 * the honeypot (`company_website`) must stay empty.
 *
 * Variant-not-configuration: props are content + funnel attribution only. The
 * visual (single-column card form) is locked. `variant` is the A/B tag (→ the
 * payload's `formId`), not a style switch.
 */
export type LeadField = {
  name: string;
  label: string;
  type?: 'text' | 'email' | 'tel';
  required?: boolean;
};

export type LeadCaptureProps = {
  /** Which brand the lead belongs to (S8's `LeadBrand`). */
  brand: LeadBrand;
  heading: string;
  sublead?: string;
  /** Defaults to name + email. Add phone/message for trade/wholesale forms. */
  fields?: LeadField[];
  submitLabel?: string;
  successMessage?: string;
  /** Campaign attribution forwarded to `/api/lead` + PostHog (e.g. "summer-cocktails"). */
  source: string;
  /** A/B variant id — becomes the payload's `formId` + rides on PostHog events. */
  variant?: string;
  /** Cloudflare Turnstile site key. Omit only in local dev (S8 requires the token in prod). */
  turnstileSiteKey?: string;
};

const DEFAULT_FIELDS: LeadField[] = [
  { name: 'name', label: 'Name', type: 'text', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true },
];

// Field names that map to first-class LeadPayload keys; anything else → meta.
const KNOWN_FIELDS = new Set(['name', 'email', 'phone', 'message']);

/** Null-safe PostHog. `window.posthog` only exists after S7's consent-gated loader runs. */
function track(event: string, props: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  (
    window as { posthog?: { capture: (e: string, p?: Record<string, unknown>) => void } }
  ).posthog?.capture(event, props);
}

export function LeadCapture({
  brand,
  heading,
  sublead,
  fields = DEFAULT_FIELDS,
  submitLabel = 'Get it',
  successMessage = "You're in. Check your inbox.",
  source,
  variant,
  turnstileSiteKey,
}: LeadCaptureProps) {
  const { hasConsent, record } = useConsent();
  const formId = useId();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');
  const [optIn, setOptIn] = useState(false);

  // Fire once the form is on screen — gated for free by `track`'s null-safety.
  useEffect(() => {
    track('lead_form_viewed', { source, variant });
  }, [source, variant]);

  // Load Turnstile (renders any .cf-turnstile and injects cf-turnstile-response).
  useEffect(() => {
    if (!turnstileSiteKey || typeof document === 'undefined') return;
    if (document.querySelector('script[data-vinny-turnstile]')) return;
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    s.async = true;
    s.defer = true;
    s.dataset.vinnyTurnstile = 'true';
    document.head.appendChild(s);
  }, [turnstileSiteKey]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');

    const data = new FormData(e.currentTarget);
    const value = (name: string) => {
      const v = data.get(name);
      return typeof v === 'string' ? v : '';
    };

    // Split form fields into first-class keys vs. meta.
    const meta: Record<string, string> = {};
    for (const f of fields) {
      if (!KNOWN_FIELDS.has(f.name)) meta[f.name] = value(f.name);
    }

    const payload: LeadPayload = {
      brand,
      source,
      landingPage: typeof window !== 'undefined' ? window.location.pathname : '/',
      email: value('email'),
      name: value('name') || undefined,
      phone: value('phone') || undefined,
      message: value('message') || undefined,
      formId: variant,
      // S8 T15: stamp the consent state. `marketing` is the explicit opt-in OR an
      // existing banner grant; the rest mirrors S7's record for the audit trail.
      consent: {
        marketing: optIn || hasConsent('marketing'),
        timestamp: record?.decidedAt ?? new Date().toISOString(),
        policyVersion: String(CONSENT_VERSION),
        source: 'form-checkbox',
      },
      turnstileToken: value('cf-turnstile-response'),
      honeypot: value('company_website'),
      ...(Object.keys(meta).length > 0 ? { meta } : {}),
    };

    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`lead ${res.status}`);
      track('lead_captured', { source, variant });
      setStatus('done');
    } catch {
      track('lead_capture_failed', { source, variant });
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <section className="mx-auto max-w-md px-6 py-16 text-center">
        <ScrollReveal>
          <p className="font-semibold text-2xl tracking-tight">{successMessage}</p>
        </ScrollReveal>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-md px-6 py-16">
      <div className="rounded-lg border border-[var(--fg)]/10 bg-[var(--surface)] p-8 shadow-sm">
        <h2 className="font-semibold text-2xl tracking-tight">{heading}</h2>
        {sublead ? <p className="mt-2 text-[var(--fg)]/70">{sublead}</p> : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-4" aria-describedby={`${formId}-status`}>
          {fields.map((f) => (
            <label key={f.name} htmlFor={`${formId}-${f.name}`} className="block">
              <span className="mb-1 block text-sm">{f.label}</span>
              <Input
                id={`${formId}-${f.name}`}
                name={f.name}
                type={f.type ?? 'text'}
                required={f.required}
                autoComplete={f.type === 'email' ? 'email' : undefined}
              />
            </label>
          ))}

          {/* Honeypot — must stay empty. Hidden from humans + assistive tech. */}
          <input
            type="text"
            name="company_website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="hidden"
          />

          {/* Marketing opt-in — the lead's lawful basis for nurture (Mautic). */}
          <label className="flex items-start gap-2 text-[var(--fg)]/70 text-sm">
            <input
              type="checkbox"
              checked={optIn}
              onChange={(ev) => setOptIn(ev.target.checked)}
              className="mt-1"
            />
            <span>Email me occasional updates. Unsubscribe anytime.</span>
          </label>

          {/* Cloudflare Turnstile — injects the hidden cf-turnstile-response input. */}
          {turnstileSiteKey ? (
            <div className="cf-turnstile" data-sitekey={turnstileSiteKey} />
          ) : null}

          <Button type="submit" className="w-full" disabled={status === 'submitting'}>
            {status === 'submitting' ? 'Sending…' : submitLabel}
          </Button>

          <p
            id={`${formId}-status`}
            aria-live="polite"
            className={cn('text-sm', status === 'error' ? 'text-red-500' : 'sr-only')}
          >
            {status === 'error' ? 'Something went wrong — please try again.' : ''}
          </p>
        </form>
      </div>
    </section>
  );
}
