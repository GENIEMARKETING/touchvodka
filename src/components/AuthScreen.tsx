'use client';

import TurnstileWidget from '@/components/TurnstileWidget';
import { useAuth } from '@/components/vinny/commerce/auth-context';
import { type FormEvent, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

/**
 * AuthScreen — the split-screen Login / Sign Up shell (Figma Login 111:74 /
 * Sign Up 114:74). Dark brand panel (hidden ≤768) beside the form. Submitting
 * runs the Medusa v2 customer session via T48's `useAuth` (AuthProvider →
 * shared `medusa` client), then redirects to `?next=` (or home). Failures
 * surface an honest message (bad credentials, email already taken, etc.).
 *
 * Bot gate: T48 auth hits Medusa `/auth/*` straight from the browser, so a
 * Cloudflare Turnstile token is verified server-side via `/api/verify-turnstile`
 * BEFORE the Medusa call (blunts credential-stuffing + bot signups). Turnstile
 * tokens are single-use, so the widget is remounted (`key={tsKey}`) after any
 * failed attempt to mint a fresh one for the retry. Skipped when
 * `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is unset (local dev).
 */
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function AuthScreen({ mode }: { mode: 'login' | 'signup' }) {
  const isSignup = mode === 'signup';
  const { login, register } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Bumped to remount <TurnstileWidget> for a fresh single-use token after a failure.
  const [tsKey, setTsKey] = useState(0);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitting) return;
    const form = new FormData(e.currentTarget);
    const email = String(form.get('email') ?? '').trim();
    const password = String(form.get('password') ?? '');
    const name = String(form.get('name') ?? '').trim();
    const turnstileToken = String(form.get('cf-turnstile-response') ?? '');
    setSubmitting(true);
    setError(null);

    // Server-side Turnstile gate (only when a site key is configured).
    if (TURNSTILE_SITE_KEY) {
      if (!turnstileToken) {
        setError('Please complete the verification and try again.');
        setSubmitting(false);
        return;
      }
      try {
        const res = await fetch('/api/verify-turnstile', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ token: turnstileToken }),
        });
        if (!res.ok) {
          setError('Verification failed. Please try again.');
          setTsKey((k) => k + 1);
          setSubmitting(false);
          return;
        }
      } catch {
        setError('Verification failed. Please try again.');
        setTsKey((k) => k + 1);
        setSubmitting(false);
        return;
      }
    }

    try {
      if (isSignup) {
        const [firstName, ...rest] = name.split(/\s+/).filter(Boolean);
        await register({ email, password, firstName, lastName: rest.join(' ') || undefined });
      } else {
        await login(email, password);
      }
      const next = new URLSearchParams(window.location.search).get('next');
      router.push(next?.startsWith('/') ? next : '/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
      setTsKey((k) => k + 1); // single-use token consumed → fresh widget for the retry
      setSubmitting(false);
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Brand panel — moody dark with a blue beam (mock). Hidden on small screens. */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-fg p-12 text-white md:flex">
        <Image
          src="/scenes/login_brand.webp"
          alt=""
          aria-hidden
          fill
          sizes="50vw"
          className="object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-fg/90 via-fg/70 to-accent/30" />
        <Link href="/" className="relative z-10">
          <Image
            src="/brand/touch-logo-white.svg"
            alt="Touch Vodka"
            width={500}
            height={167}
            unoptimized
            className="h-9 w-auto"
          />
        </Link>
        <div className="relative z-10 max-w-sm">
          <h2 className="font-display text-4xl uppercase leading-tight">First taste, first access.</h2>
          <p className="mt-4 text-white/70 leading-relaxed">
            Members get early drops, new recipes, and members-only tastings — straight from Tampa.
          </p>
        </div>
        <p className="relative z-10 font-mono text-white/40 text-xs uppercase tracking-widest">
          21+ · Crafted in Tampa, Florida
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col justify-center px-6 py-16 md:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-10 inline-block md:hidden">
            <Image
              src="/brand/touch-logo-blue.svg"
              alt="Touch Vodka"
              width={500}
              height={167}
              unoptimized
              className="h-8 w-auto"
            />
          </Link>

          <h1 className="font-display text-4xl text-fg uppercase">
            {isSignup ? 'Create account' : 'Welcome back'}
          </h1>
          <p className="mt-2 text-neutral-600">
            {isSignup ? 'Join the Touch insiders.' : 'Sign in to your Touch account.'}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {isSignup ? (
              <Field id="name" label="Name" type="text" autoComplete="name" />
            ) : null}
            <Field id="email" label="Email" type="email" autoComplete="email" />
            <Field
              id="password"
              label="Password"
              type="password"
              autoComplete={isSignup ? 'new-password' : 'current-password'}
            />

            {/* Bot gate — injects cf-turnstile-response into this form; verified
                server-side in onSubmit before the Medusa call. Remounts on retry. */}
            <TurnstileWidget key={tsKey} />

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-accent px-8 py-4 font-display text-lg text-white shadow-brand-glow transition-transform duration-300 ease-brand hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting
                ? isSignup
                  ? 'Creating account…'
                  : 'Signing in…'
                : isSignup
                  ? 'Create account'
                  : 'Sign in'}
            </button>

            {error ? (
              <p
                aria-live="polite"
                className="rounded-xl bg-red-50 px-4 py-3 text-red-700 text-sm"
              >
                {error}
              </p>
            ) : null}
          </form>

          <p className="mt-8 text-neutral-600 text-sm">
            {isSignup ? (
              <>
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-accent hover:text-fg">
                  Sign in
                </Link>
              </>
            ) : (
              <>
                New to Touch?{' '}
                <Link href="/signup" className="font-medium text-accent hover:text-fg">
                  Create an account
                </Link>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  id,
  label,
  type,
  autoComplete,
}: {
  id: string;
  label: string;
  type: string;
  autoComplete?: string;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block font-medium text-fg text-sm">{label}</span>
      <input
        id={id}
        name={id}
        type={type}
        required
        autoComplete={autoComplete}
        className="w-full rounded-xl border border-concrete px-4 py-3 text-fg placeholder:text-neutral-400 focus:border-accent focus:outline-none"
      />
    </label>
  );
}
