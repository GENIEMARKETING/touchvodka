'use client';

/**
 * CartView — the cart body shared by the slide-over drawer and the `/cart` page.
 * Pure presentation over `useCart`: line items, quantity steppers, promo entry,
 * and the order summary. All money is rendered in the cart's own currency.
 */
import { useCart } from '@/components/vinny/commerce/cart-context';
import { formatPrice } from '@/lib/commerce';
import { Button, buttonVariants } from '@geniemarketing/ui';
import { Trash2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { type FormEvent, useState } from 'react';

export function CartView({ onCheckout }: { onCheckout?: () => void }) {
  const { cart, updateItem, removeItem, applyPromo, loading, error, closeDrawer } = useCart();
  const [promo, setPromo] = useState('');
  const currency = cart?.currency_code ?? 'usd';
  const money = (amount: number) => formatPrice({ amount, currency_code: currency });

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 px-6 py-16 text-center">
        <p className="font-display text-2xl uppercase">Your cart is empty</p>
        <Link href="/products" onClick={closeDrawer} className={buttonVariants()}>
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

  return (
    <div className="flex h-full flex-col">
      <ul className="flex-1 divide-y-2 divide-black overflow-auto">
        {cart.items.map((item) => (
          <li key={item.id} className="flex gap-4 p-4">
            <div className="relative h-20 w-16 flex-shrink-0 border-2 border-black bg-neutral-100">
              {item.thumbnail ? (
                <Image
                  src={item.thumbnail}
                  alt={item.title}
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
              ) : null}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{item.title}</p>
              <p className="font-mono text-sm opacity-70">{money(item.unit_price)}</p>
              <div className="mt-2 flex items-center gap-3">
                <div className="flex items-center border-2 border-black text-sm">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => updateItem(item.id, item.quantity - 1)}
                    disabled={loading}
                    className="px-3 py-1 hover:bg-black hover:text-white"
                  >
                    −
                  </button>
                  <span className="min-w-8 text-center font-mono">{item.quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => updateItem(item.id, item.quantity + 1)}
                    disabled={loading}
                    className="px-3 py-1 hover:bg-black hover:text-white"
                  >
                    +
                  </button>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${item.title}`}
                  onClick={() => removeItem(item.id)}
                  disabled={loading}
                  className="text-neutral-500 transition-colors hover:text-accent"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className="font-mono text-sm">{money(item.unit_price * item.quantity)}</p>
          </li>
        ))}
      </ul>

      <div className="border-black border-t-4 p-4">
        <form onSubmit={submitPromo} className="mb-4 flex gap-2">
          <input
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            placeholder="Promo code"
            className="min-w-0 flex-1 border-2 border-black p-2 font-mono text-sm uppercase"
          />
          <Button type="submit" variant="ghost" disabled={loading || !promo.trim()}>
            Apply
          </Button>
        </form>

        {(cart.promotions ?? []).length > 0 ? (
          <p className="mb-2 font-mono text-accent text-xs uppercase">
            Applied: {(cart.promotions ?? []).map((p) => p.code).join(', ')}
          </p>
        ) : null}

        <dl className="mb-4 space-y-1 font-mono text-sm">
          <div className="flex justify-between">
            <dt className="opacity-70">Subtotal</dt>
            <dd>{money(cart.subtotal)}</dd>
          </div>
          {cart.discount_total > 0 ? (
            <div className="flex justify-between text-accent">
              <dt>Discount</dt>
              <dd>−{money(cart.discount_total)}</dd>
            </div>
          ) : null}
          {cart.shipping_total > 0 ? (
            <div className="flex justify-between">
              <dt className="opacity-70">Shipping</dt>
              <dd>{money(cart.shipping_total)}</dd>
            </div>
          ) : null}
          {cart.tax_total > 0 ? (
            <div className="flex justify-between">
              <dt className="opacity-70">Tax</dt>
              <dd>{money(cart.tax_total)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between border-black border-t-2 pt-1 font-bold text-base">
            <dt>Total</dt>
            <dd>{money(cart.total)}</dd>
          </div>
        </dl>

        {error ? <p className="mb-2 font-mono text-accent text-xs">{error}</p> : null}

        {onCheckout ? (
          <Button onClick={onCheckout} className="w-full">
            Checkout
          </Button>
        ) : (
          <Link href="/checkout" className={`${buttonVariants()} w-full`}>
            Checkout
          </Link>
        )}
      </div>
    </div>
  );
}
