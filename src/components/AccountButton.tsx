'use client';

import { User } from 'lucide-react';
import Link from 'next/link';
/**
 * AccountButton — header trigger for the customer account area. Mirrors
 * CartButton: renders nothing until commerce is wired for this brand, so the
 * bespoke brutalist nav stays unchanged on the brand-only build. Links to
 * /account (the guard sends logged-out visitors to /account/login).
 */
import { useAuth } from '@/components/vinny/commerce/auth-context';

export function AccountButton({ className = '' }: { className?: string }) {
  const { configured, customer } = useAuth();
  if (!configured) return null;

  return (
    <Link
      href="/account"
      aria-label={customer ? 'Your account' : 'Sign in'}
      className={`flex items-center justify-center bg-white p-6 text-black transition-colors hover:bg-accent hover:text-white ${className}`}
    >
      <User className="h-6 w-6" />
    </Link>
  );
}
