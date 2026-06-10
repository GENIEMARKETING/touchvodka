import PageShell, { PageHero } from '@/components/PageShell';
import { COCKTAILS } from '@/data/cocktails';
import { mediaUrl } from '@/lib/media';
import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
  title: 'Signature Cocktails',
  description:
    'Signature cocktail recipes built on the Touch Vodka collection — from the Artisan Old Fashioned to the Orange Sunburst.',
};

export default function CocktailsPage() {
  return (
    <PageShell>
      <PageHero
        eyebrow="// 02_MIXOLOGY"
        title="Cocktails"
        lead="Five spirits, five signature serves. Precision recipes engineered for the smoothest finish."
      />
      <div className="grid grid-cols-1 lg:grid-cols-2">
        {COCKTAILS.map((c) => (
          <article
            key={c.id}
            className="flex flex-col border-black border-r-2 border-b-2 p-8 md:p-12"
          >
            <div className="mb-6 flex items-start justify-between gap-6">
              <div>
                <span className="font-bold text-accent text-xs tracking-widest">
                  [ {c.baseSpirit} ]
                </span>
                <h2 className="mt-2 font-display text-4xl uppercase">{c.name}</h2>
              </div>
              <Image
                alt={c.name}
                src={mediaUrl(c.image)}
                width={80}
                height={110}
                className="h-28 w-auto object-contain"
              />
            </div>
            <p className="mb-6 font-mono text-sm lowercase opacity-70">{c.description}</p>
            <h3 className="mb-2 font-bold text-xs uppercase tracking-widest">Ingredients</h3>
            <ul className="mb-6 space-y-1 font-mono text-sm lowercase opacity-80">
              {c.ingredients.map((i) => (
                <li key={i} className="border-accent border-l-2 pl-3">
                  {i}
                </li>
              ))}
            </ul>
            <h3 className="mb-2 font-bold text-xs uppercase tracking-widest">Method</h3>
            <p className="font-mono text-sm lowercase opacity-80">{c.preparation}</p>
            <p className="mt-4 font-mono text-accent text-xs lowercase">garnish: {c.garnish}</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
