'use client';

/**
 * CustomerProvider / useCustomer — the storefront's auth STATE.
 *
 * The session JWT lives in an httpOnly cookie set by /api/auth/* (server-side
 * Medusa v2 proxy — see lib/medusa-auth.ts), so this client holds only the
 * derived `customer` object. On mount it asks /api/auth/me who's signed in; the
 * actions POST to the auth routes and update local state from the response.
 *
 * Mirrors the cart's graceful-degradation contract: when Medusa auth isn't wired
 * (local dev with no publishable key) /api/auth/me returns `{customer:null}` and
 * the actions surface an honest error — the UI just stays in its signed-out state.
 */
import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

export type Customer = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
};

type CustomerContextValue = {
  /** The signed-in customer, or null. */
  customer: Customer | null;
  /** True until the initial /api/auth/me resolves (avoids an auth UI flash). */
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const CustomerContext = createContext<CustomerContextValue | null>(null);

async function postAuth(
  path: string,
  body: Record<string, string>,
): Promise<Customer> {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = (await res.json().catch(() => ({}))) as { customer?: Customer; error?: string };
  if (!res.ok || !data.customer) {
    throw new Error(data.error ?? 'Something went wrong. Please try again.');
  }
  return data.customer;
}

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d: { customer?: Customer | null }) => {
        if (alive) setCustomer(d.customer ?? null);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setCustomer(await postAuth('/api/auth/login', { email, password }));
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    setCustomer(await postAuth('/api/auth/register', { name, email, password }));
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setCustomer(null);
  }, []);

  const value = useMemo<CustomerContextValue>(
    () => ({ customer, loading, login, register, logout }),
    [customer, loading, login, register, logout],
  );

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomer(): CustomerContextValue {
  const ctx = useContext(CustomerContext);
  if (!ctx) throw new Error('useCustomer must be used within <CustomerProvider>');
  return ctx;
}
