import PageShell from '@/components/PageShell';
import SurveyForm from '@/components/SurveyForm';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Get $10 Off',
  description: 'Answer five quick questions about how you drink and unlock $10 off your first bottle of Touch Vodka.',
  robots: { index: false, follow: true },
};

export default function SurveyPage() {
  return (
    <PageShell>
      <section className="mx-auto max-w-3xl px-6 py-16 md:py-24">
        <p className="font-mono text-accent text-xs uppercase tracking-[0.25em]">$10 off</p>
        <h1 className="mt-3 font-display text-5xl text-fg uppercase md:text-6xl">
          Tell us how you drink
        </h1>
        <p className="mt-4 max-w-xl text-lg text-neutral-600 leading-relaxed">
          Five quick questions and we'll send a $10-off code for your first bottle. It helps us pour
          the right Touch, near you.
        </p>
        <div className="mt-12">
          <SurveyForm />
        </div>
      </section>
    </PageShell>
  );
}
