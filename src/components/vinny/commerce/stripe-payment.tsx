'use client';

/**
 * StripePayment — the card step, mounted only when the cart's region uses the
 * Stripe provider AND `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (a TEST `pk_test_…`
 * for touchvodka) is set.
 *
 * Loads Stripe.js from the official CDN (`js.stripe.com/v3`) at runtime rather
 * than bundling `@stripe/stripe-js` — PCI guidance requires the SDK be served by
 * Stripe, and it keeps the storefront's dependency surface (and the private
 * GH-Packages install) untouched. We never see card data: the Payment Element is
 * a Stripe-hosted iframe; we only hold the session `client_secret` Medusa minted.
 */
import { useEffect, useRef, useState } from 'react';

// Minimal structural types for the slice of Stripe.js we touch.
type StripeElements = { create(type: 'payment'): { mount(el: HTMLElement): void } };
type StripeJs = {
  elements(opts: { clientSecret: string }): StripeElements;
  confirmPayment(opts: {
    elements: StripeElements;
    redirect: 'if_required';
  }): Promise<{ error?: { message?: string } }>;
};
declare global {
  interface Window {
    Stripe?: (key: string) => StripeJs;
  }
}

const SCRIPT_SRC = 'https://js.stripe.com/v3';

function loadStripeJs(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.Stripe) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Stripe.js failed to load')));
      return;
    }
    const s = document.createElement('script');
    s.src = SCRIPT_SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Stripe.js failed to load'));
    document.head.appendChild(s);
  });
}

export type StripePaymentProps = {
  publishableKey: string;
  clientSecret: string;
  busy: boolean;
  /** Drive payment confirmation from the parent's "Place order" button. */
  onConfirm: (confirm: () => Promise<void>) => void;
  onError: (message: string) => void;
};

export function StripePayment({
  publishableKey,
  clientSecret,
  busy,
  onConfirm,
  onError,
}: StripePaymentProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await loadStripeJs();
        if (!alive || !mountRef.current || !window.Stripe) return;
        const stripe = window.Stripe(publishableKey);
        const elements = stripe.elements({ clientSecret });
        elements.create('payment').mount(mountRef.current);
        setReady(true);
        // Hand the confirmation routine up so the parent's single CTA drives it.
        onConfirm(async () => {
          const { error } = await stripe.confirmPayment({ elements, redirect: 'if_required' });
          if (error) throw new Error(error.message ?? 'Payment failed');
        });
      } catch (err) {
        onError(err instanceof Error ? err.message : 'Could not initialise payment');
      }
    })();
    return () => {
      alive = false;
    };
  }, [publishableKey, clientSecret, onConfirm, onError]);

  return (
    <div>
      <div ref={mountRef} className="min-h-[120px] border-2 border-black p-4" />
      {!ready ? <p className="mt-2 font-mono text-sm opacity-60">Loading secure payment…</p> : null}
      {busy ? <p className="mt-2 font-mono text-sm opacity-60">Processing…</p> : null}
    </div>
  );
}
