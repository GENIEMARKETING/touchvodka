import type { Testimonial } from '@/components/vinny/testimonial-image-card/testimonial-image-card';

/**
 * Local seed for the homepage testimonial wall — renders pre-CMS (the shared
 * Strapi `testimonial` type is applied by S6 at "prod up"). Once the CMS has
 * `touch-vodka` testimonials, `getTestimonials` returns those and this seed is
 * only the fail-soft fallback. Placeholder copy — Vinny replaces it in Strapi.
 *
 * Brand truth (anti-drift): Touch is a Tampa, Florida vodka, 10× distilled.
 */
export const TESTIMONIALS: Testimonial[] = [
  {
    id: 'seed-1',
    quote:
      'Smoothest pour at the bar — our Ybor regulars ask for Touch by name now. The 10× really shows in the finish.',
    author: { name: 'Mara Quinn', title: 'Bar Director · Tampa' },
    rating: 5,
  },
  {
    id: 'seed-2',
    quote: 'Clean enough to sip neat, characterful enough to build a whole cocktail menu around.',
    author: { name: 'Devon Hart', title: 'Beverage Buyer' },
    rating: 5,
  },
  {
    id: 'seed-3',
    quote: 'A genuinely impressive Florida spirit — punches well above its shelf price.',
    author: { name: 'Coastal Spirits Review' },
    rating: 4,
  },
  {
    id: 'seed-4',
    quote: 'Gifted one bottle, bought three more. The label looks the way it tastes.',
    author: { name: 'Priya N.' },
    rating: 5,
  },
  {
    id: 'seed-5',
    quote: 'We swapped our well vodka for Touch and covers went up. No notes.',
    author: { name: 'Carlos Vega', title: 'Owner · Ybor City' },
    rating: 5,
  },
];
