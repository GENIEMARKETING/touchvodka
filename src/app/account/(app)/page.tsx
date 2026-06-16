'use client';

import type { Order } from '@geniemarketing/commerce';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/vinny/commerce/auth-context';
/** Account overview — greeting + the 3 most-recent orders + quick links (T48). */
import { OrderHistory } from '@/components/vinny/order-history/order-history';
import { medusa } from '@/lib/commerce';

export default function AccountOverview() {
  const { customer } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!customer) return;
    let alive = true;
    medusa
      .listOrders({ limit: 3 })
      .then((r) => {
        if (alive) setOrders(r.orders);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [customer]);

  if (!customer) return null;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl uppercase">
          Welcome back, {customer.first_name ?? 'friend'}
        </h2>
        <p className="mt-1 font-mono text-sm opacity-70">{customer.email}</p>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold text-sm uppercase tracking-widest">Recent orders</h3>
          <Link href="/account/orders" className="text-sm underline">
            View all →
          </Link>
        </div>
        <OrderHistory orders={orders} />
      </section>

      <div className="flex flex-wrap gap-6 font-mono text-sm">
        <Link href="/account/addresses" className="underline">
          Manage addresses →
        </Link>
        <Link href="/account/settings" className="underline">
          Account settings →
        </Link>
      </div>
    </div>
  );
}
