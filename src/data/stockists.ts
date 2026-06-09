/**
 * Stockist seed for the `stockist-locator` block (S10, BOFU "find a store").
 *
 * MIGRATION NOTE (S6): seeds the shared Strapi `Stockist` content type (schema:
 * src/components/vinny/stockist-locator/strapi/stockist.schema.json), scoped by
 * `site = touch-vodka`. `lib/strapi.ts#getStockists` serves these until the CMS
 * is populated. Touch Vodka is a Fat Dog Spirits brand (Tampa, FL); these are
 * representative FL/Southeast accounts — replace with the real account list.
 */
import type { GeoPoint } from '@vinny/foundation/geo';

export type Stockist = GeoPoint & {
  name: string;
  address: string;
  city: string;
  state: string;
  url?: string;
};

export const STOCKISTS: Stockist[] = [
  {
    name: 'ABC Fine Wine & Spirits — Tampa',
    address: '3242 Henderson Blvd',
    city: 'Tampa',
    state: 'FL',
    lat: 27.9398,
    lng: -82.5061,
    url: 'https://www.abcfws.com',
  },
  {
    name: 'Total Wine & More — Tampa',
    address: '2040 N Dale Mabry Hwy',
    city: 'Tampa',
    state: 'FL',
    lat: 27.9613,
    lng: -82.5048,
    url: 'https://www.totalwine.com',
  },
  {
    name: 'Total Wine & More — St. Petersburg',
    address: '1900 Tyrone Blvd N',
    city: 'St. Petersburg',
    state: 'FL',
    lat: 27.7926,
    lng: -82.7376,
  },
  {
    name: 'ABC Fine Wine & Spirits — Orlando',
    address: '4934 E Colonial Dr',
    city: 'Orlando',
    state: 'FL',
    lat: 28.5519,
    lng: -81.3268,
  },
  {
    name: 'Crown Wine & Spirits — Miami',
    address: '8255 SW 124th St',
    city: 'Miami',
    state: 'FL',
    lat: 25.6606,
    lng: -80.3247,
  },
  {
    name: 'Greens Beverages — Atlanta',
    address: '2614 Buford Hwy NE',
    city: 'Atlanta',
    state: 'GA',
    lat: 33.8217,
    lng: -84.3408,
  },
];
