'use client';

import { cn } from '@geniemarketing/ui';

/**
 * AccountNav — the sidebar for the logged-in customer area (T48). Presentational:
 * the page passes the nav items + the active route + a sign-out handler. It owns
 * no session — `onSignOut` is wired to the page's `medusa.logout()` + redirect.
 *
 * Variant-not-configuration: items + active + onSignOut. A mobile drawer is a NEW
 * block; on small screens this nav simply stacks above the panel.
 */
export type AccountNavItem = { href: string; label: string };

export type AccountNavProps = {
  items: AccountNavItem[];
  /** The current path — highlighted (exact match, or prefix for sub-routes). */
  active?: string;
  /** Greeting name shown above the nav (e.g. the customer's first name). */
  customerName?: string;
  onSignOut?: () => void;
  className?: string;
};

export function AccountNav({ items, active, customerName, onSignOut, className }: AccountNavProps) {
  return (
    <nav aria-label="Account" className={cn('w-full md:w-56 md:flex-none', className)}>
      {customerName ? (
        <p className="mb-4 px-3 text-sm opacity-70">
          Signed in as <span className="font-medium">{customerName}</span>
        </p>
      ) : null}

      <ul className="space-y-1">
        {items.map((item) => {
          const isActive =
            active === item.href ||
            (item.href !== '/account' && active?.startsWith(item.href) === true);
          return (
            <li key={item.href}>
              <a
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'block rounded px-3 py-2 text-sm transition-colors',
                  isActive ? 'bg-[var(--brand)] text-[var(--brand-fg)]' : 'hover:bg-current/10',
                )}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>

      {onSignOut ? (
        <button
          type="button"
          onClick={onSignOut}
          className="mt-4 px-3 py-2 text-sm underline opacity-70 transition-opacity hover:opacity-100"
        >
          Sign out
        </button>
      ) : null}
    </nav>
  );
}
