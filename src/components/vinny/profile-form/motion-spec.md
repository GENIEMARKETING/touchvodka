# Profile Form — motion spec

| Field | Value |
|---|---|
| **Sequence** | no entrance motion; profile + password are two static stacked forms; buttons show a textual busy state |
| **Trigger** | submit (profile save / password update) |
| **Easing** | none (account-settings surfaces must feel instant + trustworthy) |
| **Duration** | n/a |
| **Perf budget** | static forms — no transform, no layout shift; status/error rows use `role="status"`/`role="alert"` so changes are announced, not just shown |
| **Reduced motion** | nothing to suppress (no motion by design) |
| **Don'ts** | never animate auth/settings field transitions; email is read-only (it lives on the auth identity); don't call Medusa here — `onSave`/`onChangePassword` are the page's job |
