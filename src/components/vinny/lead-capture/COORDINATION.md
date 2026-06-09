# lead-capture — cross-session contracts (S10 ⇄ S7, S8)

This block is the funnel's keystone and depends on contracts owned by S7 + S8.
**Status: reconciled against the in-tree code** (S7's `@geniemarketing/foundation/consent`
+ S8's `@geniemarketing/foundation/lead-contract`) — the block serializes to S8's exact
`LeadPayload`. Keep these seams in sync if either side changes.

## 1. `/api/lead` — owned by **S8** (`@geniemarketing/foundation/lead-contract`)

The block builds and POSTs S8's `LeadPayload` verbatim:

```ts
{
  brand,                     // LeadBrand (passed in by the page)
  source,                    // campaign attribution
  landingPage,               // window.location.pathname
  email, name?, phone?, message?,
  formId,                    // = the A/B `variant`
  consent: { marketing, timestamp, policyVersion, source },
  turnstileToken,            // from the Turnstile widget
  honeypot,                  // company_website (must be empty)
  meta?                      // any extra (non-first-class) form fields
}
```

Spam gate is S8's requirement: **Turnstile** (`turnstileSiteKey` prop → widget →
hidden `cf-turnstile-response` we read from the form) + **honeypot**
(`company_website`, hidden). S8's n8n flow verifies both server-side.

## 2. `useConsent()` — owned by **S7** (`@geniemarketing/foundation/consent`)

We use the real API: `const { hasConsent, record } = useConsent()`.
- `consent.marketing` = the explicit opt-in checkbox **or** `hasConsent('marketing')`
- `consent.timestamp` = `record?.decidedAt`
- `consent.policyVersion` = `String(CONSENT_VERSION)` (S7's export)

## 3. PostHog — owned by **S7** (consent-gated loader)

Events fire through `window.posthog?.capture(...)` (null-safe → consent-gated for
free). Names — **keep stable** (the PostHog funnel + A/B winner-pick depend on them):
`lead_form_viewed`, `lead_captured`, `lead_capture_failed` — each `{ source, variant }`.
