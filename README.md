# Touch Vodka — touchvodka.com

Premium craft vodka, neo-brutalist. **Rebuilt on the Vinny platform** (Next.js
15 + `@vinny/foundation` + `@vinny/ui` + `@vinny/blocks`) from the original
Vite/React build at `projects/touchvodka`. This was the **T25 onboarding pilot** —
the first site brought end-to-end onto the platform; the runbook + gotchas it
produced live in [`LEARNINGS.md`](./LEARNINGS.md) and the agency
`mistakes-registry/`.

## What's wired (per onboarding stage)

| Stage | What | Where |
|---|---|---|
| **S2** scaffold | vinny-init contract: reusable CI, preflight, graphify, Renovate | `.github/`, `scripts/preflight.ts` |
| **S4** UI | bespoke brutalist chrome + reused blocks (tasting-notes, locator, lead-capture, consent, age-gate) | `src/components/` |
| **S6** CMS | shared Strapi client scoped by `client=touch-vodka`, seed fallback | `src/lib/strapi.ts`, `infrastructure/cms/onboarding/touch-vodka.md` |
| **S7** consent | consent banner + PostHog + **consent-gated gtag** (closes the GDPR gap) | `src/app/layout.tsx`, `src/components/Analytics.tsx` |
| **S8** leads/email | forms → `/api/lead` → n8n/Twenty/Mautic; email nodemailer→Postal (old path kept) | `src/app/api/`, `src/lib/email.ts` |
| **S9** analytics | brand spine `touch-vodka` confirmed in the warehouse | `agency-ops/analytics/onboarding/touch-vodka.md` |
| **S10** modules | stockist locator + 21+ age-gate | `src/app/find-us/`, `src/app/layout.tsx` |
| **S5** assets | optimized (58%), pruned, next/font, visual tests | `docs/ASSETS.md`, `e2e/` |

## Develop

```bash
pnpm install         # @vinny/* link to the workspace via pnpm.overrides (offline-ok)
pnpm dev             # http://localhost:3000
pnpm typecheck && pnpm lint && pnpm preflight   # the quality floor
pnpm build           # production build (25 routes, products + blog SSG)
pnpm test            # Playwright smoke · a11y · visual (CI commits baselines)
```

Copy `.env.example` → `.env.local`. The site renders from local seeds
(`src/data/*`) until the shared Strapi content + tokens are provisioned (S6).

## Pending (external — see ONBOARDING completion log)
Create/transfer the repo to **GENIEMARKETING** + reconnect Amplify (S2); import
content + mint `TOUCH_VODKA_API_TOKEN` + add the Stockist type (S6, on prod up);
fill `dim_brand` channel ids + activate the n8n flows (S8/S9, pending creds).
