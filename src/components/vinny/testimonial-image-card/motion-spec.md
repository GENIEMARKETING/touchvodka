# Testimonial Image Card — motion spec

| Field | Value |
|---|---|
| **Sequence** | None of its own. The card renders in its final, static state. Entrance motion (stagger reveal / marquee scroll) is owned by the **container** — `testimonial-wall` — so a standalone card is always instantly readable. |
| **Trigger** | n/a (no self-motion). |
| **Easing** | n/a |
| **Duration** | n/a |
| **Stagger** | n/a (the wall applies the stagger across cards) |
| **Perf budget** | Server component (zero client JS). Avatar `loading="lazy"` + fixed `40×40` so it never shifts; no avatar → a static monogram (no network). CLS = 0, INP = 0. |
| **Reduced motion** | Nothing to reduce — fully static by design. |
| **Don'ts** | Don't add a per-card `ScrollReveal` (one trigger per card thrashes ScrollTrigger in a wall); don't lazy-reveal the quote (testimonials are SEO + trust content — keep them in the SSR HTML). Don't animate the stars. |
