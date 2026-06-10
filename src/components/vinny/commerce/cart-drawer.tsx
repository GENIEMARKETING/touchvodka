'use client';

/**
 * CartDrawer — the slide-over cart, mounted once in the layout. Opens on add-to-
 * cart and from the header button (both via `useCart` drawer state). Renders the
 * shared CartView; "Checkout" closes the drawer and routes to /checkout.
 *
 * Inert when commerce isn't configured — nothing ever opens, so the regulated
 * brand-only build shows no cart chrome.
 */
import { useCart } from '@/components/vinny/commerce/cart-context';
import { CartView } from '@/components/vinny/commerce/cart-view';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function CartDrawer() {
  const { configured, drawerOpen, closeDrawer, count } = useCart();
  const router = useRouter();

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [drawerOpen]);

  if (!configured) return null;

  return (
    <div
      aria-hidden={!drawerOpen}
      className={`fixed inset-0 z-[300] ${drawerOpen ? '' : 'pointer-events-none'}`}
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close cart"
        tabIndex={drawerOpen ? 0 : -1}
        onClick={closeDrawer}
        className={`absolute inset-0 bg-black/40 transition-opacity ${
          drawerOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {/* Panel */}
      <aside
        aria-label="Shopping cart"
        className={`absolute top-0 right-0 flex h-full w-full max-w-md flex-col border-black border-l-4 bg-white transition-transform duration-300 ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between border-black border-b-4 p-4">
          <h2 className="font-display text-2xl uppercase">Your Cart ({count})</h2>
          <button
            type="button"
            aria-label="Close cart"
            onClick={closeDrawer}
            className="border-2 border-black p-1.5 transition-colors hover:bg-accent hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1">
          <CartView
            onCheckout={() => {
              closeDrawer();
              router.push('/checkout');
            }}
          />
        </div>
      </aside>
    </div>
  );
}
