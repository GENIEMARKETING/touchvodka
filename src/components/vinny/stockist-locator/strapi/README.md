# Strapi "Stockist" content type (Task 23.2)

Feeds the `stockist-locator` block. Authored now; applied to the shared Strapi
**after S6 "prod up"** (same as the Landing Page type).

## Fetch helper (consuming app)

The page fetches and passes `stockists` to the block — the block never calls
Strapi itself:

```ts
// lib/stockists.ts (in the consuming app)
export async function getStockists(site: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/stockists?filters[site][$eq]=${site}`,
    { headers: { Authorization: `Bearer ${process.env.STRAPI_API_TOKEN}` }, next: { revalidate: 300 } },
  );
  const { data } = await res.json();
  return data; // Stockist[] — matches the block's prop type
}
```

```tsx
const stockists = await getStockists(SITE_KEY);
<StockistLocator heading="Find Fat Dog near you" stockists={stockists} />
```

## Apply checklist (S6)

- [ ] Import `stockist.schema.json` into shared Strapi.
- [ ] Add a geocode-on-save hook (or geocode manually) so `lat`/`lng` are set —
      the locator plots and sorts by them.
- [ ] Grant the API token find/findOne on `stockists`.
- [ ] Seed a few stockists per brand and smoke-test the locator's map + "near me".
