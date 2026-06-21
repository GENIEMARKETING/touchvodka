'use client';

import TurnstileWidget from '@/components/TurnstileWidget';
import { CONSENT_VERSION, useConsent } from '@geniemarketing/foundation/consent';
import type { LeadPayload } from '@geniemarketing/foundation/lead-contract';
import { Check } from 'lucide-react';
import { type FormEvent, useState } from 'react';

/**
 * SurveyForm — the $10-off survey (Figma Survey 543:3554). Five quick questions
 * + email → POST `/api/lead` with `source: 'survey'` and the answers in `meta`.
 * The answers are persisted to Twenty + Mautic (n8n lead-capture maps `meta.*`)
 * and captured in PostHog. On success it reveals SURVEY_CODE — a REAL reusable
 * Medusa promo (infrastructure/commerce/phase8-survey-promo) which the n8n
 * lead-capture flow also emails via SMTP2GO ("Send survey $10" branch, fires for
 * `source: 'survey'` regardless of marketing consent — it's transactional).
 */
type Q = { name: string; label: string; options: string[] };

const QUESTIONS: Q[] = [
  {
    name: 'frequency',
    label: 'How often do you enjoy vodka?',
    options: ['Rarely', 'Monthly', 'Weekly', 'Most days'],
  },
  {
    name: 'priority',
    label: 'What matters most to you in a vodka?',
    options: ['Smoothness', 'Flavor', 'Craft & story', 'Price'],
  },
  {
    name: 'expression',
    label: 'Which Touch expression sounds best?',
    options: ['Artisan', 'Key Lime', 'Ruby', 'One', 'Orange'],
  },
  {
    name: 'drew_you',
    label: 'What drew you to Touch?',
    options: ['Florida craft', 'The flavor range', 'A friend', 'Saw it in store'],
  },
  {
    name: 'buy_where',
    label: 'Where do you usually buy spirits?',
    options: ['Liquor store', 'Grocery', 'Online', 'Bar / restaurant'],
  },
];

function track(event: string, props: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  (
    window as { posthog?: { capture: (e: string, p?: Record<string, unknown>) => void } }
  ).posthog?.capture(event, props);
}

/**
 * The real, reusable Medusa promo code handed out for completing the survey.
 * MUST stay in sync with three places: the Medusa promotion
 * (infrastructure/commerce/phase8-survey-promo/create-survey-promo.ts) and the
 * n8n lead-capture "Send survey $10 (SMTP2GO)" email. Change here → change both.
 */
const SURVEY_CODE = 'TOUCHSURVEY10';

export default function SurveyForm() {
  const { hasConsent, record } = useConsent();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'done' | 'error'>('idle');

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus('submitting');
    const data = new FormData(e.currentTarget);
    const get = (k: string) => {
      const v = data.get(k);
      return typeof v === 'string' ? v : '';
    };
    const answers: Record<string, string> = { interest: 'survey' };
    for (const q of QUESTIONS) answers[q.name] = get(q.name);

    const payload: LeadPayload = {
      brand: 'touch-vodka',
      source: 'survey',
      landingPage: '/survey',
      email: get('email'),
      consent: {
        marketing: hasConsent('marketing'),
        timestamp: record?.decidedAt ?? new Date().toISOString(),
        policyVersion: String(CONSENT_VERSION),
        source: 'form-checkbox',
      },
      turnstileToken: get('cf-turnstile-response'),
      honeypot: get('company_website'),
      meta: answers,
    };
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`lead ${res.status}`);
      track('survey_completed', answers);
      setStatus('done');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'done') {
    return (
      <div className="rounded-3xl bg-warm p-8 text-center md:p-12">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white">
          <Check className="h-7 w-7" />
        </div>
        <h2 className="font-display text-3xl text-fg">Here's your $10 off</h2>
        <p className="mt-3 text-neutral-600">
          Use this code at checkout — we've emailed it to you too.
        </p>
        <p className="mt-6 inline-block rounded-xl border-2 border-accent border-dashed bg-white px-8 py-4 font-mono text-2xl text-accent tracking-widest">
          {SURVEY_CODE}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
      />
      {QUESTIONS.map((q, qi) => (
        <fieldset key={q.name}>
          <legend className="font-display text-fg text-xl">
            <span className="mr-2 text-accent">{qi + 1}.</span>
            {q.label}
          </legend>
          <div className="mt-4 flex flex-wrap gap-3">
            {q.options.map((opt) => (
              <label
                key={opt}
                className="cursor-pointer rounded-full border border-concrete bg-white px-5 py-2.5 text-neutral-700 text-sm transition-colors hover:border-accent has-[:checked]:border-accent has-[:checked]:bg-accent has-[:checked]:text-white"
              >
                <input
                  type="radio"
                  name={q.name}
                  value={opt}
                  required
                  className="sr-only"
                />
                {opt}
              </label>
            ))}
          </div>
        </fieldset>
      ))}

      <div>
        <label htmlFor="survey-email" className="font-display text-fg text-xl">
          <span className="mr-2 text-accent">6.</span>Where should we send your code?
        </label>
        <input
          id="survey-email"
          name="email"
          type="email"
          required
          placeholder="Email address"
          className="mt-4 w-full max-w-md rounded-full border border-concrete px-5 py-4 text-fg placeholder:text-neutral-400 focus:border-accent focus:outline-none"
        />
      </div>

      <TurnstileWidget />

      <button
        type="submit"
        disabled={status === 'submitting'}
        className="inline-flex items-center justify-center rounded-full bg-accent px-10 py-4 font-display text-lg text-white shadow-brand-glow transition-transform duration-300 ease-brand hover:-translate-y-0.5 disabled:opacity-60"
      >
        {status === 'submitting' ? 'Sending…' : 'Get my $10 code'}
      </button>
      {status === 'error' ? (
        <p className="text-red-500 text-sm">Something went wrong — please try again.</p>
      ) : null}
    </form>
  );
}
