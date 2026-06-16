'use client';

import { Button } from '@geniemarketing/ui';
import { useState } from 'react';
import { useAuth } from '@/components/vinny/commerce/auth-context';
/**
 * Account settings (T48): edit name + phone via the ProfileForm block, plus a
 * password section. Medusa's emailpass provider changes passwords through the
 * reset-email flow (a reset token, not the session token), so rather than wire
 * ProfileForm's inline password fields we expose a "email me a reset link"
 * action — the honest, working path.
 */
import { ProfileForm, type ProfileSubmit } from '@/components/vinny/profile-form/profile-form';
import { medusa } from '@/lib/commerce';

export default function SettingsPage() {
  const { customer, refresh } = useAuth();
  const [error, setError] = useState<string | undefined>();
  const [saved, setSaved] = useState<string | undefined>();
  const [resetSent, setResetSent] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);

  async function onSave(input: ProfileSubmit) {
    setError(undefined);
    setSaved(undefined);
    try {
      await medusa.updateProfile(input);
      await refresh();
      setSaved('Saved.');
    } catch {
      setError('We could not save your changes. Please try again.');
    }
  }

  async function sendReset() {
    if (!customer) return;
    setResetBusy(true);
    try {
      await medusa.requestPasswordReset(customer.email);
      setResetSent(true);
    } finally {
      setResetBusy(false);
    }
  }

  if (!customer) return null;

  return (
    <div className="space-y-10">
      <ProfileForm customer={customer} onSave={onSave} error={error} savedMessage={saved} />

      <section className="max-w-md space-y-3 border-t pt-8">
        <h2 className="font-semibold text-lg">Password</h2>
        {resetSent ? (
          <p role="status" className="rounded bg-green-50 px-3 py-2 text-green-700 text-sm">
            Check your inbox — we sent a password-reset link to {customer.email}.
          </p>
        ) : (
          <>
            <p className="text-sm opacity-70">
              We will email a secure link to reset your password.
            </p>
            <Button type="button" variant="secondary" disabled={resetBusy} onClick={sendReset}>
              {resetBusy ? 'Sending…' : 'Email me a reset link'}
            </Button>
          </>
        )}
      </section>
    </div>
  );
}
