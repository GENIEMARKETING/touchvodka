'use client';

import type { Order } from '@geniemarketing/commerce';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/vinny/commerce/auth-context';
/** Full order history for the logged-in customer (T48). */
import { OrderHistory } from '@/components/vinny/order-history/order-history';
import { medusa } from '@/lib/commerce';

export default function OrdersPage() {
  const { customer } = useAuth();
  const [orders, setOrders] = useState<Order[] | null>(null);

  useEffect(() => {
    if (!customer) return;
    let alive = true;
    medusa
      .listOrders({ limit: 50 })
      .then((r) => {
        if (alive) setOrders(r.orders);
      })
      .catch(() => {
        if (alive) setOrders([]);
      });
    return () => {
      alive = false;
    };
  }, [customer]);

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl uppercase">Orders</h2>
      {orders === null ? (
        <p className="font-mono opacity-60">Loading…</p>
      ) : (
        <OrderHistory orders={orders} />
      )}
    </div>
  );
}
