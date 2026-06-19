import PageShell from '@/components/PageShell';
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
      <section className="mx-auto min-h-[50vh] max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <h1 className="mb-10 font-display text-4xl text-fg uppercase md:text-6xl">Your Cart</h1>
        <CartView layout="page" />
      </section>
    </PageShell>
  );
}
