'use client';

import type { AddressInput, CustomerAddress } from '@geniemarketing/commerce';
import { useEffect, useState } from 'react';
/** Saved-address manager for the logged-in customer (T48). The AddressBook block
 *  is presentational; this page owns the Medusa I/O + refresh. */
import { AddressBook } from '@/components/vinny/address-book/address-book';
import { useAuth } from '@/components/vinny/commerce/auth-context';
import { medusa } from '@/lib/commerce';

export default function AddressesPage() {
  const { customer, refresh } = useAuth();
  const [addresses, setAddresses] = useState<CustomerAddress[]>(customer?.addresses ?? []);
  const [error, setError] = useState<string | undefined>();

  // Keep the local list in sync with the session customer.
  useEffect(() => {
    setAddresses(customer?.addresses ?? []);
  }, [customer]);

  async function reload() {
    setAddresses(await medusa.listAddresses());
  }

  async function onSave(input: AddressInput, id?: string) {
    setError(undefined);
    try {
      if (id) await medusa.updateAddress(id, input);
      else await medusa.addAddress(input);
      await reload();
      await refresh();
    } catch {
      setError('We could not save that address. Please try again.');
    }
  }

  async function onDelete(id: string) {
    setError(undefined);
    try {
      await medusa.deleteAddress(id);
      await reload();
      await refresh();
    } catch {
      setError('We could not delete that address. Please try again.');
    }
  }

  if (!customer) return null;

  return (
    <div className="space-y-4">
      <h2 className="font-display text-2xl uppercase">Addresses</h2>
      <AddressBook addresses={addresses} onSave={onSave} onDelete={onDelete} error={error} />
    </div>
  );
}
