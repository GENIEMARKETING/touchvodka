export type Season = 'Spring' | 'Summer' | 'Fall' | 'Winter';
export type Occasion = 'Date Night' | 'Game Day' | 'Party' | 'Brunch' | 'Beach' | 'Holiday';

export interface Cocktail {
  id: string;
  /** kebab-case of `name` → the route `/cocktails/[slug]` (derived in enrich). */
  slug: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  ingredients: string[];
  preparation: string;
  garnish: string;
  /** Serving glass + count — derived placeholders until the Strapi `cocktail` type lands. */
  glass: string;
  serves: string;
  /** Filter / explore taxonomy — derived placeholders until Strapi owns the tags. */
  season: Season;
  event: Occasion;
  color: string;
  baseSpirit: string;
  productIds: string[];
}

/** Hand-authored shape; slug/season/event/glass/serves are added by enrich(). */
type RawCocktail = Omit<Cocktail, 'slug' | 'season' | 'event' | 'glass' | 'serves'>;

const RAW_COCKTAILS: RawCocktail[] = [
  {
    id: 'CK-001',
    name: 'ARTISAN OLD FASHIONED',
    tagline: 'TIMELESS SOPHISTICATION',
    description:
      'A classic reinvented with Touch Artisan. Smooth whiskey notes blend with our premium vodka base, creating a drink that honors tradition while embracing innovation.',
    image: '/products/artisan.png',
    ingredients: [
      '2 oz Touch Artisan',
      '1 sugar cube (or 1 tsp sugar)',
      '2 dashes Angostura bitters',
      '2 dashes orange bitters',
      'Orange peel',
      'Ice',
    ],
    preparation:
      'Place sugar cube in glass. Add bitters and a splash of water. Muddle gently. Fill glass with large ice cubes. Add Touch Artisan. Stir for 10 seconds. Express orange peel oils over glass.',
    garnish: 'Orange peel twist and cherry',
    color: '#D4A574',
    baseSpirit: 'Touch Artisan',
    productIds: ['TO-001'],
  },
  {
    id: 'CK-002',
    name: 'KEY LIME PARADISE',
    tagline: 'TROPICAL ESCAPE',
    description:
      'Bright, refreshing, and unapologetically tropical. Touch Key Lime brings vibrant citrus notes to this beachside favorite, delivering pure vacation in every sip.',
    image: '/products/keylime.png',
    ingredients: [
      '1.5 oz Touch Key Lime',
      '0.75 oz fresh lime juice',
      '0.5 oz coconut rum',
      '0.5 oz pineapple juice',
      '0.25 oz simple syrup',
      'Ice',
      'Splash of club soda',
    ],
    preparation:
      'Fill shaker with ice. Add Touch Key Lime, lime juice, coconut rum, pineapple juice, and simple syrup. Shake vigorously for 12 seconds. Strain into ice-filled glass. Top with club soda.',
    garnish: 'Lime wheel and pineapple wedge',
    color: '#7FDB00',
    baseSpirit: 'Touch Key Lime',
    productIds: ['TO-002'],
  },
  {
    id: 'CK-003',
    name: 'RUBY BERRY CRUSH',
    tagline: 'BOLD BERRY BLISS',
    description:
      "Deep, complex, and utterly captivating. Touch Ruby mingles with fresh berries to create a cocktail that's as visually stunning as it is delicious.",
    image: '/products/ruby.png',
    ingredients: [
      '1.5 oz Touch Ruby',
      '0.75 oz cranberry juice',
      '0.5 oz raspberry liqueur',
      '0.5 oz fresh lemon juice',
      '0.25 oz agave nectar',
      'Fresh raspberries',
      'Ice',
    ],
    preparation:
      'Muddle 5-6 fresh raspberries in shaker. Add ice, Touch Ruby, cranberry juice, raspberry liqueur, lemon juice, and agave. Shake for 12 seconds. Double strain into ice-filled glass.',
    garnish: 'Fresh raspberries and lemon twist',
    color: '#E63946',
    baseSpirit: 'Touch Ruby',
    productIds: ['TO-003'],
  },
  {
    id: 'CK-004',
    name: 'ONE CRYSTAL MARTINI',
    tagline: 'PURE ELEGANCE',
    description:
      "The ultimate expression of clarity and refinement. Touch One's premium profile shines in this minimalist masterpiece—where quality speaks for itself.",
    image: '/products/one.png',
    ingredients: ['2.5 oz Touch One', '0.5 oz dry vermouth', 'Ice', 'Lemon peel or olive'],
    preparation:
      'Stir Touch One and dry vermouth with ice for 30 seconds. Strain into chilled martini glass. Express lemon peel oils over surface or drop olive into glass.',
    garnish: 'Lemon twist or green olive',
    color: '#0055FF',
    baseSpirit: 'Touch One',
    productIds: ['TO-004'],
  },
  {
    id: 'CK-005',
    name: 'ORANGE SUNBURST',
    tagline: 'VIBRANT CITRUS ENERGY',
    description:
      'Bold, zesty, and impossible to ignore. Touch Orange brings a powerful citrus kick to this energizing cocktail that demands attention and delivers flavor.',
    image: '/products/orange.png',
    ingredients: [
      '1.5 oz Touch Orange',
      '1 oz fresh orange juice',
      '0.5 oz Cointreau',
      '0.5 oz fresh ginger juice',
      '0.25 oz honey syrup',
      'Ice',
      'Splash of sparkling water',
    ],
    preparation:
      'Fill shaker with ice. Add Touch Orange, orange juice, Cointreau, ginger juice, and honey syrup. Shake vigorously for 12 seconds. Strain into ice-filled glass. Top with sparkling water.',
    garnish: 'Orange wheel and candied ginger',
    color: '#FF8C00',
    baseSpirit: 'Touch Orange',
    productIds: ['TO-005'],
  },

  // ─── Touch Artisan ───────────────────────────────────────────────
  {
    id: 'CK-006',
    name: 'ARTISAN MOSCOW MULE',
    tagline: 'CRISP COPPER CLASSIC',
    description:
      'Touch Artisan meets spicy ginger beer and fresh lime in the timeless mule — served ice-cold in copper for maximum chill and bite.',
    image: '/products/artisan.png',
    ingredients: [
      '2 oz Touch Artisan',
      '0.5 oz fresh lime juice',
      '4 oz ginger beer',
      'Ice',
      'Lime wedge',
    ],
    preparation:
      'Fill a copper mug with ice. Add Touch Artisan and lime juice, then top with ginger beer and stir gently to combine.',
    garnish: 'Lime wedge and candied ginger',
    color: '#D4A574',
    baseSpirit: 'Touch Artisan',
    productIds: ['TO-001'],
  },
  {
    id: 'CK-007',
    name: 'ARTISAN ESPRESSO MARTINI',
    tagline: 'MIDNIGHT PICK-ME-UP',
    description:
      'Smooth Touch Artisan shaken with fresh espresso and coffee liqueur into a silky, foam-topped nightcap with a welcome caffeine kick.',
    image: '/products/artisan.png',
    ingredients: [
      '2 oz Touch Artisan',
      '1 oz fresh espresso, chilled',
      '0.5 oz coffee liqueur',
      '0.25 oz simple syrup',
      'Ice',
      'Coffee beans',
    ],
    preparation:
      'Add Touch Artisan, espresso, coffee liqueur and simple syrup to a shaker with ice. Shake hard for 15 seconds to build the foam, then double strain into a chilled coupe.',
    garnish: 'Three coffee beans',
    color: '#D4A574',
    baseSpirit: 'Touch Artisan',
    productIds: ['TO-001'],
  },
  {
    id: 'CK-008',
    name: 'ARTISAN BLOODY MARY',
    tagline: 'SAVORY BRUNCH STAPLE',
    description:
      'A clean, bold brunch icon — Touch Artisan layered with tomato, citrus and spice for a savory, restorative sip.',
    image: '/products/artisan.png',
    ingredients: [
      '2 oz Touch Artisan',
      '4 oz tomato juice',
      '0.5 oz fresh lemon juice',
      '2 dashes Worcestershire sauce',
      '2 dashes hot sauce',
      'Pinch of celery salt and black pepper',
      'Ice',
    ],
    preparation:
      'Add all ingredients to a shaker with ice and roll gently between two tins to mix without over-diluting. Pour into an ice-filled highball glass.',
    garnish: 'Celery stalk, lemon wedge and olives',
    color: '#D4A574',
    baseSpirit: 'Touch Artisan',
    productIds: ['TO-001'],
  },
  {
    id: 'CK-009',
    name: 'ARTISAN WHITE RUSSIAN',
    tagline: 'VELVET AND CREAM',
    description:
      'Touch Artisan, coffee liqueur and a float of cream come together in a decadent, velvety after-dinner classic.',
    image: '/products/artisan.png',
    ingredients: ['2 oz Touch Artisan', '1 oz coffee liqueur', '1 oz heavy cream', 'Ice'],
    preparation:
      'Fill a rocks glass with ice. Add Touch Artisan and coffee liqueur, then float the cream on top and stir gently before serving.',
    garnish: 'A dusting of cocoa',
    color: '#D4A574',
    baseSpirit: 'Touch Artisan',
    productIds: ['TO-001'],
  },

  // ─── Touch Key Lime ──────────────────────────────────────────────
  {
    id: 'CK-010',
    name: 'KEY LIME MARGARITA',
    tagline: 'TROPICAL TWIST ON A CLASSIC',
    description:
      'Touch Key Lime reinvents the margarita with bright tropical citrus, a salted rim and a splash of agave.',
    image: '/products/keylime.png',
    ingredients: [
      '1.5 oz Touch Key Lime',
      '0.75 oz fresh lime juice',
      '0.5 oz triple sec',
      '0.25 oz agave nectar',
      'Ice',
      'Salt for the rim',
    ],
    preparation:
      'Rim a rocks glass with salt. Add Touch Key Lime, lime juice, triple sec and agave to a shaker with ice. Shake for 12 seconds and strain over fresh ice.',
    garnish: 'Lime wheel',
    color: '#7FDB00',
    baseSpirit: 'Touch Key Lime',
    productIds: ['TO-002'],
  },
  {
    id: 'CK-011',
    name: 'KEY LIME MOJITO',
    tagline: 'MINT AND LIME REFRESHER',
    description:
      'Fresh mint, lime and Touch Key Lime over crushed ice — a breezy, garden-fresh cooler made for warm afternoons.',
    image: '/products/keylime.png',
    ingredients: [
      '1.5 oz Touch Key Lime',
      '0.75 oz fresh lime juice',
      '0.5 oz simple syrup',
      '8 fresh mint leaves',
      'Soda water',
      'Crushed ice',
    ],
    preparation:
      'Gently muddle the mint with simple syrup and lime juice in a highball glass. Add Touch Key Lime and fill with crushed ice. Top with soda water and stir.',
    garnish: 'Mint sprig and lime wheel',
    color: '#7FDB00',
    baseSpirit: 'Touch Key Lime',
    productIds: ['TO-002'],
  },
  {
    id: 'CK-012',
    name: 'KEY LIME GIMLET',
    tagline: 'SHARP AND CITRUS-FORWARD',
    description:
      'A crisp, citrus-forward gimlet built on Touch Key Lime — clean, tart and elegantly simple.',
    image: '/products/keylime.png',
    ingredients: [
      '2 oz Touch Key Lime',
      '0.75 oz fresh lime juice',
      '0.5 oz simple syrup',
      'Ice',
    ],
    preparation:
      'Add all ingredients to a shaker with ice. Shake for 12 seconds and double strain into a chilled coupe.',
    garnish: 'Lime wheel',
    color: '#7FDB00',
    baseSpirit: 'Touch Key Lime',
    productIds: ['TO-002'],
  },
  {
    id: 'CK-013',
    name: 'COCONUT KEY LIME COOLER',
    tagline: 'BEACHSIDE IN A GLASS',
    description:
      'Touch Key Lime with coconut water and a touch of cream of coconut — a creamy tropical escape with a citrus edge.',
    image: '/products/keylime.png',
    ingredients: [
      '1.5 oz Touch Key Lime',
      '1 oz coconut water',
      '0.5 oz fresh lime juice',
      '0.5 oz cream of coconut',
      'Soda water',
      'Ice',
    ],
    preparation:
      'Add Touch Key Lime, coconut water, lime juice and cream of coconut to a shaker with ice. Shake and strain over fresh ice, then top with soda water.',
    garnish: 'Lime wheel and toasted coconut',
    color: '#7FDB00',
    baseSpirit: 'Touch Key Lime',
    productIds: ['TO-002'],
  },

  // ─── Touch Ruby ──────────────────────────────────────────────────
  {
    id: 'CK-014',
    name: 'RUBY COSMOPOLITAN',
    tagline: 'BLUSH-PINK ELEGANCE',
    description:
      'Touch Ruby gives the cosmopolitan deep berry character — tart cranberry, citrus and a blush-pink glow.',
    image: '/products/ruby.png',
    ingredients: [
      '1.5 oz Touch Ruby',
      '0.75 oz cranberry juice',
      '0.5 oz triple sec',
      '0.5 oz fresh lime juice',
      'Ice',
    ],
    preparation:
      'Add all ingredients to a shaker with ice. Shake for 12 seconds and double strain into a chilled martini glass.',
    garnish: 'Lime twist',
    color: '#E63946',
    baseSpirit: 'Touch Ruby',
    productIds: ['TO-003'],
  },
  {
    id: 'CK-015',
    name: 'RUBY BRAMBLE',
    tagline: 'BERRY-DRENCHED AND BOLD',
    description:
      'Touch Ruby over crushed ice with lemon and a bleed of blackberry liqueur — a striking, berry-drenched sipper.',
    image: '/products/ruby.png',
    ingredients: [
      '1.5 oz Touch Ruby',
      '0.75 oz fresh lemon juice',
      '0.5 oz simple syrup',
      '0.5 oz blackberry liqueur',
      'Crushed ice',
      'Fresh blackberries',
    ],
    preparation:
      'Build Touch Ruby, lemon juice and simple syrup over crushed ice in a rocks glass. Drizzle the blackberry liqueur over the top so it bleeds down through the ice.',
    garnish: 'Fresh blackberries and a lemon wheel',
    color: '#E63946',
    baseSpirit: 'Touch Ruby',
    productIds: ['TO-003'],
  },
  {
    id: 'CK-016',
    name: 'RUBY SPRITZ',
    tagline: 'EFFERVESCENT AND BRIGHT',
    description:
      'Touch Ruby, sparkling wine and soda make a light, effervescent spritz bursting with berry and citrus.',
    image: '/products/ruby.png',
    ingredients: [
      '1.5 oz Touch Ruby',
      '2 oz sparkling wine',
      '1 oz soda water',
      '0.5 oz fresh lemon juice',
      'Ice',
      'Fresh berries',
    ],
    preparation:
      'Fill a wine glass with ice. Add Touch Ruby and lemon juice, then top with sparkling wine and soda water. Stir gently.',
    garnish: 'Fresh berries and a lemon twist',
    color: '#E63946',
    baseSpirit: 'Touch Ruby',
    productIds: ['TO-003'],
  },
  {
    id: 'CK-017',
    name: 'RUBY LEMONADE',
    tagline: 'BERRY-KISSED LEMONADE',
    description:
      'Touch Ruby turns fresh lemonade into a berry-kissed, ruby-red refresher — easy, bright and made for a crowd.',
    image: '/products/ruby.png',
    ingredients: [
      '1.5 oz Touch Ruby',
      '1 oz fresh lemon juice',
      '0.75 oz simple syrup',
      '2 oz soda water',
      'Ice',
    ],
    preparation:
      'Add Touch Ruby, lemon juice and simple syrup to an ice-filled highball glass. Top with soda water and stir.',
    garnish: 'Lemon wheel and raspberries',
    color: '#E63946',
    baseSpirit: 'Touch Ruby',
    productIds: ['TO-003'],
  },

  // ─── Touch One ───────────────────────────────────────────────────
  {
    id: 'CK-018',
    name: 'ONE VODKA SODA',
    tagline: 'CLEAN AND UNCOMPLICATED',
    description:
      'The purest expression of Touch One — clean spirit, soda and a squeeze of lime. Crisp, low-key and endlessly drinkable.',
    image: '/products/one.png',
    ingredients: ['2 oz Touch One', '4 oz soda water', '0.5 oz fresh lime juice', 'Ice', 'Lime wedge'],
    preparation:
      'Fill a highball glass with ice. Add Touch One and lime juice, then top with soda water and stir gently.',
    garnish: 'Lime wedge',
    color: '#0055FF',
    baseSpirit: 'Touch One',
    productIds: ['TO-004'],
  },
  {
    id: 'CK-019',
    name: 'ONE CUCUMBER COOLER',
    tagline: 'COOL AND GARDEN-FRESH',
    description:
      'Touch One with muddled cucumber, lime and soda — a crisp, spa-like cooler that lets the clean spirit shine.',
    image: '/products/one.png',
    ingredients: [
      '2 oz Touch One',
      '0.75 oz fresh lime juice',
      '0.5 oz simple syrup',
      '4 cucumber slices',
      'Soda water',
      'Ice',
    ],
    preparation:
      'Muddle three cucumber slices with simple syrup in a shaker. Add Touch One, lime juice and ice, then shake. Strain over fresh ice and top with soda water.',
    garnish: 'Cucumber ribbon',
    color: '#0055FF',
    baseSpirit: 'Touch One',
    productIds: ['TO-004'],
  },
  {
    id: 'CK-020',
    name: 'ONE FRENCH MARTINI',
    tagline: 'SILKY AND FRUIT-FORWARD',
    description:
      'Touch One shaken with pineapple and raspberry liqueur into a frothy, fruit-forward martini with a flawless finish.',
    image: '/products/one.png',
    ingredients: ['2 oz Touch One', '1 oz pineapple juice', '0.5 oz raspberry liqueur', 'Ice'],
    preparation:
      'Add all ingredients to a shaker with ice. Shake hard for 12 seconds to build the froth, then double strain into a chilled martini glass.',
    garnish: 'Raspberry and lemon twist',
    color: '#0055FF',
    baseSpirit: 'Touch One',
    productIds: ['TO-004'],
  },
  {
    id: 'CK-021',
    name: 'ONE VESPER',
    tagline: 'BOLD AND TIMELESS',
    description:
      'Touch One anchors a modern Vesper — spirit-forward, bone-dry and built for those who take their classics seriously.',
    image: '/products/one.png',
    ingredients: ['2.5 oz Touch One', '0.75 oz gin', '0.5 oz Lillet Blanc', 'Ice', 'Lemon peel'],
    preparation:
      'Stir Touch One, gin and Lillet Blanc with ice for 30 seconds. Strain into a chilled coupe and express the lemon peel over the surface.',
    garnish: 'Lemon peel',
    color: '#0055FF',
    baseSpirit: 'Touch One',
    productIds: ['TO-004'],
  },

  // ─── Touch Orange ────────────────────────────────────────────────
  {
    id: 'CK-022',
    name: 'ORANGE SCREWDRIVER',
    tagline: 'SUNSHINE IN A GLASS',
    description:
      'Touch Orange and fresh orange juice — the brunch classic, brightened with bold citrus character.',
    image: '/products/orange.png',
    ingredients: ['1.5 oz Touch Orange', '3 oz fresh orange juice', 'Ice', 'Orange slice'],
    preparation:
      'Fill a highball glass with ice. Add Touch Orange and top with fresh orange juice. Stir gently.',
    garnish: 'Orange slice',
    color: '#FF8C00',
    baseSpirit: 'Touch Orange',
    productIds: ['TO-005'],
  },
  {
    id: 'CK-023',
    name: 'ORANGE COSMO',
    tagline: 'ZESTY AND VIBRANT',
    description:
      'Touch Orange gives the cosmo a vibrant citrus lift — zesty, balanced and impossible to put down.',
    image: '/products/orange.png',
    ingredients: [
      '1.5 oz Touch Orange',
      '0.5 oz triple sec',
      '0.5 oz fresh lime juice',
      '0.5 oz cranberry juice',
      'Ice',
    ],
    preparation:
      'Add all ingredients to a shaker with ice. Shake for 12 seconds and double strain into a chilled martini glass.',
    garnish: 'Orange twist',
    color: '#FF8C00',
    baseSpirit: 'Touch Orange',
    productIds: ['TO-005'],
  },
  {
    id: 'CK-024',
    name: 'ORANGE SPRITZ',
    tagline: 'BITTERSWEET APERITIVO',
    description:
      'Touch Orange, prosecco and a bitter aperitivo make a bittersweet, sunset-hued spritz built for golden hour.',
    image: '/products/orange.png',
    ingredients: [
      '1.5 oz Touch Orange',
      '2 oz prosecco',
      '1 oz soda water',
      '0.5 oz aperitivo bitter',
      'Ice',
      'Orange slice',
    ],
    preparation:
      'Fill a wine glass with ice. Add Touch Orange and the aperitivo, then top with prosecco and soda water. Stir gently.',
    garnish: 'Orange slice',
    color: '#FF8C00',
    baseSpirit: 'Touch Orange',
    productIds: ['TO-005'],
  },
  {
    id: 'CK-025',
    name: 'ORANGE GINGER MULE',
    tagline: 'SPICY CITRUS KICK',
    description:
      'Touch Orange meets spicy ginger beer and lime — a zesty, bold twist on the mule with a citrus punch.',
    image: '/products/orange.png',
    ingredients: ['2 oz Touch Orange', '0.5 oz fresh lime juice', '4 oz ginger beer', 'Ice', 'Orange wheel'],
    preparation:
      'Fill a copper mug with ice. Add Touch Orange and lime juice, then top with ginger beer and stir gently.',
    garnish: 'Orange wheel and candied ginger',
    color: '#FF8C00',
    baseSpirit: 'Touch Orange',
    productIds: ['TO-005'],
  },
];

