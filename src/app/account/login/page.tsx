import { redirect } from 'next/navigation';

/**
 * /account/login → redirect to the redesigned split-screen /login (one cohesive
 * auth UI). The old T48 AuthForm login lived here; the account area now sends
 * logged-out visitors to /login (see AccountGuard), forwarding ?next=.
 */
export default async function AccountLoginRedirect({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;
  redirect(next ? `/login?next=${encodeURIComponent(next)}` : '/login');
}
