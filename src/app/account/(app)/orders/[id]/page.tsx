'use client';

import type { Order } from '@geniemarketing/commerce';
import { use, useEffect, useState } from 'react';
import { useAuth } from '@/components/vinny/commerce/auth-context';
/** A single order's detail (line items, status, tracking) for the logged-in
 *  customer (T48). Medusa scopes /store/orders/:id to the authed customer. */
import { OrderDetail } from '@/components/vinny/order-history/order-history';
import { medusa } from '@/lib/commerce';

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { customer } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!customer) return;
    let alive = true;
    medusa
      .getOrder(id)
      .then((o) => {
        if (alive) setOrder(o);
      })
      .catch(() => {
        if (alive) setMissing(true);
      });
    return () => {
      alive = false;
    };
  }, [customer, id]);

  if (missing) {
    return <p className="font-mono opacity-70">We could not find that order.</p>;
  }
  if (!order) {
    return <p className="font-mono opacity-60">Loading…</p>;
  }
  return <OrderDetail order={order} />;
}
