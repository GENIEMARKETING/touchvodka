import PageShell from '@/components/PageShell';
import RecipeReviews from '@/components/RecipeReviews';
import { COCKTAILS, COCKTAILS_PUBLISHED, getCocktailBySlug, titleCase } from '@/data/cocktails';
import { getProductByName } from '@/data/products';
import { getRecipeRatingSummary, getRecipeReviews } from '@/lib/recipe-reviews';
import {
  SITE_ORIGIN,
  breadcrumbJsonLd,
  jsonLdScript,
  pageMetadata,
  recipeJsonLd,
} from '@/lib/seo';
import { ArrowRight } from 'lucide-react';
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

/** Pre-render every cocktail recipe at build time (static, CMS-ready). */
export function generateStaticParams() {
  return COCKTAILS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getCocktailBySlug(slug);
  if (!c) return { title: 'Recipe not found' };
  return pageMetadata({
    title: `${titleCase(c.name)} Recipe`,
    description: c.description,
    path: `/cocktails/${c.slug}`,
  });
}

/** Split the prose method into numbered steps, then append the garnish step. */
function methodSteps(preparation: string, garnish: string): string[] {
  const steps = preparation
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (garnish) steps.push(`Garnish with ${garnish.toLowerCase()}.`);
  return steps;
}

export default async function RecipePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getCocktailBySlug(slug);
  if (!c) notFound();

  const product = getProductByName(c.baseSpirit);
  const display = titleCase(c.name);
  const steps = methodSteps(c.preparation, c.garnish);
  const path = `/cocktails/${c.slug}`;
  const imageAbs = c.image.startsWith('http') ? c.image : `${SITE_ORIGIN}${c.image}`;

  // Genuine recipe ratings (shared reviews module, recipe target). Null until real
  // ratings exist — never fabricated. Feeds aggregateRating + the ratings widget.
  const [ratingSummary, recipeReviews] = await Promise.all([
    getRecipeRatingSummary(c.slug),
    getRecipeReviews(c.slug),
  ]);

  return (
    <PageShell>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD; jsonLdScript escapes "<".
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            recipeJsonLd({
              name: display,
              description: c.description,
              image: [imageAbs],
              path,
              ingredients: c.ingredients,
              instructions: steps,
              category: 'Cocktail',
              yield: `${c.serves} serving`,
              keywords: [c.baseSpirit, c.season, c.event, 'vodka cocktail'],
              prepTimeMin: c.prepTimeMin ?? 5,
              cookTimeMin: c.cookTimeMin ?? 0,
              datePublished: COCKTAILS_PUBLISHED,
              ...(ratingSummary
                ? { rating: { ratingValue: ratingSummary.average, ratingCount: ratingSummary.count } }
                : {}),
            }),
          ),
        }}
      />
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD; jsonLdScript escapes "<".
        dangerouslySetInnerHTML={{
          __html: jsonLdScript(
            breadcrumbJsonLd([
              { name: 'Cocktails', path: '/cocktails' },
              { name: display, path },
            ]),
          ),
        }}
      />

      {/* Hero — split: rounded cocktail image + eyebrow / title / meta / intro. */}
      <section className="mx-auto max-w-7xl px-6 py-12 md:px-10 md:py-16">
        <div className="grid items-center gap-10 md:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-warm">
            <Image
              src={c.image}
              alt={display}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 560px"
              className="object-cover"
            />
          </div>
          <div>
            <p className="font-mono text-accent text-xs uppercase tracking-[0.25em]">
              {c.baseSpirit}
            </p>
            <h1 className="mt-3 font-display text-5xl text-fg md:text-6xl">{display}</h1>
            <p className="mt-3 text-neutral-500 text-sm uppercase tracking-wide">
              {c.season} · {c.event} · {c.glass}
            </p>
            <p className="mt-5 max-w-md text-lg text-neutral-600 leading-relaxed">{c.description}</p>
          </div>
        </div>
      </section>

      {/* Body — Ingredients (blue dots) | Method (numbered) on the warm band. */}
      <section className="bg-warm py-16 md:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 md:grid-cols-2 md:px-10 lg:gap-16">
          <div>
            <h2 className="font-display text-2xl text-fg">Ingredients</h2>
            <ul className="mt-6 space-y-3">
              {c.ingredients.map((ing) => (
                <li key={ing} className="flex items-start gap-3 text-neutral-700">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
                  <span>{ing}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-2xl text-fg">Method</h2>
            <ol className="mt-6 space-y-5">
              {steps.map((step, i) => (
                // id matches the HowToStep `url` anchor (#step-N) emitted in recipeJsonLd.
                <li key={step} id={`step-${i + 1}`} className="flex scroll-mt-24 items-start gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent font-display text-sm text-white">
                    {i + 1}
                  </span>
                  <span className="text-neutral-700 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Details card — GLASS / GARNISH / SERVES / MADE WITH. */}
        <div className="mx-auto mt-12 max-w-7xl px-6 md:px-10">
          <dl className="grid grid-cols-2 gap-8 rounded-3xl bg-white p-8 shadow-soft md:grid-cols-4 md:p-10">
            <Detail label="Glass" value={c.glass} />
            <Detail label="Garnish" value={c.garnish} />
            <Detail label="Serves" value={c.serves} />
            <div>
              <dt className="font-mono text-neutral-400 text-xs uppercase tracking-[0.2em]">
                Made with
              </dt>
              {product ? (
                <dd>
                  <Link
                    href={`/products/${product.slug}`}
                    className="font-display text-accent text-xl transition-colors hover:text-fg"
                  >
                    {c.baseSpirit}
                  </Link>
                </dd>
              ) : (
                <dd className="font-display text-accent text-xl">{c.baseSpirit}</dd>
              )}
            </div>
          </dl>
        </div>
      </section>

      {/* Genuine recipe ratings → aggregateRating. Signed-in submit; never fabricated. */}
      <RecipeReviews
        recipeSlug={c.slug}
        recipeName={display}
        summary={ratingSummary}
        initialReviews={recipeReviews}
      />

      {/* CTA — "Make it a Touch night" → Shop the SKU + more cocktails. */}
      <section className="bg-[#e9e0d0] py-16 text-center md:py-24">
        <div className="mx-auto max-w-2xl px-6">
          <p className="font-mono text-accent text-xs uppercase tracking-[0.25em]">
            Pour yourself one
          </p>
          <h2 className="mt-3 font-display text-4xl text-fg md:text-5xl">Make it a Touch night</h2>
          <p className="mt-4 text-neutral-600 leading-relaxed">
            Grab a bottle of {c.baseSpirit} and shake up a taste of Tampa at home.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href={product ? `/products/${product.slug}` : '/products'}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 font-display text-lg text-white shadow-brand-glow transition-transform duration-300 ease-brand hover:-translate-y-0.5"
            >
              Shop {c.baseSpirit} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/cocktails"
              className="inline-flex items-center justify-center rounded-full bg-fg px-8 py-4 font-display text-lg text-white transition-transform duration-300 ease-brand hover:-translate-y-0.5"
            >
              More cocktails
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-neutral-400 text-xs uppercase tracking-[0.2em]">{label}</dt>
      <dd className="mt-1 font-display text-fg text-xl">{value}</dd>
    </div>
  );
}
