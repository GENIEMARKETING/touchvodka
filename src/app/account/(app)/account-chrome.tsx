'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
/**
 * Client chrome for the logged-in account area (T48): the sidebar nav (with the
 * active route), sign-out, and the AccountGuard. Split out of the account layout
 * so the layout itself can stay a SERVER component — keeping PageShell's
 * Strapi-backed footer server-side (see the layout's note re: the 2026-06-20
 * client-bundle Strapi-loop incident). Only these bits need client hooks.
 */
import { AccountNav } from '@/components/vinny/account-nav/account-nav';
import { AccountGuard } from '@/components/vinny/commerce/account-guard';
import { useAuth } from '@/components/vinny/commerce/auth-context';

const NAV = [
  { href: '/account', label: 'Overview' },
  { href: '/account/orders', label: 'Orders' },
  { href: '/account/addresses', label: 'Addresses' },
  { href: '/account/settings', label: 'Account settings' },
];

export default function AccountChrome({ children }: { children: ReactNode }) {
  const { customer, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  function signOut() {
    logout();
    router.push('/');
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-10 p-8 md:flex-row md:p-12">
      <AccountNav
        items={NAV}
        active={pathname}
        customerName={customer?.first_name ?? undefined}
        onSignOut={customer ? signOut : undefined}
      />
      <div className="min-w-0 flex-1">
        <AccountGuard>{children}</AccountGuard>
      </div>
    </div>
  );
}
