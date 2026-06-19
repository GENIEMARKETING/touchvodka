'use client';

import { Check, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';

/**
 * NotifyModal — the Thank-You overlay shown after an Area-Interest submit
 * (Figma `Notify Thank-You` 548:3599). Confirms the signup, then offers the
 * $10-off survey ("Start the survey" → /survey) or "Maybe later" (close).
 * Controlled: parent owns `open`. Escape + backdrop click close it.
 */
export default function NotifyModal({
  open,
  email,
  onClose,
}: {
  open: boolean;
  email?: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-fg/60 p-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notify-title"
    >
      {/* Backdrop click closes (the inner card stops propagation). */}
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 h-full w-full cursor-default"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-soft-lg md:p-10">
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-fg"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white">
          <Check className="h-7 w-7" />
        </div>

        <h2 id="notify-title" className="font-display text-3xl text-fg">
          You're on the list
        </h2>
        <p className="mt-3 text-neutral-600 leading-relaxed">
          {email ? (
            <>
              We'll email <span className="font-medium text-fg">{email}</span> the moment Touch
              lands near you.
            </>
          ) : (
            "We'll email you the moment Touch lands near you."
          )}
        </p>

        <div className="mt-8 rounded-2xl bg-warm p-5">
          <p className="font-display text-accent text-sm uppercase tracking-[0.2em]">$10 off</p>
          <p className="mt-1 text-neutral-700 text-sm">
            Tell us how you drink in 5 quick questions and we'll send a code.
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/survey"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3 font-display text-sm text-white transition-transform duration-300 ease-brand hover:-translate-y-0.5"
            >
              Start the survey
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full px-7 py-3 font-display text-fg text-sm transition-colors hover:text-accent"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
