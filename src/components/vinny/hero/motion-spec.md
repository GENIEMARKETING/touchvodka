# Hero — motion spec

The unit that compounds: this is the reusable record of *how* the hero animates,
so the next project (or AI) reproduces the feel without re-deriving it.

| Field | Value |
|---|---|
| **Sequence** | 1. backdrop parallax begins immediately (scrub) · 2. headline words rise in on load · 3. sublead + CTA fade up shortly after |
| **Trigger** | headline: on mount (above the fold); sublead/CTA: ScrollReveal `top 85%` |
| **Easing** | `brandEase` (from `@vinny/foundation`) |
| **Duration** | `durations.base` per word; stagger `stagger.base` |
| **Perf budget** | LCP element is the headline text, not the image → keep `/hero.jpg` `priority` + sized; CLS target < 0.1 (parallax frame is `overflow-hidden`, fixed footprint) |
| **Reduced motion** | parallax + word-split disabled by the primitives; headline, sublead, CTA render statically |
| **Don'ts** | don't animate the backdrop's `background-position`; don't let the headline reflow on word reveal (it's `inline-block` spans) |

Heavy hero media (video / large stills) → CDN (S5), never bundled in git.
