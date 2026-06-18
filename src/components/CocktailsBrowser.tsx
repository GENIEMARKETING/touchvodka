'use client';

import CocktailCard from '@/components/CocktailCard';
import type { Cocktail } from '@/data/cocktails';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

/**
 * CocktailsBrowser — the /cocktails menu (Figma 50:62). A sticky filter bar:
 *   • a segmented Product control (All + each expression) that filters the grid
 *     client-side, and
 *   • Season / Occasion / Location dropdowns that deep-link to the explore routes
 *     (the Figma "filter → Explore → Detail" flow).
 * Below it, cocktails are grouped per SKU. Real CMS-driven filtering replaces the
 * derived data later; the interaction model is the same.
 */
type Group = { sku: string; cocktails: Cocktail[] };

export default function CocktailsBrowser({
  groups,
  seasons,
  occasions,
  cities,
}: {
  groups: Group[];
  seasons: Array<{ slug: string; name: string }>;
  occasions: Array<{ slug: string; name: string }>;
  cities: Array<{ slug: string; name: string }>;
}) {
  const router = useRouter();
  const [sku, setSku] = useState<string>('all');

  const visible = useMemo(
    () => (sku === 'all' ? groups : groups.filter((g) => g.sku === sku)),
    [groups, sku],
  );
  const total = useMemo(() => groups.reduce((n, g) => n + g.cocktails.length, 0), [groups]);

  const segments = ['all', ...groups.map((g) => g.sku)];
  const label = (s: string) => (s === 'all' ? 'All' : s.replace('Touch ', ''));

  return (
    <div>
      {/* Sticky filter bar */}
      <div className="sticky top-20 z-40 border-concrete border-y bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-4 md:px-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {segments.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSku(s)}
                aria-pressed={sku === s}
                className={`whitespace-nowrap rounded-full px-4 py-2.5 font-medium text-sm transition-colors ${
                  sku === s
                    ? 'bg-fg text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {label(s)}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Dropdown
              label="Season"
              base="/cocktails/seasons"
              options={seasons}
              onChange={(href) => router.push(href)}
            />
            <Dropdown
              label="Occasion"
              base="/cocktails/occasions"
              options={occasions}
              onChange={(href) => router.push(href)}
            />
            <Dropdown
              label="Location"
              base="/cocktails/cities"
              options={cities}
              onChange={(href) => router.push(href)}
            />
            <span className="ml-1 hidden font-mono text-neutral-400 text-xs uppercase tracking-wide sm:inline">
              {total} serves
            </span>
          </div>
        </div>
      </div>

      {/* Per-SKU grids */}
      <div className="mx-auto max-w-7xl space-y-16 px-6 py-16 md:px-10 md:py-20">
        {visible.map((g) => (
          <section key={g.sku}>
            <div className="mb-6 flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl text-fg uppercase md:text-3xl">{g.sku}</h2>
              <span className="font-mono text-neutral-400 text-xs uppercase tracking-wide">
                {g.cocktails.length} serves
              </span>
            </div>
            <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
              {g.cocktails.map((c) => (
                <CocktailCard key={c.id} cocktail={c} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function Dropdown({
  label,
  base,
  options,
  onChange,
}: {
  label: string;
  base: string;
  options: Array<{ slug: string; name: string }>;
  onChange: (href: string) => void;
}) {
  return (
    <select
      aria-label={label}
      defaultValue=""
      onChange={(e) => {
        if (e.target.value) onChange(e.target.value);
      }}
      className="h-11 rounded-full border border-concrete bg-white px-4 font-medium text-sm text-neutral-700 transition-colors hover:border-neutral-400 focus:border-accent focus:outline-none"
    >
      <option value="" disabled>
        {label}
      </option>
      <option value={base}>All {label.toLowerCase()}s</option>
      {options.map((o) => (
        <option key={o.slug} value={`${base}/${o.slug}`}>
          {o.name}
        </option>
      ))}
    </select>
  );
}
