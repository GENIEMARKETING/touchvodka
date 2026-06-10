import PageShell, { PageHero } from '@/components/PageShell';
import { CartView } from '@/components/vinny/commerce/cart-view';
import type { Metadata } from 'next';

// Cart is a personal, non-indexable view — keep it out of search + sitemaps.
export const metadata: Metadata = {
  title: 'Your Cart',
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <PageShell>
      <PageHero eyebrow="// CART" title="Your Cart" />
      <div className="mx-auto min-h-[40vh] max-w-2xl border-black border-x-4 md:border-x-0">
        <CartView />
      </div>
    </PageShell>
  );
}
