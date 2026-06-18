/**
 * Touch Vodka product catalogue — the brand showcase data.
 *
 * MIGRATION NOTE (S6): this is the seed for the shared Strapi `product` content
 * type, scoped by `site = touch-vodka`. Until Strapi is provisioned the site
 * renders from this local seed; `lib/strapi.ts#getSiteProducts` falls back to it
 * so the build is never blocked on the CMS being up. Ported verbatim from the
 * Vite build's `src/constants.ts`.
 */
export interface TastingNotes {
  nose: string;
  palate: string;
  finish: string;
  pairings: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  color: string;
  image: string;
  proof: string;
  category: string;
  tastingNotes: TastingNotes;
  distillationProcess: string;
  relatedCocktailIds?: string[];
  beaconPosition?: { top: string; left: string };
}

/**
 * Redesign-only CDN path for the new warm-scene collection product shots
 * (Vinny-approved 2026-06-15). Deliberately NOT the live `/touch-vodka/products/`
 * path the live `next-rebuild` site serves — those stay the old real-bottle cutouts
 * so the live site is untouched. Absolute URLs pass through `mediaUrl` unchanged.
 * Source/recipe: Outputs/designs/touchvodka-redesign/ASSET-PASS-HANDOFF.md.
 */
const REDESIGN_PRODUCTS = 'https://img.fatdogspirits.com/touch-vodka/redesign/products';

export const PRODUCTS: Product[] = [
  {
    id: 'TO-001',
    slug: 'touch-artisan',
    name: 'TOUCH ARTISAN',
    tagline: 'CRAFTED WITH TRADITION',
    description:
      'Our artisanal blend, carefully crafted using traditional distillation methods. A smooth, elegant vodka that honors time-tested techniques.',
    color: '#D4A574',
    image: `${REDESIGN_PRODUCTS}/artisan.webp`,
    proof: '80 PROOF',
    category: '10X Premium Distilled Spirit',
    distillationProcess: '10x Distilled',
    relatedCocktailIds: ['CK-001', 'CK-006', 'CK-007', 'CK-008', 'CK-009'],
    beaconPosition: { top: '52%', left: '52%' },
    tastingNotes: {
      nose: 'Subtle grain notes with hints of vanilla and white flowers',
      palate: 'Smooth and creamy with a light sweetness and delicate spice',
      finish: 'Clean, crisp finish with a lingering warmth and elegance',
      pairings: ['Caviar', 'Oysters', 'Dark chocolate', 'Grilled fish'],
    },
  },
  {
    id: 'TO-002',
    slug: 'touch-key-lime',
    name: 'TOUCH KEY LIME',
    tagline: 'TROPICAL CITRUS INFUSION',
    description:
      'Vibrant key lime essence perfectly balanced with our signature smooth vodka base. A refreshing tropical escape in every sip.',
    color: '#7FDB00',
    image: `${REDESIGN_PRODUCTS}/keylime.webp`,
    proof: '80 PROOF',
    category: '10X Citrus Infused Spirit',
    distillationProcess: '10x Distilled',
    relatedCocktailIds: ['CK-002', 'CK-010', 'CK-011', 'CK-012', 'CK-013'],
    beaconPosition: { top: '50%', left: '54%' },
    tastingNotes: {
      nose: 'Bright key lime zest with tropical fruit undertones',
      palate: 'Refreshing citrus burst balanced with smooth vodka base, vibrant and lively',
      finish: 'Crisp and zesty with a light tropical sweetness',
      pairings: ['Shrimp ceviche', 'Light seafood', 'Tropical fruits', 'Lime desserts'],
    },
  },
  {
    id: 'TO-003',
    slug: 'touch-ruby',
    name: 'TOUCH RUBY',
    tagline: 'DEEP RED BERRY ELEGANCE',
    description:
      'A sophisticated blend of ruby-red berries, offering depth, complexity, and natural sweetness that elevates any cocktail.',
    color: '#E63946',
    image: `${REDESIGN_PRODUCTS}/ruby.webp`,
    proof: '80 PROOF',
    category: '10X Berry Infused Spirit',
    distillationProcess: '10x Distilled',
    relatedCocktailIds: ['CK-003', 'CK-014', 'CK-015', 'CK-016', 'CK-017'],
    beaconPosition: { top: '48%', left: '52%' },
    tastingNotes: {
      nose: 'Complex blend of blackberries, raspberries, and dark cherry',
      palate: 'Rich berry flavors with subtle tannins and natural sweetness, velvety smooth',
      finish: 'Deep and lingering with berry notes and subtle spice',
      pairings: ['Dark chocolate', 'Berries', 'Duck', 'Red meat dishes'],
    },
  },
  {
    id: 'TO-004',
    slug: 'touch-one',
    name: 'TOUCH ONE',
    tagline: 'PURE PREMIUM EXPERIENCE',
    description:
      'The flagship of our collection. A premium vodka crafted for those who appreciate excellence, clarity, and uncompromising quality.',
    color: '#0055FF',
    image: `${REDESIGN_PRODUCTS}/one.webp`,
    proof: '80 PROOF',
    category: '10X Premium Distilled Spirit',
    distillationProcess: '10x Distilled + Charcoal Filtered',
    relatedCocktailIds: ['CK-004', 'CK-018', 'CK-019', 'CK-020', 'CK-021'],
    beaconPosition: { top: '52%', left: '51%' },
    tastingNotes: {
      nose: 'Pure and pristine with subtle grain and mineral notes',
      palate: 'Exceptionally smooth, clean, with a subtle sweetness and purity',
      finish: 'Crystal clear finish with a gentle warmth and sophistication',
      pairings: ['Premium caviar', 'Sushi', 'White fish', 'Minimalist cuisine'],
    },
  },
  {
    id: 'TO-005',
    slug: 'touch-orange',
    name: 'TOUCH ORANGE',
    tagline: 'BOLD CITRUS BURST',
    description:
      'Bright orange notes with a vibrant kick. A bold infusion that brings energy and sophistication to the classic vodka profile.',
    color: '#FF8C00',
    image: `${REDESIGN_PRODUCTS}/orange.webp`,
    proof: '80 PROOF',
    category: '10X Citrus Infused Spirit',
    distillationProcess: '10x Distilled',
    relatedCocktailIds: ['CK-005', 'CK-022', 'CK-023', 'CK-024', 'CK-025'],
    beaconPosition: { top: '50%', left: '52%' },
    tastingNotes: {
      nose: 'Bold orange peel with hints of blood orange and citrus blossom',
      palate: 'Vibrant citrus kick with natural sweetness, energetic and bold',
      finish: 'Zesty and invigorating with a warm citrus glow',
      pairings: ['Spicy cuisine', 'Orange desserts', 'Duck', 'Thai food'],
    },
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id);
}

/** Map a cocktail's base spirit ("Touch Key Lime") to its product, for "Shop …" CTAs. */
export function getProductByName(name: string): Product | undefined {
  const n = name.trim().toLowerCase();
  return PRODUCTS.find((p) => p.name.toLowerCase() === n);
}

/** Map a Product to the shared TastingNotes block's `notes` shape. */
export function toTastingNotes(p: Product): Array<{ label: string; value: string }> {
  return [
    { label: 'Nose', value: p.tastingNotes.nose },
    { label: 'Palate', value: p.tastingNotes.palate },
    { label: 'Finish', value: p.tastingNotes.finish },
  ];
}