// ─── Derived taxonomy ───────────────────────────────────────────────────────
// The Figma wireframe tags every serve with a Season + Occasion and a glass.
// Until the shared Strapi `cocktail` type owns those, we derive them
// deterministically from the name so the filter + explore routes have stable,
// sensible data (no hydration drift). Replace enrich() with the CMS read later.

const SEASONS: Season[] = ['Spring', 'Summer', 'Fall', 'Winter'];
const OCCASIONS: Occasion[] = ['Date Night', 'Game Day', 'Party', 'Brunch', 'Beach', 'Holiday'];

function seasonFor(c: RawCocktail, i: number): Season {
  const n = c.name.toLowerCase();
  if (/spritz|breeze|beach|paradise|soda|mojito|summer|sunburst|colada/.test(n)) return 'Summer';
  if (/espresso|old fashioned|spiced|holiday|winter|hot|cosmopolitan|martini/.test(n)) return 'Winter';
  if (/berry|crush|french 75|lemon|spring|blossom|fizz/.test(n)) return 'Spring';
  if (/mule|ginger|apple|maple|fall|harvest/.test(n)) return 'Fall';
  // biome-ignore lint/style/noNonNullAssertion: modulo index is always in range.
  return SEASONS[i % SEASONS.length]!;
}

function eventFor(c: RawCocktail, i: number): Occasion {
  const n = c.name.toLowerCase();
  if (/cosmopolitan|french 75|martini/.test(n)) return 'Date Night';
  if (/bloody mary|mimosa|brunch|lemon drop/.test(n)) return 'Brunch';
  if (/paradise|breeze|beach|spritz|sunburst/.test(n)) return 'Beach';
  if (/mule|soda|game/.test(n)) return 'Game Day';
  if (/holiday|spiced|punch/.test(n)) return 'Holiday';
  // biome-ignore lint/style/noNonNullAssertion: modulo index is always in range.
  return OCCASIONS[i % OCCASIONS.length]!;
}

