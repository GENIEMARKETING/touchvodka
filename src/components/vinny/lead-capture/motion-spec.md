# lead-capture — motion spec

The capture step must feel calm and trustworthy, never "salesy." Motion is
minimal so it never competes with the single CTA.

| Moment | What | Timing / easing | Notes |
|---|---|---|---|
| Card enter | none on the card itself | — | The card is the page's payload; it must be present at first paint (no reveal-delay on the conversion point). |
| Success swap | fade + 8px rise of the success line | `ScrollReveal` default (`brandEase`, ~500ms) | Replaces the form on `200`; the only celebratory beat. |
| Submit button | inherits `@vinny/ui` Button press/disabled states | — | No extra spinner motion; label switches to "Sending…". |
| Error line | no motion; `aria-live="polite"` announces it | — | Errors must be readable, not animated away. |

**Reduced motion:** the only animation (success reveal) comes from
`ScrollReveal`, which already honors `prefers-reduced-motion` (foundation gate).
No JS motion branch needed.

**Performance:** zero layout-shift target — the card reserves its space; the
success state swaps inside the same `<section>` footprint.
