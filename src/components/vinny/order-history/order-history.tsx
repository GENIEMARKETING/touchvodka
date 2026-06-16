import { formatAmount, type Order } from '@geniemarketing/commerce';

/**
 * OrderHistory + OrderDetail — the account-area order surfaces (T48). Both are
 * presentational: the page fetches the customer's orders with the authed Medusa
 * client (`medusa.listOrders()` / `medusa.getOrder(id)`) and passes the data in.
 *
 * `OrderHistory` is the paginated list; `OrderDetail` is one order's line items +
 * status + tracking (account-styled, distinct from the celebratory post-purchase
 * `order-confirmation` block). Variant-not-configuration: orders/order + href
 * builders.
 */
function formatOrderDate(iso: string | undefined, locale: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : d.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' });
}

export type OrderHistoryProps = {
  orders: Order[];
  /** Build the href to an order's detail page (default `/account/orders/:id`). */
  hrefBuilder?: (order: Order) => string;
  /** Where the empty state's CTA points. */
  shopHref?: string;
  locale?: string;
};

export function OrderHistory({
  orders,
  hrefBuilder = (o) => `/account/orders/${o.id}`,
  shopHref = '/products',
  locale = 'en-US',
}: OrderHistoryProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="opacity-70">You haven&apos;t placed any orders yet.</p>
        <a href={shopHref} className="mt-3 inline-block text-sm underline">
          Start shopping →
        </a>
      </div>
    );
  }

  return (
    <ul className="divide-y rounded-lg border">
      {orders.map((order) => (
        <li key={order.id}>
          <a
            href={hrefBuilder(order)}
            className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-current/5"
          >
            <div>
              <p className="font-medium">Order #{order.display_id}</p>
              <p className="text-sm opacity-60">
                {formatOrderDate(order.created_at, locale)} · {order.items.length} item
                {order.items.length === 1 ? '' : 's'} ·{' '}
                <span className="capitalize">{order.status}</span>
              </p>
            </div>
            <span className="font-medium">
              {formatAmount(order.total, order.currency_code, locale)}
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export type OrderDetailProps = {
  order: Order;
  /** Back link to the order list. */
  backHref?: string;
  locale?: string;
};

export function OrderDetail({
  order,
  backHref = '/account/orders',
  locale = 'en-US',
}: OrderDetailProps) {
  const trackingLinks = (order.fulfillments ?? []).flatMap((f) => f.tracking_links);

  return (
    <section className="space-y-6">
      <div>
        <a href={backHref} className="text-sm underline opacity-70">
          ← All orders
        </a>
        <h1 className="mt-2 font-bold text-2xl tracking-tight">Order #{order.display_id}</h1>
        <p className="text-sm opacity-60">
          {formatOrderDate(order.created_at, locale)} ·{' '}
          <span className="capitalize">{order.status}</span>
        </p>
      </div>

      <div className="rounded-lg border">
        <ul className="divide-y">
          {order.items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 p-4">
              {item.thumbnail ? (
                <img
                  src={item.thumbnail}
                  alt=""
                  className="h-14 w-14 flex-none rounded object-cover"
                />
              ) : null}
              <div className="flex-1">
                <p className="font-medium">{item.title}</p>
                <p className="text-sm opacity-60">Qty {item.quantity}</p>
              </div>
              <span className="font-medium">
                {formatAmount(item.unit_price * item.quantity, order.currency_code, locale)}
              </span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t p-4 font-bold text-lg">
          <span>Total</span>
          <span>{formatAmount(order.total, order.currency_code, locale)}</span>
        </div>
      </div>

      {trackingLinks.length > 0 ? (
        <div className="rounded-lg bg-[var(--surface-muted,#f4f4f5)] p-5">
          <h2 className="font-semibold">Tracking</h2>
          <ul className="mt-2 space-y-1">
            {trackingLinks.map((t) => (
              <li key={t.tracking_number}>
                <a href={t.url} target="_blank" rel="noreferrer" className="underline">
                  Track {t.tracking_number} →
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
