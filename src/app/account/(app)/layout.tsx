import type { ReactNode } from 'react';
/**
 * The logged-in account shell (T48). This layout is a SERVER component on
 * purpose: PageShell renders the Strapi-backed footer (SiteFooterData →
 * lib/strapi), which must stay server-side. A `'use client'` layout here dragged
 * lib/strapi into the BROWSER bundle on /account/* pages, where the config fetch
 * ran client-side and looped — flooding the shared Strapi edge and tripping the
 * WAF rate limit (403s on login + cart for that IP; 2026-06-20 incident). The
 * client-only chrome (nav + guard, which need usePathname/useAuth) lives in
 * <AccountChrome>. The `(app)` group means /account/login (outside it) is not
 * guarded, so there is no redirect loop.
 */
import PageShell, { PageHero } from '@/components/PageShell';
import AccountChrome from './account-chrome';

export default function AccountLayout({ children }: { children: ReactNode }) {
  return (
    <PageShell>
      <PageHero eyebrow="Your account" title="My Account" />
      <AccountChrome>{children}</AccountChrome>
    </PageShell>
  );
}
