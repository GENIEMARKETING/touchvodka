/**
 * Stats — "Five expressions. One obsession." (Figma home Stats). Two columns:
 * a 2×2 grid of white stat cards beside a distillery image. FACTS ONLY, harvested
 * from the real brand (est. 2012, 10× distilled, 5 expressions, 80 proof) — no
 * invented awards. The distillery photo is a placeholder until the asset pass.
 */
const STATS: Array<{ value: string; label: string }> = [
  { value: '2012', label: 'Established' },
  { value: '10×', label: 'Distilled' },
  { value: '5', label: 'Expressions' },
  { value: '80', label: 'Proof' },
];

export default function Stats() {
  return (
    <section className="bg-warm py-20 md:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 md:px-10 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="mb-3 font-mono text-accent text-xs uppercase tracking-[0.25em]">By the numbers</p>
          <h2 className="mb-8 font-display text-4xl text-fg uppercase md:text-5xl">
            Five expressions. One obsession.
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white p-6 shadow-soft md:p-8">
                <p className="font-display text-5xl text-accent md:text-6xl">{s.value}</p>
                <p className="mt-2 font-mono text-neutral-500 text-xs uppercase tracking-[0.25em]">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Distillery photography — placeholder until the asset pass. */}
        <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-neutral-200 via-neutral-100 to-accent/10 shadow-soft">
          <span className="font-mono text-neutral-400 text-xs uppercase tracking-[0.25em]">
            Distillery · asset pass
          </span>
        </div>
      </div>
    </section>
  );
}
