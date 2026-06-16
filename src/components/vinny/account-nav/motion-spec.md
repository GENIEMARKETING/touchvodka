# Account Nav — motion spec

| Field | Value |
|---|---|
| **Sequence** | no entrance motion; the active item swaps its highlight instantly on navigation |
| **Trigger** | route change (active prop) |
| **Easing** | `transition-colors` only on hover/active (token-driven background) |
| **Duration** | n/a (utility surface) |
| **Perf budget** | colour-only transitions; no transform, no layout shift; nav is content-sized and stacks above the panel on mobile |
| **Reduced motion** | nothing to suppress (no motion by design) |
| **Don'ts** | never animate the active-state change on an account nav (reads as slow); don't hold session state here — sign-out is the page's job (`onSignOut`) |
