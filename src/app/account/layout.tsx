import type { Metadata } from 'next';
import type { ReactNode } from 'react';

// Personal, gated views — keep the whole /account/* tree (incl. login) out of
// search + sitemaps. (Set here, in a server layout, because the page/shell
// components below are client components and can't export metadata.)
export const metadata: Metadata = {
  title: 'My Account',
  robots: { index: false, follow: false },
};

export default function AccountSegmentLayout({ children }: { children: ReactNode }) {
  return children;
}
