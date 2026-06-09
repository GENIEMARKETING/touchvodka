'use client';

// REUSE S7's geo util — `distanceKm` + the shared `GeoPoint` type are exactly
// what foundation/geo exports (verified in-tree). The *map rendering* is not a
// foundation export (S7 built its live-map inside agency-ops), so we render with
// react-simple-maps here. See COORDINATION.md.
import { type GeoPoint, distanceKm } from '@geniemarketing/foundation/geo';
import { Button, cn } from '@geniemarketing/ui';
import { ScrollReveal } from '@geniemarketing/ui/motion';
import { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

/**
 * StockistLocator — "find a store" map for the BOFU funnel step (spirits brands
 * can't sell DTC in most states; "find a stockist" is the bottom of the funnel).
 *
 * Fed by the shared Strapi **Stockist** content type (see ./strapi). The page
 * fetches stockists and passes them in — the block stays presentational +
 * interactive (map ⇄ list ⇄ "near me").
 *
 * Variant-not-configuration: heading + the stockist data. A list-only (no map)
 * variant is a NEW block.
 */
export type Stockist = GeoPoint & {
  name: string;
  address: string;
  city: string;
  state: string;
  url?: string;
};

export type StockistLocatorProps = {
  heading?: string;
  stockists: Stockist[];
  /** TopoJSON for the base map. Defaults to US states (the spirits market). */
  geographyUrl?: string;
};

const DEFAULT_GEO_URL = 'https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json';

export function StockistLocator({
  heading = 'Find a store',
  stockists,
  geographyUrl = DEFAULT_GEO_URL,
}: StockistLocatorProps) {
  const [active, setActive] = useState<string | null>(null);
  const [origin, setOrigin] = useState<GeoPoint | null>(null);

  // "Near me" uses the browser's geolocation (consented per-use by the browser)
  // — NOT the GeoLite2 IP path, which is for anonymous visitor analytics (S7).
  function locateMe() {
    navigator.geolocation?.getCurrentPosition(
      (pos) => setOrigin({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        /* user declined — list stays in CMS order */
      },
    );
  }

  const ordered = useMemo(() => {
    if (!origin) return stockists;
    return [...stockists].sort((a, b) => distanceKm(origin, a) - distanceKm(origin, b));
  }, [origin, stockists]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-semibold text-3xl tracking-tight">{heading}</h2>
        <Button variant="ghost" onClick={locateMe}>
          Use my location
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-[1.4fr_1fr]">
        <div className="overflow-hidden rounded-lg border border-[var(--fg)]/10">
          <ComposableMap projection="geoAlbersUsa" className="h-[420px] w-full">
            <Geographies geography={geographyUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    className="fill-[var(--fg)]/10 stroke-[var(--surface)] outline-none"
                  />
                ))
              }
            </Geographies>
            {stockists.map((s) => (
              <Marker
                key={`${s.name}-${s.lat}-${s.lng}`}
                coordinates={[s.lng, s.lat]}
                onClick={() => setActive(s.name)}
              >
                <circle
                  r={active === s.name ? 7 : 4}
                  className={cn(
                    'cursor-pointer transition-all',
                    active === s.name ? 'fill-[var(--brand)]' : 'fill-[var(--fg)]/60',
                  )}
                />
              </Marker>
            ))}
          </ComposableMap>
        </div>

        <ul className="max-h-[420px] space-y-2 overflow-auto">
          {ordered.map((s) => (
            <ScrollReveal key={`${s.name}-${s.lat}-${s.lng}`}>
              <li>
                <button
                  type="button"
                  onClick={() => setActive(s.name)}
                  className={cn(
                    'w-full rounded-lg border p-4 text-left transition-colors',
                    active === s.name
                      ? 'border-[var(--brand)] bg-[var(--brand)]/5'
                      : 'border-[var(--fg)]/10 hover:border-[var(--fg)]/30',
                  )}
                >
                  <p className="font-semibold">{s.name}</p>
                  <p className="text-[var(--fg)]/70 text-sm">
                    {s.address}, {s.city}, {s.state}
                  </p>
                  {origin ? (
                    <p className="mt-1 text-[var(--fg)]/50 text-xs">
                      {distanceKm(origin, s).toFixed(0)} km away
                    </p>
                  ) : null}
                  {s.url ? (
                    <a
                      href={s.url}
                      className="mt-1 inline-block text-[var(--brand)] text-sm underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Visit site
                    </a>
                  ) : null}
                </button>
              </li>
            </ScrollReveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
