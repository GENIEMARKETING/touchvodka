import { ArrowRight, type LucideIcon } from 'lucide-react';
import Link from 'next/link';

/**
 * Process — Refined-Bold three-step distillation story (replaces the brutalist
 * bordered grid). Soft cards, sans body copy (not mono-lowercase). Copy + icons
 * are Strapi-overridable, resolved on the home page and passed in.
 */
export default function Process({
  eyebrow,
  title,
  lead,
  cards,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  cards: Array<{ Icon: LucideIcon; title: string; body: string }>;
}) {
  return (
    <section id="distillery" className="bg-neutral-50 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col justify-center">
            <p className="mb-3 font-mono text-accent text-xs uppercase tracking-[0.25em]">{eyebrow}</p>
            <h2 className="mb-6 font-display text-4xl text-fg uppercase md:text-6xl lg:text-7xl">{title}</h2>
            <p className="max-w-md text-lg text-neutral-600 leading-relaxed">{lead}</p>
            <Link
              href="/our-story"
              className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-accent px-7 py-3.5 font-display text-white shadow-brand-glow transition-transform duration-300 ease-brand hover:-translate-y-0.5"
            >
              Learn more <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {cards.map(({ Icon, title: cardTitle, body }) => (
              <div
                key={cardTitle}
                className="rounded-2xl bg-white p-7 shadow-soft transition-shadow duration-300 hover:shadow-soft-lg"
              >
                <Icon className="mb-5 h-10 w-10 text-accent" />
                <h3 className="mb-2 font-display text-2xl text-fg uppercase">{cardTitle}</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
