# Testimonial Wall — motion spec

| Field | Value |
|---|---|
| **Sequence** | An infinite horizontal **marquee** of testimonial cards. The track + an `aria-hidden` clone sit side by side and translate `0 → -50%` on a loop, so the row scrolls seamlessly. Pauses on hover / `focus-within` (so a keyboard user can read + tab into a card). |
| **Trigger** | CSS animation on mount (no scroll trigger, no JS). |
| **Easing** | `linear` (a constant-speed ticker; eased marquees look like they're "breathing"). |
| **Duration** | 40s per full loop (slow + ambient, not attention-grabbing). |
| **Stagger** | n/a — continuous scroll, not a staggered reveal. |
| **Perf budget** | `transform: translateX` only (compositor-friendly, no reflow/repaint of the cards). Server component → zero client JS. Each card is a fixed `min(20rem, 80vw)` so the box never reshuffles. CLS = 0. |
| **Reduced motion** | **Pure CSS, resolved at first paint:** `@media (prefers-reduced-motion: reduce)` removes the animation, hides the loop clone, and switches the track to `flex-wrap: wrap; justify-content: center` — the cards become a static **centered grid**. No JS decides this, so there's no hydration flash and no layout shift on either path. The "grid" and "marquee" are the same block, two motion states. |
| **Don'ts** | Don't duplicate cards in the accessibility tree (clone is `aria-hidden`); don't drive the marquee from JS/GSAP (a CSS transform loop is cheaper and SSR-safe); don't ease the loop; don't lazy-reveal the heading or cards (trust + SEO content belongs in the SSR HTML). |
