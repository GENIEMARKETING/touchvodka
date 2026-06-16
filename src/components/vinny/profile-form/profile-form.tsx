'use client';

import type { Customer } from '@geniemarketing/commerce';
import { Button, Input } from '@geniemarketing/ui';
import { type FormEvent, useState } from 'react';

/**
 * ProfileForm — the account-settings surface (T48): edit name + phone, view the
 * email (it lives on the Medusa auth identity, not the customer, so it's shown
 * read-only), and optionally change the password. Presentational + form state:
 * the page wires `onSave` to `medusa.updateProfile()` and `onChangePassword` to
 * the emailpass reset flow.
 *
 * Variant-not-configuration: customer + onSave + onChangePassword. Omit
 * `onChangePassword` to hide the password section entirely.
 */
export type ProfileSubmit = {
  first_name: string;
  last_name: string;
  phone: string;
};

export type ProfileFormProps = {
  customer: Customer;
  onSave: (input: ProfileSubmit) => Promise<void> | void;
  /** New password setter. Omit to hide the password section. */
  onChangePassword?: (newPassword: string) => Promise<void> | void;
  error?: string;
  /** Shown after a successful save (e.g. "Saved."). */
  savedMessage?: string;
};

export function ProfileForm({
  customer,
  onSave,
  onChangePassword,
  error,
  savedMessage,
}: ProfileFormProps) {
  const [firstName, setFirstName] = useState(customer.first_name ?? '');
  const [lastName, setLastName] = useState(customer.last_name ?? '');
  const [phone, setPhone] = useState(customer.phone ?? '');
  const [busy, setBusy] = useState(false);

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [pwBusy, setPwBusy] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwDone, setPwDone] = useState(false);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await onSave({ first_name: firstName, last_name: lastName, phone });
    } finally {
      setBusy(false);
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwDone(false);
    if (password !== confirm) {
      setPwError('Passwords do not match.');
      return;
    }
    setPwBusy(true);
    try {
      await onChangePassword?.(password);
      setPassword('');
      setConfirm('');
      setPwDone(true);
    } catch {
      setPwError('Could not update your password. Please try again.');
    } finally {
      setPwBusy(false);
    }
  }

  return (
    <div className="space-y-10">
      <form onSubmit={saveProfile} className="max-w-md space-y-4">
        <h2 className="font-semibold text-lg">Profile</h2>

        {error ? (
          <p role="alert" className="rounded bg-red-50 px-3 py-2 text-red-700 text-sm">
            {error}
          </p>
        ) : null}
        {savedMessage ? (
          <p role="status" className="rounded bg-green-50 px-3 py-2 text-green-700 text-sm">
            {savedMessage}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-3">
          <div className="text-sm">
            <label htmlFor="pf-first" className="mb-1 block opacity-70">
              First name
            </label>
            <Input
              id="pf-first"
              value={firstName}
              autoComplete="given-name"
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className="text-sm">
            <label htmlFor="pf-last" className="mb-1 block opacity-70">
              Last name
            </label>
            <Input
              id="pf-last"
              value={lastName}
              autoComplete="family-name"
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        <div className="text-sm">
          <label htmlFor="pf-email" className="mb-1 block opacity-70">
            Email
          </label>
          <Input id="pf-email" type="email" value={customer.email} readOnly disabled />
          <span className="mt-1 block text-xs opacity-60">
            Contact us to change the email on your account.
          </span>
        </div>

        <div className="text-sm">
          <label htmlFor="pf-phone" className="mb-1 block opacity-70">
            Phone
          </label>
          <Input
            id="pf-phone"
            type="tel"
            value={phone}
            autoComplete="tel"
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save changes'}
        </Button>
      </form>

      {onChangePassword ? (
        <form onSubmit={changePassword} className="max-w-md space-y-4 border-t pt-8">
          <h2 className="font-semibold text-lg">Password</h2>

          {pwError ? (
            <p role="alert" className="rounded bg-red-50 px-3 py-2 text-red-700 text-sm">
              {pwError}
            </p>
          ) : null}
          {pwDone ? (
            <p role="status" className="rounded bg-green-50 px-3 py-2 text-green-700 text-sm">
              Password updated.
            </p>
          ) : null}

          <div className="text-sm">
            <label htmlFor="pf-new-pw" className="mb-1 block opacity-70">
              New password
            </label>
            <Input
              id="pf-new-pw"
              type="password"
              required
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="text-sm">
            <label htmlFor="pf-confirm-pw" className="mb-1 block opacity-70">
              Confirm new password
            </label>
            <Input
              id="pf-confirm-pw"
              type="password"
              required
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>

          <Button type="submit" disabled={pwBusy}>
            {pwBusy ? 'Updating…' : 'Update password'}
          </Button>
        </form>
      ) : null}
    </div>
  );
}
