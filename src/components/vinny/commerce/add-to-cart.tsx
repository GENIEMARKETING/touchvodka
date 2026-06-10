'use client';

/**
 * AddToCart — the DTC "buy" affordance. Resolves the selected variant from the
 * product's options and adds it to the shared Medusa cart via `useCart`.
 *
 * Two layouts off one component (variant-not-configuration):
 *   • `full`    — PDP: option selectors + quantity stepper + price.
 *   • `compact` — PLP card: default variant, single "Add" button.
 *
 * Renders nothing when commerce isn't wired for this brand — the PDP/PLP still
 * show the brand catalogue; only the buy button is gated on a live channel.
 */
import { useCart } from '@/components/vinny/commerce/cart-context';
import { formatPrice } from '@/lib/commerce';
import type { ProductVariant, StoreProduct } from '@geniemarketing/commerce';
import { Button } from '@geniemarketing/ui';
import { useMemo, useState } from 'react';

export type AddToCartProps = {
  product: StoreProduct;
  layout?: 'full' | 'compact';
};

function variantPrice(v: ProductVariant): string | null {
  const cp = v.calculated_price;
  if (!cp) return null;
  return formatPrice({
    amount: cp.calculated_amount ?? cp.amount,
    currency_code: cp.currency_code,
  });
}

/** A variant is buyable unless it manages inventory and is out of stock. */
function inStock(v: ProductVariant): boolean {
  if (!v.manage_inventory) return true;
  return (v.inventory_quantity ?? 0) > 0 || Boolean(v.allow_backorder);
}

export function AddToCart({ product, layout = 'full' }: AddToCartProps) {
  const { addItem, loading, configured } = useCart();
  const variants = product.variants ?? [];

  // Selected option values keyed by option title; seed with each variant's first.
  const [selected, setSelected] = useState<Record<string, string>>(() => {
    const seed: Record<string, string> = {};
    for (const opt of product.options ?? []) seed[opt.title] = opt.values[0]?.value ?? '';
    return seed;
  });
  const [qty, setQty] = useState(1);

  // Resolve the variant whose option values match the current selection. With no
  // options (our single-SKU spirits), the lone variant is always the answer.
  const variant = useMemo<ProductVariant | null>(() => {
    if (variants.length <= 1) return variants[0] ?? null;
    return (
      variants.find((v) =>
        (v.options ?? []).every((ov) => {
          const opt = (product.options ?? []).find((o) => o.id === ov.option_id);
          return !opt || selected[opt.title] === ov.value;
        }),
      ) ?? null
    );
  }, [variants, product.options, selected]);

  if (!configured) return null;

  const price = variant ? variantPrice(variant) : null;
  const buyable = variant ? inStock(variant) : false;

  if (layout === 'compact') {
    return (
      <Button
        disabled={!buyable || loading}
        onClick={() => variant && addItem(variant.id, 1)}
        className="w-full"
      >
        {buyable ? `Add${price ? ` · ${price}` : ''}` : 'Sold out'}
      </Button>
    );
  }

  return (
    <div className="border-black border-t-4 pt-6">
      {price ? (
        <p className="mb-4 font-display text-4xl">{price}</p>
      ) : (
        <p className="mb-4 font-mono text-sm opacity-60">Select options</p>
      )}

      {(product.options ?? []).length > 1 || variants.length > 1
        ? (product.options ?? []).map((opt) => (
            <label key={opt.id} className="mb-4 block">
              <span className="mb-1 block font-mono text-accent text-xs uppercase tracking-widest">
                {opt.title}
              </span>
              <select
                value={selected[opt.title] ?? ''}
                onChange={(e) => setSelected((s) => ({ ...s, [opt.title]: e.target.value }))}
                className="w-full border-2 border-black bg-white p-3 font-mono text-sm"
              >
                {opt.values.map((val) => (
                  <option key={val.id} value={val.value}>
                    {val.value}
                  </option>
                ))}
              </select>
            </label>
          ))
        : null}

      <div className="mb-4 flex items-center gap-4">
        <span className="font-mono text-accent text-xs uppercase tracking-widest">Qty</span>
        <div className="flex items-center border-2 border-black">
          <button
            type="button"
            aria-label="Decrease quantity"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="px-4 py-2 transition-colors hover:bg-black hover:text-white"
          >
            −
          </button>
          <span className="min-w-10 text-center font-mono">{qty}</span>
          <button
            type="button"
            aria-label="Increase quantity"
            onClick={() => setQty((q) => q + 1)}
            className="px-4 py-2 transition-colors hover:bg-black hover:text-white"
          >
            +
          </button>
        </div>
      </div>

      <Button
        disabled={!buyable || loading}
        onClick={() => variant && addItem(variant.id, qty)}
        className="w-full"
      >
        {loading ? 'Adding…' : buyable ? 'Add to cart' : 'Sold out'}
      </Button>
    </div>
  );
}
