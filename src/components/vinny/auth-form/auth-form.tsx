'use client';

import { Button } from '@geniemarketing/ui';
import { type FormEvent, useState } from 'react';

/**
 * AuthForm — customer login / register / password-reset in one block, toggled by
 * `mode`. Presentational + form state only: the page passes `onSubmit` wired to
 * Medusa's customer auth (or the shared SSO). It never stores credentials or
 * tokens itself.
 *
 * Variant-not-configuration: mode + onSubmit + onModeChange. A social-login
 * button row is a NEW block (render it alongside).
 */
export type AuthMode = 'login' | 'register' | 'reset';

export type AuthSubmit = {
  mode: AuthMode;
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
};

export type AuthFormProps = {
  mode: AuthMode;
  onSubmit: (data: AuthSubmit) => Promise<void> | void;
  onModeChange?: (mode: AuthMode) => void;
  error?: string;
};

const HEADINGS: Record<AuthMode, string> = {
  login: 'Sign in',
  register: 'Create account',
  reset: 'Reset password',
};

export function AuthForm({ mode, onSubmit, onModeChange, error }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await onSubmit({
        mode,
        email,
        ...(mode !== 'reset' ? { password } : {}),
        ...(mode === 'register' ? { firstName, lastName } : {}),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-sm space-y-4">
      <h1 className="font-bold text-2xl tracking-tight">{HEADINGS[mode]}</h1>

      {error ? (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-red-700 text-sm">
          {error}
        </p>
      ) : null}

      {mode === 'register' ? (
        <div className="grid grid-cols-2 gap-3">
          <input
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="First name"
            autoComplete="given-name"
            className="rounded border px-3 py-2"
          />
          <input
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Last name"
            autoComplete="family-name"
            className="rounded border px-3 py-2"
          />
        </div>
      ) : null}

      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        autoComplete="email"
        className="w-full rounded border px-3 py-2"
      />

      {mode !== 'reset' ? (
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          className="w-full rounded border px-3 py-2"
        />
      ) : null}

      <Button type="submit" disabled={busy} className="w-full">
        {busy ? 'Please wait…' : HEADINGS[mode]}
      </Button>

      <div className="flex justify-between text-sm opacity-70">
        {mode === 'login' ? (
          <>
            <button type="button" className="underline" onClick={() => onModeChange?.('reset')}>
              Forgot password?
            </button>
            <button type="button" className="underline" onClick={() => onModeChange?.('register')}>
              Create account
            </button>
          </>
        ) : (
          <button type="button" className="underline" onClick={() => onModeChange?.('login')}>
            ← Back to sign in
          </button>
        )}
      </div>
    </form>
  );
}
