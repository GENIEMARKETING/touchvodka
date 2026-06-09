# Consent Banner — motion spec

| Field | Value |
|---|---|
| **Sequence** | orestbida `vanilla-cookieconsent` "box" modal slides/fades up from bottom-left on first visit; preferences modal fades in centred |
| **Trigger** | mount, only when no valid consent record exists (library + `consentStore` agree); GPC auto-rejects silently with **no** banner |
| **Easing** | the library's CSS transitions (`--cc-*` custom props); no JS timeline |
| **Perf budget** | zero third-party JS until the visitor opts in — only the lightweight CookieConsent UI loads up front; pixels/PostHog inject *after* consent |
| **Reduced motion** | library honours `prefers-reduced-motion` (instant show/hide) |
| **A11y** | library traps focus in the modal, labels buttons, and `equalWeightButtons` keeps "Reject all" as prominent as "Accept all" (GDPR dark-pattern guidance) |
| **Don'ts** | don't pre-enable any opt-in category; don't hide "Reject all"; don't fire any tracker from here — only write to `consentStore`, which the trackers subscribe to |

**Bridge:** `onFirstConsent / onConsent / onChange → consentStore.set(...)`. The store is the single gate; this block is just the UI that feeds it.
