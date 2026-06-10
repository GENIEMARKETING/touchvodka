'use client';

/**
 * CartProvider / useCart — the storefront's only piece of commerce STATE.
 *
 * The shared Medusa is the source of truth (infrastructure/commerce); the site
 * keeps just the cart **id** in localStorage and re-reads the cart from Medusa,
 * scoped to this brand's sales channel by the publishable key. Every mutation
 * goes through the published `@geniemarketing/commerce` client (S4·I) — no cart
 * math lives here.
 *
 * GRACEFUL DEGRADATION (same contract as lib/commerce.ts): with no
 * `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` the provider is INERT — `configured` is
 * false, every op is a no-op, and the cart UI hides itself. Touch Vodka is a
 * regulated spirits brand: until S6/S3 wires the Medusa channel + Stripe TEST
 * key, the site is brand-only and points shoppers at the stockist locator.
 */
import { commerceConfigured, medusa } from '@/lib/commerce';
import type { Cart } from '@geniemarketing/commerce';
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const CART_ID_KEY = 'tv-cart-id';
/** Optional default region for cart creation (Medusa picks one if omitted). */
const REGION_ID = process.env.NEXT_PUBLIC_MEDUSA_REGION_ID;

type CartContextValue = {
  /** The live Medusa cart, or null before the first add / when unconfigured. */
  cart: Cart | null;
  /** Total line-item quantity (the header badge). */
  count: number;
  /** Is a Medusa storefront wired for this brand? */
  configured: boolean;
  loading: boolean;
  error: string | null;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  applyPromo: (code: string) => Promise<void>;
  setEmail: (email: string) => Promise<void>;
  /** Drop the local cart id after an order completes. */
  reset: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const configured = commerceConfigured();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Rehydrate an existing cart on mount. A stale/expired id (Medusa 4xx) is
  // dropped rather than surfaced — the shopper just starts a fresh cart.
  useEffect(() => {
    if (!configured) return;
    const id = localStorage.getItem(CART_ID_KEY);
    if (!id) return;
    let alive = true;
    (async () => {
      try {
        const c = await medusa.getCart(id);
        if (alive) setCart(c);
      } catch {
        localStorage.removeItem(CART_ID_KEY);
      }
    })();
    return () => {
      alive = false;
    };
  }, [configured]);

  // Lazily create-or-reuse the cart; persists the id so reloads keep the cart.
  const ensureCart = useCallback(async (): Promise<string> => {
    const existing = cart?.id ?? localStorage.getItem(CART_ID_KEY);
    if (existing) return existing;
    const created = await medusa.createCart(REGION_ID);
    localStorage.setItem(CART_ID_KEY, created.id);
    setCart(created);
    return created.id;
  }, [cart]);

  // Every mutation funnels through here: run it, capture the fresh cart, surface
  // a single error string, and never leave `loading` stuck.
  const run = useCallback(
    async (op: (cartId: string) => Promise<Cart>) => {
      if (!configured) return;
      setLoading(true);
      setError(null);
      try {
        const id = await ensureCart();
        setCart(await op(id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Cart update failed');
      } finally {
        setLoading(false);
      }
    },
    [configured, ensureCart],
  );

  const addItem = useCallback(
    async (variantId: string, quantity = 1) => {
      await run((id) => medusa.addLineItem(id, variantId, quantity));
      setDrawerOpen(true);
    },
    [run],
  );

  const updateItem = useCallback(
    (itemId: string, quantity: number) =>
      run((id) =>
        quantity <= 0
          ? medusa.removeLineItem(id, itemId)
          : medusa.updateLineItem(id, itemId, quantity),
      ),
    [run],
  );

  const removeItem = useCallback(
    (itemId: string) => run((id) => medusa.removeLineItem(id, itemId)),
    [run],
  );

  const applyPromo = useCallback(
    (code: string) => run((id) => medusa.applyPromotion(id, code)),
    [run],
  );

  const setEmail = useCallback((email: string) => run((id) => medusa.setEmail(id, email)), [run]);

  const reset = useCallback(() => {
    localStorage.removeItem(CART_ID_KEY);
    setCart(null);
  }, []);

  const count = useMemo(() => (cart?.items ?? []).reduce((n, i) => n + i.quantity, 0), [cart]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      count,
      configured,
      loading,
      error,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      addItem,
      updateItem,
      removeItem,
      applyPromo,
      setEmail,
      reset,
    }),
    [
      cart,
      count,
      configured,
      loading,
      error,
      drawerOpen,
      addItem,
      updateItem,
      removeItem,
      applyPromo,
      setEmail,
      reset,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within <CartProvider>');
  return ctx;
}
