'use client';

import type { Customer } from '@geniemarketing/commerce';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
/**
 * AuthProvider / useAuth — the storefront's customer SESSION state (T48).
 *
 * The shared Medusa is the source of truth; the site keeps only the customer JWT
 * in localStorage and re-applies it to the shared `medusa` client (the same
 * instance the cart uses) via `setAuthToken`. Login is OPTIONAL — guest checkout
 * never routes through here.
 *
 * GRACEFUL DEGRADATION (same contract as cart-context): with no
 * `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` the provider is INERT — `configured` is
 * false, `ready` is true, and the account UI shows an "accounts unavailable"
 * notice instead of erroring.
 */
import { commerceConfigured, medusa } from '@/lib/commerce';

const TOKEN_KEY = 'tv-customer-token';

type RegisterInput = {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
};

type AuthContextValue = {
  customer: Customer | null;
  configured: boolean;
  /** True once the on-mount session restore has settled (avoids guard flicker). */
  ready: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  logout: () => void;
  /** Re-read the customer (after a profile / address mutation). */
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const configured = commerceConfigured();
  const [customer, setCustomer] = useState<Customer | null>(null);
  // Nothing to restore when unconfigured → the guard can settle immediately.
  const [ready, setReady] = useState(!configured);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore a persisted session on mount: apply the stored JWT to the shared
  // client, then confirm it by reading the customer. An invalid/expired token is
  // dropped (clean logged-out state) rather than surfaced.
  useEffect(() => {
    if (!configured) return;
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setReady(true);
      return;
    }
    let alive = true;
    medusa.setAuthToken(token);
    (async () => {
      try {
        const c = await medusa.getCustomer();
        if (!alive) return;
        if (c) {
          setCustomer(c);
        } else {
          medusa.logout();
          localStorage.removeItem(TOKEN_KEY);
        }
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [configured]);

  const persistToken = useCallback(() => {
    const token = medusa.getAuthToken();
    if (token) localStorage.setItem(TOKEN_KEY, token);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);
      try {
        const c = await medusa.login(email, password);
        persistToken();
        setCustomer(c);
      } catch (err) {
        setError('Those credentials did not match. Please try again.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [persistToken],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      setLoading(true);
      setError(null);
      try {
        const c = await medusa.register(input);
        persistToken();
        setCustomer(c);
      } catch (err) {
        setError('We could not create that account. The email may already be registered.');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [persistToken],
  );

  const requestPasswordReset = useCallback(async (email: string) => {
    setError(null);
    await medusa.requestPasswordReset(email);
  }, []);

  const logout = useCallback(() => {
    medusa.logout();
    localStorage.removeItem(TOKEN_KEY);
    setCustomer(null);
  }, []);

  const refresh = useCallback(async () => {
    setCustomer(await medusa.getCustomer());
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      customer,
      configured,
      ready,
      loading,
      error,
      login,
      register,
      requestPasswordReset,
      logout,
      refresh,
    }),
    [
      customer,
      configured,
      ready,
      loading,
      error,
      login,
      register,
      requestPasswordReset,
      logout,
      refresh,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
