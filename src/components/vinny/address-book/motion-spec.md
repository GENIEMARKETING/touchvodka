# Address Book — motion spec

| Field | Value |
|---|---|
| **Sequence** | no entrance motion; the inline add/edit form expands in place (content-sized, pushes the grid down only) |
| **Trigger** | "Add address" / "Edit" toggles the inline form; submit shows a textual busy state |
| **Easing** | none (form surfaces must feel instant + trustworthy, like auth-form) |
| **Duration** | n/a |
| **Perf budget** | the inline form grows downward only (no surrounding layout shift); the error row uses `role="alert"` so it's announced |
| **Reduced motion** | nothing to suppress (no motion by design) |
| **Don'ts** | never animate field transitions on an address form; don't persist here — `onSave`/`onDelete` are the page's job; never optimistically drop a card before the delete resolves |
