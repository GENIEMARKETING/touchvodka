# Order History — motion spec

| Field | Value |
|---|---|
| **Sequence** | no entrance motion; rows use a colour-only hover; the list/detail render in place |
| **Trigger** | hover (row), navigation (list → detail) |
| **Easing** | `transition-colors` on row hover only |
| **Duration** | n/a (utility/data surface) |
| **Perf budget** | no transform, no layout shift; thumbnails are fixed-size to avoid reflow as images load |
| **Reduced motion** | nothing to suppress (no motion by design) |
| **Don'ts** | never gate order numbers / totals / tracking behind motion — account data must be readable even if JS/motion fails; keep `/account/*` pages `noindex` |
