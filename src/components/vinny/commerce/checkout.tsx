'use client';

import { useCart } from '@/components/vinny/commerce/cart-context';
/**
 * Checkout — the multi-step DTC flow: Details → Delivery → Payment → Done.
 *
 * Cart line-item / promo / email / complete operations go through the published
 * `@geniemarketing/commerce` client; the address + shipping-method calls use the
 * lib/checkout shim (the client doesn't expose them yet — see HANDOFFS, S4 folds
 * them upstream). Payment is provider-agnostic via the package's payments client:
 *   • a Stripe region (+ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) → Stripe Elements;
 *   • a manual/system region → the session is enough to complete a TEST order.
 *
 * Everything is keyed to this brand's sales channel by the publishable key — no
 * cross-tenant surface. Renders a "not available" notice when commerce is unwired.
 */
import { CartView } from '@/components/vinny/commerce/cart-view';
import { StripePayment } from '@/components/vinny/commerce/stripe-payment';
import {
  type Address,
  type ShippingOption,
  SHIPS_TO_LABEL,
  addShippingMethod,
  isShippableProvince,
  listRegions,
  listShippingOptions,
  setAddresses,
} from '@/lib/checkout';
import { formatPrice, medusa } from '@/lib/commerce';
import type { Order } from '@geniemarketing/commerce';
import { createPaymentsClient, describeProvider } from '@geniemarketing/commerce/payments';
import Link from 'next/link';
import { type FormEvent, useCallback, useRef, useState } from 'react';

type Step = 'details' | 'delivery' | 'payment' | 'done';

// Refined-Bold form primitives (Figma checkout 59:62) — soft, rounded, no brutalist borders.
const INPUT_CLS =
  'w-full rounded-xl border border-concrete px-4 py-3 text-fg placeholder:text-neutral-400 focus:border-accent focus:outline-none';
const PRIMARY_BTN =
  'rounded-full bg-accent px-7 py-4 font-display text-white transition-transform duration-300 ease-brand hover:-translate-y-0.5 disabled:opacity-60';
const GHOST_BTN =
  'rounded-full border border-concrete px-7 py-4 font-display text-fg transition-colors hover:border-fg disabled:opacity-50';
const SECTION_LABEL = 'mb-3 font-mono text-accent text-xs uppercase tracking-[0.2em]';

const STRIPE_PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
// Pass config explicitly (static NEXT_PUBLIC_* reads → Next inlines them). A bare
// createPaymentsClient() reads the URL/key dynamically inside the package and, on
// Amplify WEB_COMPUTE, falls back to the shared commerce.vinny.agency default —
// listProviders/initSession then hit the wrong host. Same trap as lib/commerce.ts
// + lib/checkout.ts (registry: medusa-client-needs-explicit-config-on-amplify).
const payments = createPaymentsClient({
  medusaUrl: process.env.NEXT_PUBLIC_MEDUSA_URL,
  publishableKey: process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY,
});

const EMPTY_ADDRESS: Address = {
  first_name: '',
  last_name: '',
  address_1: '',
  city: '',
  province: '',
  postal_code: '',
  country_code: 'us',
  phone: '',
};

