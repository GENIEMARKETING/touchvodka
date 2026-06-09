# touchvodka — S8 leads + email live-wiring checklist

**Status: BLOCKED on infra + creds (verified 2026-06-08).** The site code and the
4 n8n flows are built, validated, and consistent — but the services are **not
deployed** and the S8 credentials are **not provisioned**. This checklist makes
the live pass a single sitting once both clear.

## Why it's blocked (the gate, re-checkable)

| Check | Result |
|---|---|
| `https://n8n.vinny.agency/` | `000` — no DNS/connection (not deployed) |
| `https://postal.vinny.agency/` | `000` — not deployed |
| `https://marketing.fatdogspirits.com/` (Strapi) | `000` — not deployed |
| `https://t.vinny.agency/` (PostHog) | `000` — not deployed |
| `crm.fatdogspirits.com` / `m.fatdogspirits.com` | `404` — DNS only, no Twenty/Mautic service |
| `secrets.prod.enc.env` keys | only base Strapi/Medusa/Postgres/AWS/Stripe — **zero** S8 keys |

Root cause: the shared-infra **OpenTofu apply is paused for cost approval** and
the `geniemarketing` profile isn't configured on this machine
(`infrastructure/cms/onboarding/touch-vodka.md`). Until the apply runs, nothing
S8 needs exists to wire against.

## Prerequisite 1 — services must be UP (S6 + Vinny)

- [ ] OpenTofu apply approved + run → the shared plane is live.
- [ ] **Twenty** reachable (`crm.fatdogspirits.com` serves the app, not a 404) +
      schema bootstrapped (`infrastructure/services/twenty/bootstrap-schema.sh`)
      so the `brand`/`source`/`consent*`/`doiStatus`/`mauticContactId` fields exist.
- [ ] **Mautic** reachable (`m.fatdogspirits.com`) + API/Basic-Auth enabled +
      segment `brand-touch-vodka-leads` created + the drip campaign + scoring
      (`infrastructure/services/mautic/campaigns.md`).
- [ ] **Postal** reachable on the **off-AWS port-25 box** + a mail server created
      for the sending domain.
- [ ] **n8n** reachable (`n8n.vinny.agency`).

## Prerequisite 2 — credentials must exist (Vinny → SOPS secret set)

Provision and add to the prod secret set (none are present today):

- [ ] `TWENTY_API_TOKEN` (mint in Twenty → Settings → APIs; read/write People,
      Companies, Opportunities)
- [ ] `MAUTIC_API_USER` + `MAUTIC_API_PASSWORD`
- [ ] `POSTAL_API_KEY` + `POSTAL_API_URL` (e.g. `https://postal.vinny.agency/api/v1`)
- [ ] `POSTAL_SMTP_HOST` / `POSTAL_SMTP_PORT` / `POSTAL_SMTP_USER` / `POSTAL_SMTP_PASSWORD`
      (for Mautic + Twenty relay)
- [ ] `LEAD_WEBHOOK_SECRET` (`openssl rand -base64 32`) — shared site↔n8n
- [ ] `DOI_SECRET` (`openssl rand -base64 32`) — HMAC for the opt-in token
- [ ] `MAUTIC_SEGMENT_TOUCH_VODKA` — the numeric segment id (note: env key is
      **upper-snake**, hyphens not allowed; the doi-confirm flow normalizes the
      slug to this)
- [ ] `SLACK_WEBHOOK_URL` (or Telegram) for new-lead notifications
- [ ] **Cloudflare Turnstile** site key + `TURNSTILE_SECRET` for touchvodka.com
- [ ] Sending-domain **SPF / DKIM / DMARC** published + verified in Postal
      (`infrastructure/services/email/dns/`)

## The live pass (once both prereqs clear) — one sitting

1. **n8n flows** — import the 4 `infrastructure/services/n8n/flows/*.json`
   (or rebuild via the n8n MCP → `validate_workflow` → `create_workflow_from_code`).
   Bind credentials (Twenty Bearer, Mautic Basic, Postal API). Set env:
   `TWENTY_API_URL`, `MAUTIC_API_URL`, `POSTAL_API_URL`, `POSTAL_API_KEY`,
   `LEAD_WEBHOOK_SECRET`, `DOI_SECRET`, `SLACK_WEBHOOK_URL`, `SITE_BASE_URL`,
   `MAUTIC_SEGMENT_TOUCH_VODKA`. **Activate** `/webhook/lead` + `/webhook/doi/confirm`.
2. **touchvodka Amplify env** (the site already reads these — see `.env.example`):
   - `LEAD_WEBHOOK_URL=https://n8n.vinny.agency/webhook/lead`
   - `LEAD_WEBHOOK_SECRET=<same as n8n>`
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY=…`, `TURNSTILE_SECRET=…`
   - `POSTAL_API_URL=…`, `POSTAL_API_KEY=…`
   - `EMAIL_PROVIDER=office365`  ← **keep legacy live first** (see cutover below)
   - `CONTACT_RECIPIENT_EMAIL=info@touchvodka.com`
   - `OFFICE365_EMAIL` / `OFFICE365_APP_PASSWORD` (legacy, kept until verified)
3. **Verify end-to-end** (don't mark ✅ until all pass):
   - Submit a real lead from the rebuilt **/find-us** form →
     - lands in **Twenty** as a Person, `brand=touch-vodka`, consent stamped
       (`consentMarketing`, `consentTimestamp`, `consentSource`), `doiStatus=pending`.
     - lands in **Mautic** (`unconfirmed` until opt-in; then `brand-touch-vodka-leads`).
   - **Double-opt-in** email delivers via Postal; clicking confirm flips
     `doiStatus=confirmed` and starts the drip.
   - One **transactional** email (contact-form reply) delivers via Postal with
     **SPF/DKIM/DMARC pass** (check headers / mail-tester).
   - **Honeypot** filled → silently dropped (200, no CRM write).
   - **Turnstile** failing token → 400, no CRM write.
4. **Email cutover (only after Postal verified delivering):**
   - Flip touchvodka `EMAIL_PROVIDER=postal`.
   - Re-send a contact-form test → confirm `via: postal` in the response + inbox.
   - Then retire the legacy fallback: remove `OFFICE365_*` and the
     `sendViaOffice365` fallback from `src/lib/email.ts`, drop `/api/contact`'s
     legacy note. Document the cutover date in `LEARNINGS.md`.
5. **Onboarding status:** flip touchvodka **Leads/Email (S8)** to ✅ in
   `sessions/ONBOARDING.md` **only** after step 3 passes end-to-end; append a
   dated completion-log line.

## Already done (this pass, no live deps)

- ✅ Site handlers match the contract: `/api/lead` (validate → honeypot →
  Turnstile → `x-lead-secret` → 202 fire-and-forget), `/api/contact` (legacy kept
  live), `src/lib/email.ts` (Postal-primary + Office365 fallback, cutover-guarded).
- ✅ 4 n8n flows validated: parse, connection integrity, reachability, consent-IF
  gate present, node types confirmed via the n8n MCP. **Fixed 2 bugs** (see
  LEARNINGS): missing Twenty link-back node; invalid hyphenated env-var segment key.
- ✅ Brand slug `touch-vodka` consistent across foundation `LEAD_BRANDS`, Twenty
  schema, Mautic segment pattern, site `SITE_KEY`, CMS `client`.
