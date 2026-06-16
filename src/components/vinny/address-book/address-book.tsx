'use client';

import type { AddressInput, CustomerAddress } from '@geniemarketing/commerce';
import { Button, Input } from '@geniemarketing/ui';
import { type ChangeEvent, type FormEvent, useState } from 'react';

/**
 * AddressBook — the account-area saved-address manager (T48). Presentational +
 * local form state only: the page wires `onSave`/`onDelete` to the authed Medusa
 * client (`medusa.addAddress` / `updateAddress` / `deleteAddress`) and re-feeds
 * the fresh `addresses` list down. It never talks to Medusa itself.
 *
 * Variant-not-configuration: addresses + onSave + onDelete.
 */
export type AddressBookProps = {
  addresses: CustomerAddress[];
  /** Create (no id) or update (id) a saved address. Resolves when persisted. */
  onSave: (input: AddressInput, id?: string) => Promise<void> | void;
  onDelete: (id: string) => Promise<void> | void;
  error?: string;
};

type StringField =
  | 'first_name'
  | 'last_name'
  | 'address_1'
  | 'address_2'
  | 'city'
  | 'province'
  | 'postal_code'
  | 'country_code'
  | 'phone';

const EMPTY: AddressInput = {
  first_name: '',
  last_name: '',
  address_1: '',
  address_2: '',
  city: '',
  province: '',
  postal_code: '',
  country_code: 'us',
  phone: '',
};

function toInput(a: CustomerAddress): AddressInput {
  return {
    first_name: a.first_name,
    last_name: a.last_name,
    address_1: a.address_1,
    address_2: a.address_2 ?? '',
    city: a.city,
    province: a.province ?? '',
    postal_code: a.postal_code,
    country_code: a.country_code,
    phone: a.phone ?? '',
    is_default_shipping: a.is_default_shipping,
  };
}

function AddressForm({
  initial,
  busy,
  onCancel,
  onSubmit,
}: {
  initial: AddressInput;
  busy: boolean;
  onCancel: () => void;
  onSubmit: (input: AddressInput) => void;
}) {
  const [form, setForm] = useState<AddressInput>(initial);
  const set = (k: StringField) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  function submit(e: FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <form onSubmit={submit} className="rounded-lg border p-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          placeholder="First name"
          autoComplete="given-name"
          required
          value={form.first_name}
          onChange={set('first_name')}
        />
        <Input
          placeholder="Last name"
          autoComplete="family-name"
          required
          value={form.last_name}
          onChange={set('last_name')}
        />
      </div>
      <Input
        className="mt-3"
        placeholder="Address"
        autoComplete="address-line1"
        required
        value={form.address_1}
        onChange={set('address_1')}
      />
      <Input
        className="mt-3"
        placeholder="Apartment, suite, etc. (optional)"
        autoComplete="address-line2"
        value={form.address_2 ?? ''}
        onChange={set('address_2')}
      />
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Input
          placeholder="City"
          autoComplete="address-level2"
          required
          value={form.city}
          onChange={set('city')}
        />
        <Input
          placeholder="State / province"
          autoComplete="address-level1"
          value={form.province ?? ''}
          onChange={set('province')}
        />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <Input
          placeholder="Postal code"
          autoComplete="postal-code"
          required
          value={form.postal_code}
          onChange={set('postal_code')}
        />
        <Input
          placeholder="Country (e.g. us)"
          autoComplete="country"
          required
          value={form.country_code}
          onChange={set('country_code')}
        />
      </div>
      <Input
        className="mt-3"
        placeholder="Phone (optional)"
        autoComplete="tel"
        value={form.phone ?? ''}
        onChange={set('phone')}
      />

      <div className="mt-4 flex gap-3">
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save address'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} disabled={busy}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

function AddressCard({ a }: { a: CustomerAddress }) {
  return (
    <address className="not-italic text-sm leading-relaxed">
      <span className="font-medium">
        {a.first_name} {a.last_name}
      </span>
      {a.is_default_shipping ? (
        <span className="ml-2 rounded bg-current/10 px-1.5 py-0.5 text-xs uppercase tracking-wide">
          Default
        </span>
      ) : null}
      <br />
      {a.address_1}
      {a.address_2 ? <>, {a.address_2}</> : null}
      <br />
      {a.city}
      {a.province ? `, ${a.province}` : ''} {a.postal_code}
      <br />
      {a.country_code.toUpperCase()}
      {a.phone ? (
        <>
          <br />
          {a.phone}
        </>
      ) : null}
    </address>
  );
}

export function AddressBook({ addresses, onSave, onDelete, error }: AddressBookProps) {
  const [editing, setEditing] = useState<string | 'new' | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(input: AddressInput, id?: string) {
    setBusy(true);
    try {
      await onSave(input, id);
      setEditing(null);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      await onDelete(id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p role="alert" className="rounded bg-red-50 px-3 py-2 text-red-700 text-sm">
          {error}
        </p>
      ) : null}

      {editing === 'new' ? (
        <AddressForm
          initial={EMPTY}
          busy={busy}
          onCancel={() => setEditing(null)}
          onSubmit={(input) => save(input)}
        />
      ) : (
        <Button onClick={() => setEditing('new')}>Add address</Button>
      )}

      <ul className="grid gap-4 sm:grid-cols-2">
        {addresses.map((a) =>
          editing === a.id ? (
            <li key={a.id} className="sm:col-span-2">
              <AddressForm
                initial={toInput(a)}
                busy={busy}
                onCancel={() => setEditing(null)}
                onSubmit={(input) => save(input, a.id)}
              />
            </li>
          ) : (
            <li key={a.id} className="rounded-lg border p-4">
              <AddressCard a={a} />
              <div className="mt-3 flex gap-4 text-sm">
                <button
                  type="button"
                  className="underline"
                  onClick={() => setEditing(a.id)}
                  disabled={busy}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="text-red-600 underline disabled:opacity-50"
                  onClick={() => remove(a.id)}
                  disabled={busy}
                >
                  Delete
                </button>
              </div>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}
