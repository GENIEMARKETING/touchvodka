# stockist-locator — geo-stack reuse contract (S10 ⇄ S7)

S10's brief: **reuse S7's geo stack for the locator — don't rebuild it.** This
block reuses S7's shared geo util. **Status: reconciled against the in-tree
`@geniemarketing/foundation/geo`.**

## What S10 reuses from S7 (verified exports)

`import { distanceKm, type GeoPoint } from '@geniemarketing/foundation/geo'`

| Symbol | Used for |
|---|---|
| `distanceKm(a, b)` | "near me" sort + per-row distance (haversine — S7's, not re-derived) |
| `GeoPoint` (`{ lat, lng }`) | the shared coord type; `Stockist extends GeoPoint` |

These are the genuinely shared, reusable pieces. The block does **not** copy a
haversine or a coord type — it consumes S7's.

## What is NOT shared (and why this block renders its own map)

S7's geo util exports data/projection helpers (`distanceKm`, `mercator`,
`equirectangular`, `createCityLookup`, `useLiveVisitors`, `sendVisitBeacon`) but
**no React map component** — S7's live visitor map lives inside `agency-ops`, not
as a foundation export. So the locator renders with **`react-simple-maps`**
(a declared dependency) rather than importing a non-existent `MapCanvas`.

If S7 later promotes a reusable `<MapCanvas>` to `@geniemarketing/foundation/geo`, swap the
`react-simple-maps` usage here for it — that's the only change needed.

## Boundaries (no overlap)

- **GeoLite2 IP→geo** stays S7's, server-side, for anonymous visitor analytics.
  The locator never does IP lookup — "near me" uses the browser `geolocation`
  API (user-initiated, browser-consented).
- This block is presentational + interactive only; the page fetches the
  `Stockist` entries (see `./strapi`) and passes them as the `stockists` prop.
