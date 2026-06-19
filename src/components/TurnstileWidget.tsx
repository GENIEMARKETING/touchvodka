'use client';

import { useEffect, useRef } from 'react';

/**
 * Cloudflare Turnstile — the spam gate the shared `/api/lead` contract (S8)
 * REQUIRES: it injects a hidden `cf-turnstile-response` token into the enclosing
 * <form>, which the lead forms read + send. Without it the token is empty and
 * `/api/lead` returns 400 ("Something went wrong"). The reference impl
 * (`LeadCapture`) does the same; this is the reusable version for the redesign's
 * AreaInterest / PromoDialog / SurveyForm.
 *
 * Explicit render (not implicit) so it also mounts after a client-side navigation
 * (Next <Link>), where api.js's load-time auto-render would miss a freshly-mounted
 * widget. Renders nothing when `NEXT_PUBLIC_TURNSTILE_SITE_KEY` is unset (local
 * dev) — the preview/prod have it set (TEST key on the preview, real key in prod).
 */
const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
const SCRIPT_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: { sitekey: string }) => string;
      remove: (id: string) => void;
    };
  }
}

function ensureScript(): void {
  if (document.querySelector('script[data-vinny-turnstile]')) return;
  const s = document.createElement('script');
  s.src = SCRIPT_SRC;
  s.async = true;
  s.defer = true;
  s.dataset.vinnyTurnstile = 'true';
  document.head.appendChild(s);
}

export default function TurnstileWidget({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SITE_KEY || typeof window === 'undefined') return;
    ensureScript();
    let id: string | undefined;
    let cancelled = false;
    const render = () => {
      if (cancelled) return;
      const el = ref.current;
      const ts = window.turnstile;
      if (el && ts && el.childElementCount === 0) {
        id = ts.render(el, { sitekey: SITE_KEY });
      } else if (!ts) {
        setTimeout(render, 200); // api.js still loading — retry.
      }
    };
    render();
    return () => {
      cancelled = true;
      if (id && window.turnstile) window.turnstile.remove(id);
    };
  }, []);

  if (!SITE_KEY) return null;
  return <div ref={ref} className={className} />;
}
