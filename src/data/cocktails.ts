export interface Cocktail {
  id: string;
  name: string;
  tagline: string;
  description: string;
  image: string;
  ingredients: string[];
  preparation: string;
  garnish: string;
  color: string;
  baseSpirit: string;
  productIds: string[];
}

export const COCKTAILS: Cocktail[] = [
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
];
