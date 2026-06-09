'use client';

import { Card, CardContent, CardTitle } from '@geniemarketing/ui';
import { ScrollReveal } from '@geniemarketing/ui/motion';

/**
 * TastingNotes — a staggered grid of nose / palate / finish notes for a spirits
 * product page.
 *
 * Variant-not-configuration: an optional heading + the notes array. A radar/
 * sensory-chart visualization is a NEW block.
 */
export type TastingNote = { label: string; value: string };

export type TastingNotesProps = {
  heading?: string;
  notes: TastingNote[];
};

export function TastingNotes({ heading = 'Tasting Notes', notes }: TastingNotesProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20">
      <ScrollReveal>
        <h2 className="mb-10 text-center font-bold text-3xl tracking-tight">{heading}</h2>
      </ScrollReveal>
      <ScrollReveal stagger as="ul" className="grid gap-6 md:grid-cols-3">
        {notes.map((note) => (
          <li key={note.label}>
            <Card className="h-full">
              <CardContent className="pt-6">
                <CardTitle className="text-sm uppercase tracking-[0.2em] opacity-60">
                  {note.label}
                </CardTitle>
                <p className="mt-3 text-lg leading-relaxed">{note.value}</p>
              </CardContent>
            </Card>
          </li>
        ))}
      </ScrollReveal>
    </section>
  );
}
