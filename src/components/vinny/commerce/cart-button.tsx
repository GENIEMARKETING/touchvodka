'use client';

/**
 * CartButton — header trigger that opens the cart drawer and badges the live
 * item count. Renders nothing until commerce is wired for this brand, so the
 * bespoke brutalist nav stays unchanged on the brand-only build.
 */
import { useCart } from '@/components/vinny/commerce/cart-context';
import { ShoppingBag } from 'lucide-react';

export function CartButton({ className = '' }: { className?: string }) {
  const { configured, count, openDrawer } = useCart();
  if (!configured) return null;

  return (
    <button
      type="button"
      aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
      onClick={openDrawer}
      className={`relative flex items-center justify-center bg-white p-6 text-black transition-colors hover:bg-accent hover:text-white ${className}`}
    >
      <ShoppingBag className="h-6 w-6" />
      {count > 0 ? (
        <span className="-translate-y-1/3 absolute top-3 right-3 flex h-5 min-w-5 translate-x-1/3 items-center justify-center bg-accent px-1 font-bold text-[10px] text-white">
          {count}
        </span>
      ) : null}
    </button>
  );
}
