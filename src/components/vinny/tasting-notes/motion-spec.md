# Tasting Notes — motion spec

| Field | Value |
|---|---|
| **Sequence** | heading fades up, then the note cards reveal one-by-one (stagger) as the grid enters view |
| **Trigger** | ScrollReveal `top 85%`, once |
| **Easing** | `brandEase` |
| **Duration** | `durations.base` per card |
| **Stagger** | `stagger.base` (0.08s) across cards |
| **Perf budget** | transform/opacity only; `will-change` auto-cleared on complete by ScrollReveal; CLS < 0.1 (grid reserves its space) |
| **Reduced motion** | cards render in place, no stagger |
| **Don'ts** | don't drive each card with its own ScrollTrigger — let the one `stagger` reveal batch them |
