'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
/**
 * The logged-in account shell (T48): brutalist page chrome + the AccountNav
 * sidebar + the AccountGuard. The `(app)` route group means /account/login (which
 * lives OUTSIDE this group) is NOT guarded, so there is no redirect loop.
 */
import PageShell, { PageHero } from '@/components/PageShell';
import { AccountNav } from '@/components/vinny/account-nav/account-nav';
import { AccountGuard } from '@/components/vinny/commerce/account-guard';
import { useAuth } from '@/components/vinny/commerce/auth-context';

const NAV = [
  { href: '/account', label: 'Overview' },
  { href: '/account/orders', label: 'Orders' },
  { href: '/account/addresses', label: 'Addresses' },
  { href: '/account/settings', label: 'Account settings' },
];

export default function AccountLayout({ children }: { children: ReactNode }) {
  const { customer, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  function signOut() {
    logout();
    router.push('/');
  }

  return (
    <PageShell>
      <PageHero eyebrow="Your account" title="My Account" />
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
    </PageShell>
  );
}
