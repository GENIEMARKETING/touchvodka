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
  addShippingMethod,
  listRegions,
  listShippingOptions,
  setAddresses,
} from '@/lib/checkout';
import { formatPrice, medusa } from '@/lib/commerce';
import type { Order } from '@geniemarketing/commerce';
import { createPaymentsClient, describeProvider } from '@geniemarketing/commerce/payments';
import { Button, Input } from '@geniemarketing/ui';
import Link from 'next/link';
import { type FormEvent, useCallback, useRef, useState } from 'react';

type Step = 'details' | 'delivery' | 'payment' | 'done';

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
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <p className="font-display text-3xl uppercase">Online ordering coming soon</p>
        <p className="mt-4 font-mono opacity-70">
          In the meantime, find Touch Vodka at a store near you.
        </p>
        <Link
          href="/find-us"
          className="mt-6 inline-block font-display text-accent text-xl underline"
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
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <p className="mb-2 font-mono text-accent text-sm uppercase tracking-widest">Order placed</p>
        <h1 className="mb-6 font-display text-5xl uppercase">Thank you</h1>
        <p className="font-mono opacity-80">
          Order <span className="font-bold">#{order.display_id}</span> — a confirmation is on its
          way to {order.email}.
        </p>
        <p className="mt-2 font-mono text-lg">
          Total {formatPrice({ amount: order.total, currency_code: order.currency_code })}
        </p>
        <Link
          href="/products"
          className="mt-8 inline-block font-display text-accent text-xl underline"
        >
          Back to the collection →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-12 px-6 py-12 lg:grid-cols-[1.3fr_1fr]">
      <div>
        <ol className="mb-8 flex gap-2 font-mono text-xs uppercase tracking-widest">
          {(['details', 'delivery', 'payment'] as const).map((s, i) => (
            <li
              key={s}
              className={`flex items-center gap-2 ${step === s ? 'text-accent' : 'opacity-50'}`}
            >
              <span className="flex h-5 w-5 items-center justify-center border-2 border-current">
                {i + 1}
              </span>
              {s}
            </li>
          ))}
        </ol>

        {error ? (
          <p className="mb-4 border-2 border-accent p-3 font-mono text-accent text-sm">{error}</p>
        ) : null}

        {step === 'details' ? (
          <form onSubmit={submitDetails} className="space-y-4">
            <Input
              type="email"
              required
              placeholder="Email"
              value={email}
              onChange={(e) => setEmailValue(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                required
                placeholder="First name"
                value={address.first_name}
                onChange={(e) => setAddress((a) => ({ ...a, first_name: e.target.value }))}
              />
              <Input
                required
                placeholder="Last name"
                value={address.last_name}
                onChange={(e) => setAddress((a) => ({ ...a, last_name: e.target.value }))}
              />
            </div>
            <Input
              required
              placeholder="Address"
              value={address.address_1}
              onChange={(e) => setAddress((a) => ({ ...a, address_1: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                required
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))}
              />
              <Input
                placeholder="State / Province"
                value={address.province}
                onChange={(e) => setAddress((a) => ({ ...a, province: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                required
                placeholder="Postal code"
                value={address.postal_code}
                onChange={(e) => setAddress((a) => ({ ...a, postal_code: e.target.value }))}
              />
              <Input
                required
                placeholder="Country code (e.g. us)"
                value={address.country_code}
                onChange={(e) => setAddress((a) => ({ ...a, country_code: e.target.value }))}
              />
            </div>
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? 'Saving…' : 'Continue to delivery'}
            </Button>
          </form>
        ) : null}

        {step === 'delivery' ? (
          <form onSubmit={submitDelivery} className="space-y-4">
            {options.length === 0 ? (
              <p className="font-mono text-sm opacity-70">
                No shipping options for this address — Touch Vodka may not ship to your region yet.
              </p>
            ) : (
              options.map((o) => (
                <label
                  key={o.id}
                  className={`flex cursor-pointer items-center justify-between border-2 p-4 ${
                    chosenOption === o.id ? 'border-accent' : 'border-black'
                  }`}
                >
                  <span className="flex items-center gap-3 font-mono text-sm">
                    <input
                      type="radio"
                      name="shipping"
                      value={o.id}
                      checked={chosenOption === o.id}
                      onChange={() => setChosenOption(o.id)}
                    />
                    {o.name}
                  </span>
                  <span className="font-mono text-sm">
                    {formatPrice({ amount: o.amount, currency_code: cart?.currency_code ?? 'usd' })}
                  </span>
                </label>
              ))
            )}
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setStep('details')}>
                Back
              </Button>
              <Button type="submit" disabled={busy || !chosenOption} className="flex-1">
                {busy ? 'Saving…' : 'Continue to payment'}
              </Button>
            </div>
          </form>
        ) : null}

        {step === 'payment' ? (
          <div className="space-y-4">
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
              <p className="border-2 border-black p-4 font-mono text-sm opacity-80">
                Test payment — no card required. Click “Place order” to complete a TEST order.
              </p>
            )}
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={() => setStep('delivery')}>
                Back
              </Button>
              <Button type="button" onClick={placeOrder} disabled={busy} className="flex-1">
                {busy ? 'Placing order…' : 'Place order'}
              </Button>
            </div>
          </div>
        ) : null}
      </div>

      {/* Order summary rail */}
      <aside className="h-fit border-4 border-black">
        <h2 className="border-black border-b-4 p-4 font-display text-2xl uppercase">Order</h2>
        <CartView />
      </aside>
    </div>
  );
}

/** Stripe's session payload carries the client secret under a couple of keys. */
function clientSecretOf(data: Record<string, unknown>): string | null {
  const v = data.client_secret ?? data.clientSecret;
  return typeof v === 'string' ? v : null;
}
