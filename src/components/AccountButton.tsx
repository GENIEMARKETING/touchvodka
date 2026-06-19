'use client';

import { User } from 'lucide-react';
import Link from 'next/link';
/**
 * AccountButton — header account control (T48, reskinned for the Refined-Bold
 * redesign 2026-06). Mirrors CartButton: a plain icon that inherits the header's
 * text colour (dark over the hero, white on the scrolled black bar) rather than a
 * fixed background. Renders nothing until commerce is wired for this brand.
 *
 * State-aware destination: → /account when signed in, → /login when signed out.
 * A small accent dot on the icon signals the signed-in state at a glance (the
 * visible "you're logged in" confirmation Vinny asked for after login).
 */
import { useAuth } from '@/components/vinny/commerce/auth-context';

export function AccountButton({ className = '' }: { className?: string }) {
  const { configured, customer } = useAuth();
  if (!configured) return null;

  const signedIn = Boolean(customer);

  return (
    <Link
      href={signedIn ? '/account' : '/login'}
      aria-label={signedIn ? 'Your account' : 'Sign in'}
      title={signedIn ? 'Your account' : 'Sign in'}
      className={`relative flex items-center justify-center p-2 transition-colors hover:text-accent ${className}`}
    >
      <User className="h-6 w-6" />
      {signedIn ? (
        <span
          aria-hidden
          className="-top-0.5 -right-0.5 absolute h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-current"
        />
      ) : null}
    </Link>
  );
}
