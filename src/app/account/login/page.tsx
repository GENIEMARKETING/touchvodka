'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';
/**
 * /account/login (T48) — login / register / password-reset via the shared
 * auth-form block, wired to the customer session (AuthProvider → Medusa). Lives
 * OUTSIDE the (app) route group so it is NOT behind the AccountGuard (no redirect
 * loop). On success it returns the visitor to ?next= (default /account).
 */
import PageShell, { PageHero } from '@/components/PageShell';
import { AuthForm, type AuthMode, type AuthSubmit } from '@/components/vinny/auth-form/auth-form';
import { useAuth } from '@/components/vinny/commerce/auth-context';

function LoginInner() {
  const { customer, configured, ready, login, register, requestPasswordReset, error } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') || '/account';
  const [mode, setMode] = useState<AuthMode>('login');
  const [notice, setNotice] = useState<string | undefined>();

  // Already signed in → bounce to the destination.
  useEffect(() => {
    if (configured && ready && customer) router.replace(next);
  }, [configured, ready, customer, next, router]);

  async function onSubmit(data: AuthSubmit) {
    setNotice(undefined);
    try {
      if (data.mode === 'login') {
        await login(data.email, data.password ?? '');
        router.replace(next);
      } else if (data.mode === 'register') {
        await register({
          email: data.email,
          password: data.password ?? '',
          firstName: data.firstName,
          lastName: data.lastName,
        });
        router.replace(next);
      } else {
        await requestPasswordReset(data.email);
        setNotice('If an account exists for that email, a reset link is on its way.');
        setMode('login');
      }
    } catch {
      // The message is surfaced via the auth-form `error` prop (set in useAuth).
    }
  }

  if (!configured) {
    return (
      <p className="mx-auto max-w-sm p-8 font-mono opacity-70">
        Customer accounts are not available yet.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-sm p-8 md:p-12">
      {notice ? (
        <p role="status" className="mb-4 rounded bg-green-50 px-3 py-2 text-green-700 text-sm">
          {notice}
        </p>
      ) : null}
      <AuthForm mode={mode} onModeChange={setMode} onSubmit={onSubmit} error={error ?? undefined} />
    </div>
  );
}

export default function LoginPage() {
  return (
    <PageShell>
      <PageHero eyebrow="// ACCOUNT" title="Sign In" />
      <Suspense fallback={<p className="mx-auto max-w-sm p-8 font-mono opacity-60">Loading…</p>}>
        <LoginInner />
      </Suspense>
    </PageShell>
  );
}
