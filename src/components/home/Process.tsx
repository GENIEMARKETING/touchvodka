/**
 * Process — "The Art of Distillation" (Figma home Process 151:576). Centered
 * header (eyebrow + title + lead) above three numbered cards (01/02/03) in a row
 * — no icons, no CTA. Card titles are title-case. Copy is Strapi-overridable,
 * resolved on the home page and passed in.
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
  cards: Array<{ title: string; body: string }>;
}) {
  return (
    <section id="distillery" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 font-mono text-accent text-xs uppercase tracking-[0.25em]">{eyebrow}</p>
          <h2 className="font-display text-4xl text-fg uppercase md:text-5xl">{title}</h2>
          <p className="mt-4 text-neutral-600 leading-relaxed">{lead}</p>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {cards.map((card, i) => (
            <div key={card.title} className="rounded-2xl bg-neutral-50 p-8">
              <p className="font-mono text-accent text-sm tracking-[0.2em]">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="mt-4 font-display text-fg text-xl">{card.title}</h3>
              <p className="mt-2 text-neutral-600 text-sm leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
