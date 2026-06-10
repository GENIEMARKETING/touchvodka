# Wave 2 — consolidated operator pass (touchvodka)

> **Why this file exists:** S6/S3, S5, S9, S10 each need to set env vars on the **same** Amplify app
> `touchvodka-next` (`d1yhwh9axgn9ty`), and `aws amplify update-app --environment-variables` **REPLACES
> the entire map**. If each session runs its own `update-app`, the last one wins and wipes the others.
> So all env goes in **ONE merged `update-app`**, built from the per-session runbooks below.
> **Prereq met:** `@geniemarketing/foundation@0.2.1` published 2026-06-09 (build gate cleared).
> **Runs as:** an operator / infra-capable session (needs SOPS age key + box SSH + Amplify write).

## Order of operations
1. **Produce the values that come from steps** (do before the env update):
   - **S6/S3** (`S6S3-WAVE2-RUNBOOK.md`): on the box run the Medusa import → prints `MEDUSA_SALES_CHANNEL_ID`, `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY`, `NEXT_PUBLIC_MEDUSA_REGION_ID`. Get `STRAPI_API_TOKEN` from `/opt/agency-infra/.touch-vodka-token` (or SOPS).
   - **S9** (`S9-WAVE2G-VERIFY-RUNBOOK.md`): `WRITE_KEY_TOUCH` from SOPS (`sops -d infrastructure/security/secrets.prod.enc.env | grep WRITE_KEY_TOUCH`).
   - **S8** (`S8-CUTOVER-CHECKLIST.md`): `LEAD_WEBHOOK_SECRET`, `SMTP2GO_SMTP_USER/PASSWORD` from SOPS. (Turnstile = Cloudflare TEST keys, external deferred.)
   - **S5** (`S5-WAVE2J-MEDIA-RUNBOOK.md`): decide `NEXT_PUBLIC_MEDIA_BASE` (Strapi/S3 base until edge/imgproxy lands).
2. **Apply the ONE merged env map** (below) → `aws amplify update-app … --environment-variables {…}`.
3. **Trigger a redeploy** of branch `next-rebuild` (or push the committed Wave-2 WIP) and confirm build green.
4. **Non-env live steps** (independent, after deploy): S6/S3 register the Strapi ISR webhook; S5 upload media → `git rm` binaries; S8 growth bootstrap on the box (Twenty owner+token, `mautic-bootstrap`, `n8n-import`+activate).
5. **Per-session e2e verify** → flip each §6 cell ✅ in `sessions/TOUCHVODKA-GOLIVE.md`.

## The merged Amplify env map (app `d1yhwh9axgn9ty`) — set ALL of these in one update
| Key | Value / source | Owner |
|---|---|---|
| `NODE_AUTH_TOKEN` | GH Packages **read** PAT (Amplify pulls `@geniemarketing/*`) | S2 (existing) |
| `SITE_KEY` | `touch-vodka` | existing |
| `NEXT_PUBLIC_SITE_KEY` | `touch-vodka` | existing |
| `NEXT_PUBLIC_STRAPI_URL` | `https://marketing.fatdogspirits.com` | existing |
| `REVALIDATION_SECRET` | (already set on app) | existing |
| `STRAPI_API_TOKEN` | box `/opt/agency-infra/.touch-vodka-token` | **S6/S3** |
| `MEDUSA_SALES_CHANNEL_ID` | Medusa import output | **S6/S3** |
| `NEXT_PUBLIC_MEDUSA_URL` | `https://shop-api.fatdogspirits.com` | **S6/S3** |
| `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` | Medusa import output | **S6/S3 → S10** |
| `NEXT_PUBLIC_MEDUSA_REGION_ID` | Medusa import output | **S6/S3 → S10** |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe **TEST** `pk_test_…` | **S10** |
| `NEXT_PUBLIC_MEDIA_BASE` | Strapi/S3 media base (edge `img.` later) | **S5** |
| `NEXT_PUBLIC_RUDDERSTACK_WRITE_KEY` | SOPS `WRITE_KEY_TOUCH` | **S9** |
| `NEXT_PUBLIC_RUDDERSTACK_DATAPLANE` | `https://events.fatdogspirits.com` | **S9** |
| `LEAD_WEBHOOK_URL` | `https://n8n.fatdogspirits.com/webhook/lead` | **S8** |
| `LEAD_WEBHOOK_SECRET` | SOPS | **S8** |
| `EMAIL_PROVIDER` | `smtp2go` | **S8** |
| `SMTP2GO_SMTP_HOST` | `mail.smtp2go.com` | **S8** |
| `SMTP2GO_SMTP_PORT` | `587` | **S8** |
| `SMTP2GO_SMTP_USER` | SOPS `SMTP2GO_SMTP_USER` | **S8** |
| `SMTP2GO_SMTP_PASSWORD` | SOPS `SMTP2GO_SMTP_PASSWORD` | **S8** |
| `CONTACT_RECIPIENT_EMAIL` | brand inbox | **S8** |
| `OFFICE365_EMAIL` / `OFFICE365_APP_PASSWORD` | fallback sender (keep existing) | S8 |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare **TEST** site key (`1x000…AA`) | S8 (external deferred) |
| `TURNSTILE_SECRET` | Cloudflare **TEST** secret (`1x000…AA`) | S8 (external deferred) |
| `NEXT_PUBLIC_POSTHOG_KEY` / `_HOST` / `NEXT_PUBLIC_GA_ID` | leave unset/empty (no-op; CDP is the analytics path) | — |

**Critical:** `update-app` replaces the map → **read the current env first, merge, then write the full set** (don't drop the 5 existing keys). The non-`NEXT_PUBLIC_*` keys (`STRAPI_API_TOKEN`, `LEAD_*`, `TURNSTILE_SECRET`, `SMTP2GO_*`) only reach the WEB_COMPUTE runtime because `next.config.ts` `env{}` forwards them (rule `amplify-nextconfig-env`) — verified present.

## Detailed steps live in (do not duplicate — execute these)
- `S6S3-WAVE2-RUNBOOK.md` — Strapi token + Medusa import + ISR webhook
- `S9-WAVE2G-VERIFY-RUNBOOK.md` — RudderStack write key + consented-event→Metabase e2e
- `S10-COMMERCE-RUNBOOK.md` — Stripe-TEST checkout e2e
- `S5-WAVE2J-MEDIA-RUNBOOK.md` — media → Strapi-S3/CDN + git-trim
- `S8-CUTOVER-CHECKLIST.md` — growth bootstrap + lead/email e2e

## Then → Wave 3 (`sessions/TOUCHVODKA-GOLIVE.md` §WAVE 3) → emit `TOUCHVODKA LIVE`.