export function Checkout() {
  const { cart, configured, setEmail, reset } = useCart();
  const [step, setStep] = useState<Step>('details');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmailValue] = useState('');
  const [address, setAddress] = useState<Address>(EMPTY_ADDRESS);

  const [options, setOptions] = useState<ShippingOption[]>([]);
  const [chosenOption, setChosenOption] = useState<string>('');

  const [order, setOrder] = useState<Order | null>(null);
  // Payment session shape resolved from initSession.
  const [session, setSession] = useState<{ kind: string; secret: string | null } | null>(null);
  // The Stripe confirm routine, handed up by <StripePayment> once it mounts.
  const stripeConfirm = useRef<(() => Promise<void>) | null>(null);

  const guard = useCallback(async (fn: () => Promise<void>) => {
    setBusy(true);
    setError(null);
    try {
      await fn();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setBusy(false);
    }
  }, []);

  if (!configured) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <h1 className="font-display text-4xl text-fg uppercase md:text-5xl">
          Online ordering coming soon
        </h1>
        <p className="mt-4 text-neutral-600 leading-relaxed">
          In the meantime, find Touch Vodka at a store near you.
        </p>
        <Link
          href="/find-us"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-accent px-8 py-4 font-display text-lg text-white shadow-brand-glow transition-transform duration-300 ease-brand hover:-translate-y-0.5"
        >
          Find a stockist →
        </Link>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    if (step !== 'done') {
      return (
        <div className="mx-auto max-w-md py-16">
          <CartView />
        </div>
      );
    }
  }

  // ── Step handlers ─────────────────────────────────────────────────────────

  function submitDetails(e: FormEvent) {
    e.preventDefault();
    if (!cart) return;
    // Florida-only DTC: block non-FL addresses with a clear message rather than
    // an empty delivery step (the Medusa zone enforces this too).
    if (!isShippableProvince(address.province)) {
      setError(`We currently ship within ${SHIPS_TO_LABEL} only — please use a Florida address.`);
      return;
    }
    guard(async () => {
      await setEmail(email);
      await setAddresses(cart.id, address);
      const opts = await listShippingOptions(cart.id);
      setOptions(opts);
      setChosenOption(opts[0]?.id ?? '');
      setStep('delivery');
    });
  }

  function submitDelivery(e: FormEvent) {
    e.preventDefault();
    if (!cart || !chosenOption) return;
    guard(async () => {
      await addShippingMethod(cart.id, chosenOption);
      // Resolve the region + provider, then open a payment session.
      const regionId = cart.region_id ?? (await listRegions())[0]?.id;
      if (!regionId) throw new Error('No region configured for this store');
      const providers = await payments.listProviders(regionId);
      const stripe = providers.find((p) => describeProvider(p.id).kind === 'stripe');
      const provider = STRIPE_PK && stripe ? stripe : providers[0];
      if (!provider) throw new Error('No payment provider enabled for this region');
      const session = await payments.initSession(cart.id, provider.id);
      setSession({
        kind: describeProvider(provider.id).kind,
        secret: clientSecretOf(session.data),
      });
      setStep('payment');
    });
  }

  function placeOrder() {
    if (!cart) return;
    guard(async () => {
      // For a Stripe region, confirm the card first; manual/system regions skip
      // straight to completion (the session alone authorises a TEST order).
      if (session?.kind === 'stripe' && stripeConfirm.current) {
        await stripeConfirm.current();
      }
      const placed = await medusa.completeCart(cart.id);
      setOrder(placed);
      reset();
      setStep('done');
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────

  if (step === 'done' && order) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <p className="mb-2 font-mono text-accent text-sm uppercase tracking-[0.25em]">Order placed</p>
        <h1 className="mb-6 font-display text-5xl text-fg uppercase">Thank you</h1>
        <p className="text-neutral-600 leading-relaxed">
          Order <span className="font-display text-fg">#{order.display_id}</span> — a confirmation is
          on its way to {order.email}.
        </p>
        <p className="mt-2 font-display text-fg text-lg">
          Total {formatPrice({ amount: order.total, currency_code: order.currency_code })}
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-accent px-8 py-4 font-display text-lg text-white shadow-brand-glow transition-transform duration-300 ease-brand hover:-translate-y-0.5"
        >
          Back to the collection →
        </Link>
      </div>
    );
  }

  const currency = cart?.currency_code ?? 'usd';
  const money = (amount: number) => formatPrice({ amount, currency_code: currency });

  return (
    <div className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
      <h1 className="mb-10 font-display text-4xl text-fg uppercase md:text-6xl">Checkout</h1>
      <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <div>
          <ol className="mb-8 flex gap-4 font-display text-sm uppercase tracking-wide">
            {(['details', 'delivery', 'payment'] as const).map((s, i) => (
              <li
                key={s}
                className={`flex items-center gap-2 ${step === s ? 'text-fg' : 'text-neutral-400'}`}
              >
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                    step === s ? 'bg-accent text-white' : 'bg-neutral-200 text-neutral-500'
                  }`}
                >
                  {i + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>

          {error ? (
            <p className="mb-4 rounded-xl bg-red-50 p-3 text-red-600 text-sm">{error}</p>
          ) : null}

          {step === 'details' ? (
            <form onSubmit={submitDetails} className="space-y-6">
              <div>
                <p className={SECTION_LABEL}>Contact</p>
                <input
                  type="email"
                  required
                  placeholder="Email address"
                  className={INPUT_CLS}
                  value={email}
                  onChange={(e) => setEmailValue(e.target.value)}
                />
              </div>
              <div>
                <p className={SECTION_LABEL}>Shipping</p>
                <p className="mb-4 rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 text-fg text-sm">
                  We currently ship within <span className="font-display">Florida</span> only. Live
                  carrier rates are calculated at checkout.
                </p>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      required
                      placeholder="First name"
                      className={INPUT_CLS}
                      value={address.first_name}
                      onChange={(e) => setAddress((a) => ({ ...a, first_name: e.target.value }))}
                    />
                    <input
                      required
                      placeholder="Last name"
                      className={INPUT_CLS}
                      value={address.last_name}
                      onChange={(e) => setAddress((a) => ({ ...a, last_name: e.target.value }))}
                    />
                  </div>
                  <input
                    required
                    placeholder="Street address"
                    className={INPUT_CLS}
                    value={address.address_1}
                    onChange={(e) => setAddress((a) => ({ ...a, address_1: e.target.value }))}
                  />
                  <input
                    required
                    placeholder="City"
                    className={INPUT_CLS}
                    value={address.city}
                    onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
                  />
                  <div className="grid grid-cols-3 gap-4">
                    <input
                      placeholder="State (FL)"
                      className={INPUT_CLS}
                      value={address.province}
                      onChange={(e) => setAddress((a) => ({ ...a, province: e.target.value }))}
                    />
                    <input
                      required
                      placeholder="ZIP"
                      className={INPUT_CLS}
                      value={address.postal_code}
                      onChange={(e) => setAddress((a) => ({ ...a, postal_code: e.target.value }))}
                    />
                    <input
                      required
                      placeholder="Country"
                      className={INPUT_CLS}
                      value={address.country_code}
                      onChange={(e) => setAddress((a) => ({ ...a, country_code: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <button type="submit" disabled={busy} className={`${PRIMARY_BTN} w-full`}>
                {busy ? 'Saving…' : 'Continue to delivery'}
              </button>
            </form>
          ) : null}

          {step === 'delivery' ? (
            <form onSubmit={submitDelivery} className="space-y-4">
              <p className={SECTION_LABEL}>Delivery</p>
              {options.length === 0 ? (
                <p className="text-neutral-500 text-sm">
                  No shipping options for this address — Touch Vodka may not ship to your region yet.
                </p>
              ) : (
                options.map((o) => (
                  <label
                    key={o.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-colors ${
                      chosenOption === o.id ? 'border-accent bg-accent/5' : 'border-concrete'
                    }`}
                  >
                    <span className="flex items-center gap-3 text-sm">
                      <input
                        type="radio"
                        name="shipping"
                        value={o.id}
                        checked={chosenOption === o.id}
                        onChange={() => setChosenOption(o.id)}
                      />
                      {o.name}
                    </span>
                    <span className="font-display text-sm">{money(o.amount)}</span>
                  </label>
                ))
              )}
              <div className="flex gap-3">
                <button type="button" className={GHOST_BTN} onClick={() => setStep('details')}>
                  Back
                </button>
                <button
                  type="submit"
                  disabled={busy || !chosenOption}
                  className={`${PRIMARY_BTN} flex-1`}
                >
                  {busy ? 'Saving…' : 'Continue to payment'}
                </button>
              </div>
            </form>
          ) : null}

          {step === 'payment' ? (
            <div className="space-y-4">
              <p className={SECTION_LABEL}>Payment</p>
              {session?.kind === 'stripe' && session.secret && STRIPE_PK ? (
                <StripePayment
                  publishableKey={STRIPE_PK}
                  clientSecret={session.secret}
                  busy={busy}
                  onConfirm={(confirm) => {
                    stripeConfirm.current = confirm;
                  }}
                  onError={setError}
                />
              ) : (
                <p className="rounded-xl border border-concrete bg-neutral-50 p-4 text-neutral-600 text-sm">
                  Test payment — no card required. Click “Place order” to complete a TEST order.
                </p>
              )}
              <div className="flex gap-3">
                <button type="button" className={GHOST_BTN} onClick={() => setStep('delivery')}>
                  Back
                </button>
                <button
                  type="button"
                  onClick={placeOrder}
                  disabled={busy}
                  className={`${PRIMARY_BTN} flex-1`}
                >
                  {busy ? 'Placing order…' : 'Place order'}
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {/* Order summary recap */}
        <aside className="h-fit rounded-2xl border border-concrete/60 bg-neutral-50 p-6 lg:sticky lg:top-28">
          <h2 className="font-display text-2xl text-fg">Order Summary</h2>
          {cart ? (
            <>
              <ul className="mt-5 space-y-3">
                {cart.items.map((it) => (
                  <li key={it.id} className="flex justify-between gap-3 text-sm">
                    <span className="text-neutral-600">
                      {it.title} × {it.quantity}
                    </span>
                    <span className="text-fg">{money(it.unit_price * it.quantity)}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-5 space-y-2 border-concrete border-t pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Subtotal</dt>
                  <dd className="text-fg">{money(cart.subtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Shipping</dt>
                  <dd className="text-fg">
                    {cart.shipping_total > 0 ? (
                      money(cart.shipping_total)
                    ) : (
                      <span className="text-neutral-500">Calculated at checkout</span>
                    )}
                  </dd>
                </div>
                <div className="flex justify-between border-concrete border-t pt-3 font-display text-fg text-lg">
                  <dt>Total</dt>
                  <dd>{money(cart.total)}</dd>
                </div>
              </dl>
            </>
          ) : null}
          <p className="mt-5 text-center text-neutral-400 text-xs">
            Secure SSL checkout · 21+ · Adult signature
          </p>
        </aside>
      </div>
    </div>
  );
}

/** Stripe's session payload carries the client secret under a couple of keys. */
function clientSecretOf(data: Record<string, unknown>): string | null {
  const v = data.client_secret ?? data.clientSecret;
  return typeof v === 'string' ? v : null;
}
