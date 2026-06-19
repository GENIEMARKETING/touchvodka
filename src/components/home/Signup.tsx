/**
 * Signup — Refined-Bold "become an insider" band (new section, the reference
 * site's "Become a Taster" capture). Dark band before the footer.
 *
 * NOTE: presentational for the layout pass. Wiring to the S8 lead pipeline
 * (/api/lead → Twenty + Mautic, consent-stamped) is a follow-up in the
 * commerce/wiring pass — see the shared `LeadCapture` block used on /find-us.
 */
import Link from 'next/link';

export default function Signup() {
  return (
    <section className="bg-fg py-20 text-white md:py-28">
      <div className="mx-auto max-w-3xl px-6 text-center md:px-10">
        <p className="mb-3 font-mono text-accent text-xs uppercase tracking-[0.25em]">Become a Touch Taster</p>
        <h2 className="mb-4 font-display text-4xl uppercase md:text-5xl">Taste what's next</h2>
        <p className="mb-8 text-neutral-300 leading-relaxed">
          Join the Touch Taster list for first access to new releases, signature recipes, and where
          to find us — plus an early pour before anyone else. No noise, just the finer details.
        </p>
        <form className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            placeholder="your@email.com"
            aria-label="Email address"
            className="flex-grow rounded-full border border-white/20 bg-white/5 px-6 py-3.5 text-white placeholder:text-white/40 focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-full bg-accent px-7 py-3.5 font-display text-white shadow-brand-glow transition-transform duration-300 ease-brand hover:-translate-y-0.5"
          >
            Sign up
          </button>
        </form>
        <p className="mt-4 font-mono text-white/40 text-xs">
          Must be 21+. Please enjoy responsibly. Read our{' '}
          <Link href="/privacy" className="underline hover:text-white">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
