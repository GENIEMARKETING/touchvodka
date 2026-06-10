import PageShell from '@/components/PageShell';
import { Checkout } from '@/components/vinny/commerce/checkout';
import type { Metadata } from 'next';

// Checkout is transactional + personal — never indexed.
export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
};

export default function CheckoutPage() {
  return (
    <PageShell>
      <Checkout />
    </PageShell>
  );
}
