# stockist-locator — motion spec

A utility block: motion stays subtle so it never delays "where can I buy this."

| Moment | What | Timing / easing | Notes |
|---|---|---|---|
| List items enter | `ScrollReveal` fade + rise, stagger by row | foundation default (`brandEase`) | Only the list animates; the map is present immediately. |
| Active highlight | border + tint swap on select (map ⇄ list) | `transition-colors` ~150ms | Two-way: clicking a marker or a list row sets the same `active`. |
| "Near me" re-sort | list reorders by distance | no FLIP animation (instant) | Re-sorting is information, not decoration; instant avoids motion sickness on long lists. |
| Map pan/zoom | owned by the shared `MapCanvas` util | — | S7's geo util defines map motion; this block doesn't re-implement it. |

**Reduced motion:** `ScrollReveal` honors `prefers-reduced-motion`; the map util
is responsible for its own reduced-motion behaviour.

**Performance:** map canvas reserves a fixed `h-[420px]`; list scrolls within
its own `max-h` — no layout shift when "Use my location" reorders rows.
