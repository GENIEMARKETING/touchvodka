import {
  ALL_OCCASIONS,
  ALL_SEASONS,
  type Cocktail,
  type Occasion,
  type Season,
  cocktailSlug,
  getCocktailBySlug,
} from '@/data/cocktails';

/**
 * Explore taxonomy — the City / Season / Occasion landing + detail content
 * (Figma Cocktails filter → Explore → Detail flow). Each entry carries a blurb
 * and a "signature serve" (a cocktail slug). Scene imagery is still mock (PART B)
 * so the explore card falls back to the signature serve's art until the CDN
 * scene images land. This is the seed for the Strapi `city`/`season`/`occasion`
 * landing-copy types.
 */
export interface ExploreEntry {
  slug: string;
  name: string;
  /** Short label under the name on cards (e.g. the state, or the season tagline). */
  kicker: string;
  blurb: string;
  signatureSlug: string;
  /** Optional scene image; explore cards fall back to the signature serve's art. */
  image?: string;
}

export interface CityEntry extends ExploreEntry {
  state: string;
  /** Why Touch fits this city — three short feature points (City Detail page). */
  whyHere: Array<{ title: string; body: string }>;
}

export const CITIES: CityEntry[] = [
  {
    slug: 'tampa',
    name: 'Tampa',
    state: 'Florida',
    kicker: 'Florida',
    image: '/scenes/city_tampa.webp',
    blurb:
      'The home of Touch. Distilled on the bay and built for golden-hour balconies, Touch is Tampa in a glass.',
    signatureSlug: 'key-lime-paradise',
    whyHere: [
      { title: 'Distilled here', body: 'Every bottle is made in small batches in Tampa, Florida.' },
      { title: 'Built for the heat', body: 'Bright, crushable serves engineered for the Gulf climate.' },
      { title: 'Local first', body: 'Poured in Tampa bars and stocked in Tampa shops before anywhere else.' },
    ],
  },
  {
    slug: 'miami',
    name: 'Miami',
    state: 'Florida',
    kicker: 'Florida',
    image: '/scenes/city_miami.webp',
    blurb: 'Neon nights and ocean air. Touch Ruby brings the color Miami was made for.',
    signatureSlug: 'ruby-berry-crush',
    whyHere: [
      { title: 'Made for the scene', body: 'A bold, ruby-red serve that holds the room.' },
      { title: 'Coastal ready', body: 'Citrus-forward and refreshing in the South Beach heat.' },
      { title: 'Florida craft', body: 'A homegrown vodka with Miami energy.' },
    ],
  },
  {
    slug: 'orlando',
    name: 'Orlando',
    state: 'Florida',
    kicker: 'Florida',
    image: '/scenes/city_orlando.webp',
    blurb: 'Sunshine in a glass. Touch Orange is the brightest serve in Central Florida.',
    signatureSlug: 'orange-sunburst',
    whyHere: [
      { title: 'Bright by nature', body: 'Zesty orange built for sunny afternoons.' },
      { title: 'Family of flavors', body: 'Five expressions, one obsession with smoothness.' },
      { title: 'Florida craft', body: 'Distilled an hour west, in Tampa.' },
    ],
  },
  {
    slug: 'new-york',
    name: 'New York',
    state: 'New York',
    kicker: 'New York',
    image: '/scenes/city_nyc.webp',
    blurb: 'Clean lines, no compromise. Touch One is the martini this city deserves.',
    signatureSlug: 'one-crystal-martini',
    whyHere: [
      { title: 'Flagship clarity', body: 'Touch One — 10× distilled and charcoal filtered.' },
      { title: 'Bar-program ready', body: 'A neutral, premium base for a precise martini.' },
      { title: 'Craft credentials', body: 'Small-batch Florida distilling, shipped north.' },
    ],
  },
  {
    slug: 'los-angeles',
    name: 'Los Angeles',
    state: 'California',
    kicker: 'California',
    image: '/scenes/city_la.webp',
    blurb: 'Late nights and good company. The Artisan Espresso Martini is LA after dark.',
    signatureSlug: 'artisan-espresso-martini',
    whyHere: [
      { title: 'Smooth canvas', body: 'Touch Artisan carries coffee and citrus alike.' },
      { title: 'Built for hosting', body: 'Crowd-pleasing serves for the hills and the coast.' },
      { title: 'Craft first', body: 'A traditional-method vodka with a modern finish.' },
    ],
  },
  {
    slug: 'nashville',
    name: 'Nashville',
    state: 'Tennessee',
    kicker: 'Tennessee',
    image: '/scenes/city_nashville.webp',
    blurb: 'Copper mugs and front-porch nights. The Artisan Moscow Mule plays well here.',
    signatureSlug: 'artisan-moscow-mule',
    whyHere: [
      { title: 'Easy-drinking', body: 'A crisp, spicy mule that suits a long night out.' },
      { title: 'Versatile base', body: 'Touch Artisan mixes clean with anything.' },
      { title: 'Southern craft', body: 'Distilled down in Tampa, at home across the South.' },
    ],
  },
];

