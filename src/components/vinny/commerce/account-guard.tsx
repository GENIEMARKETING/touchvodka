'use client';

import { usePathname, useRouter } from 'next/navigation';
import { type ReactNode, useEffect } from 'react';
/**
 * AccountGuard — gates the logged-in account area (T48). Once the on-mount
 * session restore settles, a logged-out visitor is redirected to /account/login
 * (carrying ?next= so they land back where they were). Login is OPTIONAL for the
 * store; guest checkout never routes through here.
 */
import { useAuth } from '@/components/vinny/commerce/auth-context';

export function AccountGuard({ children }: { children: ReactNode }) {
  const { customer, configured, ready } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (configured && ready && !customer) {
      router.replace(`/account/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [configured, ready, customer, pathname, router]);

  if (!configured) {
    return <p className="font-mono opacity-70">Customer accounts are not available yet.</p>;
  }
  if (!ready || !customer) {
    return <p className="font-mono opacity-60">Loading…</p>;
  }
  return <>{children}</>;
}