function glassFor(c: RawCocktail): string {
  const n = c.name.toLowerCase();
  if (/cosmopolitan|martini/.test(n)) return 'Chilled coupe';
  if (/mule/.test(n)) return 'Copper mug';
  if (/old fashioned/.test(n)) return 'Rocks glass';
  if (/spritz/.test(n)) return 'Large wine glass';
  return 'Highball glass';
}

/** Card art keeps names UPPERCASE; the recipe H1 is title-case ("Key Lime Paradise"). */
export function titleCase(name: string): string {
  return name
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase());
}

export function cocktailSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function enrich(c: RawCocktail, i: number): Cocktail {
  return {
    ...c,
    slug: cocktailSlug(c.name),
    glass: glassFor(c),
    serves: '1',
    season: seasonFor(c, i),
    event: eventFor(c, i),
  };
}

export const COCKTAILS: Cocktail[] = RAW_COCKTAILS.map(enrich);

export const ALL_SEASONS: readonly Season[] = SEASONS;
export const ALL_OCCASIONS: readonly Occasion[] = OCCASIONS;

/** SKU display order used by the per-expression menu on /cocktails. */
const SKU_ORDER = ['Touch Artisan', 'Touch Key Lime', 'Touch Ruby', 'Touch One', 'Touch Orange'];

export function getCocktailBySlug(slug: string): Cocktail | undefined {
  return COCKTAILS.find((c) => c.slug === slug);
}

export function cocktailsBySku(): Array<{ sku: string; cocktails: Cocktail[] }> {
  return SKU_ORDER.map((sku) => ({
    sku,
    cocktails: COCKTAILS.filter((c) => c.baseSpirit === sku),
  })).filter((g) => g.cocktails.length > 0);
}

export function cocktailsBySeason(season: Season): Cocktail[] {
  return COCKTAILS.filter((c) => c.season === season);
}

export function cocktailsByOccasion(event: Occasion): Cocktail[] {
  return COCKTAILS.filter((c) => c.event === event);
}

/** One signature serve per expression — the home "Featured Recipes" rail. */
export function featuredCocktails(): Cocktail[] {
  return SKU_ORDER.map((sku) => COCKTAILS.find((c) => c.baseSpirit === sku)).filter(
    (c): c is Cocktail => Boolean(c),
  );
}
