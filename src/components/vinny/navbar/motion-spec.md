# Navbar — motion spec

| Field | Value |
|---|---|
| **Sequence** | transparent over hero → on scroll past 80px, condense: reduce padding, fade in a blurred surface background |
| **Trigger** | `window.scrollY > 80` (passive listener) |
| **Easing** | CSS `transition` (300ms) — no GSAP needed for a two-state toggle |
| **Perf budget** | passive scroll listener; transitions on `padding`/`background` only, no layout thrash; no INP cost |
| **Reduced motion** | `motion-reduce:transition-none` snaps between states |
| **Don'ts** | don't attach a non-passive scroll listener; don't animate `height` (use padding) |