const SEASON_COPY: Record<Season, { kicker: string; blurb: string; signatureSlug: string }> = {
  Spring: {
    kicker: 'Fresh starts',
    blurb: 'Light, citrus-forward serves for the first warm days.',
    signatureSlug: 'ruby-berry-crush',
  },
  Summer: {
    kicker: 'Sun & salt',
    blurb: 'Crushable, ice-cold serves built for the Florida heat.',
    signatureSlug: 'key-lime-paradise',
  },
  Fall: {
    kicker: 'Golden hour',
    blurb: 'Warmer, spiced serves for cooling evenings.',
    signatureSlug: 'artisan-moscow-mule',
  },
  Winter: {
    kicker: 'Cozy nights',
    blurb: 'Rich, sippable serves for the holidays and beyond.',
    signatureSlug: 'one-crystal-martini',
  },
};

const OCCASION_COPY: Record<Occasion, { kicker: string; blurb: string; signatureSlug: string }> = {
  'Date Night': { kicker: 'For two', blurb: 'Elegant serves to set the mood.', signatureSlug: 'one-crystal-martini' },
  'Game Day': { kicker: 'For the crew', blurb: 'Easy, batchable serves for the big game.', signatureSlug: 'artisan-moscow-mule' },
  Party: { kicker: 'For the room', blurb: 'Bold, colorful serves that hold a crowd.', signatureSlug: 'artisan-espresso-martini' },
  Brunch: { kicker: 'For the morning', blurb: 'Bright, low-key serves for late mornings.', signatureSlug: 'orange-sunburst' },
  Beach: { kicker: 'For the sand', blurb: 'Tropical, refreshing serves for the shore.', signatureSlug: 'key-lime-paradise' },
  Holiday: { kicker: 'For the table', blurb: 'Festive serves to share with everyone.', signatureSlug: 'ruby-berry-crush' },
};

export const SEASONS: ExploreEntry[] = ALL_SEASONS.map((s) => ({
  slug: cocktailSlug(s),
  name: s,
  ...SEASON_COPY[s],
}));

export const OCCASIONS: ExploreEntry[] = ALL_OCCASIONS.map((o) => ({
  slug: cocktailSlug(o),
  name: o,
  ...OCCASION_COPY[o],
}));

export function getCity(slug: string): CityEntry | undefined {
  return CITIES.find((c) => c.slug === slug);
}
export function getSeasonEntry(slug: string): ExploreEntry | undefined {
  return SEASONS.find((s) => s.slug === slug);
}
export function getOccasionEntry(slug: string): ExploreEntry | undefined {
  return OCCASIONS.find((o) => o.slug === slug);
}

/** The signature cocktail object for an explore entry (used for art + CTA). */
export function signatureServe(entry: ExploreEntry): Cocktail | undefined {
  return getCocktailBySlug(entry.signatureSlug);
}
