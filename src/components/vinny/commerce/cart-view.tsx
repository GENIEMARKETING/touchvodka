'use client';

/**
 * CartView — the cart body shared by the slide-over drawer and the `/cart` page.
 * Pure presentation over `useCart`: line items, quantity steppers, promo entry,
 * and the order summary. Refined-Bold styling (soft rounded cards, no brutalist
 * black borders). `layout` switches between the stacked drawer and the 2-column
 * page (items + sticky summary card, Figma cart 56:62).
 */
import { useCart } from '@/components/vinny/commerce/cart-context';
import { formatPrice } from '@/lib/commerce';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { type FormEvent, useState } from 'react';

export function CartView({
  onCheckout,
  layout = 'drawer',
}: {
  onCheckout?: () => void;
  layout?: 'drawer' | 'page';
}) {
  const { cart, updateItem, removeItem, applyPromo, loading, error, closeDrawer } = useCart();
  const [promo, setPromo] = useState('');
  const currency = cart?.currency_code ?? 'usd';
  const money = (amount: number) => formatPrice({ amount, currency_code: currency });

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 px-6 py-20 text-center">
        <p className="font-display text-2xl text-fg uppercase">Your cart is empty</p>
        <Link
          href="/products"
          onClick={closeDrawer}
          className="inline-flex items-center rounded-full bg-accent px-7 py-3.5 font-display text-white transition-transform duration-300 ease-brand hover:-translate-y-0.5"
        >
          Explore the collection
        </Link>
      </div>
    );
  }

  function submitPromo(e: FormEvent) {
    e.preventDefault();
    const code = promo.trim();
    if (code) applyPromo(code).then(() => setPromo(''));
  }

  const items = (
    <ul className={layout === 'page' ? 'space-y-4' : 'flex-1 space-y-3 overflow-auto px-1'}>
      {cart.items.map((item) => (
        <li
          key={item.id}
          className="flex gap-4 rounded-2xl border border-concrete/60 bg-white p-4 shadow-soft"
        >
          <div className="relative h-24 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-warm">
            {item.thumbnail ? (
              <Image
                src={item.thumbnail}
                alt={item.title}
                fill
                sizes="80px"
                className="object-contain p-2"
              />
            ) : null}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-fg uppercase">{item.title}</p>
            <p className="text-neutral-500 text-sm">{money(item.unit_price)}</p>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center rounded-full border border-concrete text-sm">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  onClick={() => updateItem(item.id, item.quantity - 1)}
                  disabled={loading}
                  className="rounded-l-full px-3 py-1 transition-colors hover:bg-neutral-100"
                >
                  −
                </button>
                <span className="min-w-8 text-center font-mono">{item.quantity}</span>
                <button
                  type="button"
                  aria-label="Increase quantity"
                  onClick={() => updateItem(item.id, item.quantity + 1)}
                  disabled={loading}
                  className="rounded-r-full px-3 py-1 transition-colors hover:bg-neutral-100"
                >
                  +
                </button>
              </div>
              <button
                type="button"
                aria-label={`Remove ${item.title}`}
                onClick={() => removeItem(item.id)}
                disabled={loading}
                className="text-neutral-400 transition-colors hover:text-accent"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <p className="font-display text-fg">{money(item.unit_price * item.quantity)}</p>
        </li>
      ))}
    </ul>
  );

  const summary = (
    <div
      className={
        layout === 'page'
          ? 'rounded-2xl border border-concrete/60 bg-neutral-50 p-6 lg:sticky lg:top-28'
          : 'border-concrete border-t p-4'
      }
    >
      <form onSubmit={submitPromo} className="mb-4 flex gap-2">
        <input
          value={promo}
          onChange={(e) => setPromo(e.target.value)}
          placeholder="Promo code"
          className="min-w-0 flex-1 rounded-full border border-concrete px-4 py-2 text-sm uppercase focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !promo.trim()}
          className="rounded-full border border-concrete px-5 py-2 font-display text-fg text-sm transition-colors hover:border-fg disabled:opacity-50"
        >
          Apply
        </button>
      </form>

      {(cart.promotions ?? []).length > 0 ? (
        <p className="mb-3 font-mono text-accent text-xs uppercase">
          Applied: {(cart.promotions ?? []).map((p) => p.code).join(', ')}
        </p>
      ) : null}

      <dl className="mb-5 space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-neutral-500">Subtotal</dt>
          <dd className="text-fg">{money(cart.subtotal)}</dd>
        </div>
        {cart.discount_total > 0 ? (
          <div className="flex justify-between text-accent">
            <dt>Discount</dt>
            <dd>−{money(cart.discount_total)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between">
          <dt className="text-neutral-500">Shipping</dt>
          <dd className="text-fg">{cart.shipping_total > 0 ? money(cart.shipping_total) : '$10.00'}</dd>
        </div>
        {cart.tax_total > 0 ? (
          <div className="flex justify-between">
            <dt className="text-neutral-500">Tax</dt>
            <dd className="text-fg">{money(cart.tax_total)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between border-concrete border-t pt-3 font-display text-fg text-lg">
          <dt>Total</dt>
          <dd>{money(cart.total)}</dd>
        </div>
      </dl>

      {error ? <p className="mb-2 text-accent text-xs">{error}</p> : null}

      {onCheckout ? (
        <button
          type="button"
          onClick={onCheckout}
          className="w-full rounded-full bg-accent px-7 py-4 font-display text-white transition-transform duration-300 ease-brand hover:-translate-y-0.5"
        >
          Checkout
        </button>
      ) : (
        <Link
          href="/checkout"
          className="block w-full rounded-full bg-accent px-7 py-4 text-center font-display text-white transition-transform duration-300 ease-brand hover:-translate-y-0.5"
        >
          Checkout
        </Link>
      )}
      <p className="mt-3 text-center text-neutral-400 text-xs">
        Secure checkout · 21+ · Ships where legal
      </p>
    </div>
  );

  if (layout === 'page') {
    return (
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">{items}</div>
        <aside className="lg:col-span-1">{summary}</aside>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      {items}
      {summary}
    </div>
  );
}
