'use client';

/**
 * CartButton — header cart control. Always visible (Refined-Bold redesign): when
 * commerce is wired for this brand it opens the live cart drawer and badges the
 * item count; until then it's a plain link to the cart page so the nav always
 * shows a cart. Inherits the header's text colour (dark over the hero, white on
 * the scrolled black bar) instead of a fixed background.
 */
import { useCart } from '@/components/vinny/commerce/cart-context';
import { ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export function CartButton({ className = '' }: { className?: string }) {
  const { configured, count, openDrawer } = useCart();
  const base = `relative flex items-center justify-center p-2 transition-colors hover:text-accent ${className}`;

  if (!configured) {
    return (
      <Link href="/cart" aria-label="Cart" className={base}>
        <ShoppingBag className="h-6 w-6" />
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={`Open cart, ${count} item${count === 1 ? '' : 's'}`}
      onClick={openDrawer}
      className={base}
    >
      <ShoppingBag className="h-6 w-6" />
      {count > 0 ? (
        <span className="-top-1 -right-1 absolute flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 font-bold text-[10px] text-white">
          {count}
        </span>
      ) : null}
    </button>
  );
}
