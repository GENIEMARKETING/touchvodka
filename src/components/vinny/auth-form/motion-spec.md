# Auth Form — motion spec

| Field | Value |
|---|---|
| **Sequence** | no entrance motion; fields swap instantly between login/register/reset modes; button shows a textual busy state |
| **Trigger** | mode toggle links; submit |
| **Easing** | none (auth surfaces must feel instant + trustworthy) |
| **Duration** | n/a |
| **Perf budget** | mode changes add/remove fields — the form is centered and content-sized, so growth pushes downward only (no surrounding layout shift); error row uses `role="alert"` so it's announced, not just shown |
| **Reduced motion** | nothing to suppress (no motion by design) |
| **Don'ts** | never animate field transitions on an auth form (reads as slow/untrustworthy); don't hold tokens in this block — submission is the page's job |
