# touchvodka — S8 leads + email live-wiring checklist

**Status: UNBLOCKED — gates fired; now an operator bootstrap pass (re-verified 2026-06-09).**
All four S8 gates are LIVE (`growth up`, `email up`, `FLEET UP`, `TV-NEXT DEPLOYED`),
the boxes serve, and the site code + 4 n8n flows are built/validated. What remains
is the **growth app-bootstrap on the box** (Twenty owner + token → Mautic API user +
`make mautic-bootstrap` → `make n8n-import` + bind creds + activate), which needs the
SOPS age key + box shell + interactive UI logins — not doable from the authoring env.

## Gate re-check (probed 2026-06-09 — was 000/404 on 2026-06-08)

| Check | Result (2026-06-09) |
|---|---|
| `https://n8n.fatdogspirits.com/healthz` | **200** `{"status":"ok"}` — live (host is `*.fatdogspirits.com`, not the old `*.vinny.agency`) |
| `https://crm.fatdogspirits.com/healthz` (Twenty) | **200** `{"status":"ok"}` — live |
| `https://m.fatdogspirits.com/` (Mautic) | **302 → /s/dashboard** — installed + serving (was 404) |
| `POST https://n8n.fatdogspirits.com/webhook/lead` | **404** — expected; **flows not imported yet** (this pass) |
| SMTP2GO sending domains + `SMTP2GO_SMTP_*` in SOPS | ✅ per `email up` (5 domains verified, test mail delivered) |

**Why the authoring env can't run the bootstrap (the real, structural blockers):**
1. **No `SOPS_AGE_KEY`** here → `make {growth-secrets,twenty-bootstrap,mautic-bootstrap}`
   can't decrypt `security/secrets.prod.enc.env` → `compose/.env.growth`.
2. **`make n8n-import` is `docker compose -p agency-growth exec n8n …`** — it targets the
   n8n container on the **growth box's** Docker daemon, not this machine's. Must run on the box.
3. **Twenty owner + API token** and **Mautic API user** are interactive first-run UI steps;
   their resulting creds (`TWENTY_API_TOKEN`, `MAUTIC_API_USER`) are **not yet in SOPS**.

⚠️ **Bug to fix before the pass (else it fails mid-bootstrap):** `make mautic-bootstrap` sources
`.env.growth` then runs `bootstrap-mautic.sh`, which hard-requires `MAUTIC_API_URL` **and**
`MAUTIC_API_USER` (`:?` guards). The repo's encrypted set has `MAUTIC_API_PASSWORD` but **not**
`MAUTIC_API_URL`/`MAUTIC_API_USER` (nor `TWENTY_API_URL` for `twenty-bootstrap`). Add those keys
to SOPS first (values in `infrastructure/security/secrets.growth.env.example`:
`MAUTIC_API_URL=https://m.fatdogspirits.com`, `TWENTY_API_URL=https://crm.fatdogspirits.com`,
`MAUTIC_API_USER=<admin login>`), **or** export them inline before the script. Likewise the n8n
flows still need `SLACK_WEBHOOK_URL` + touchvodka `TURNSTILE_*` (test keys OK).

## Operator bootstrap runbook (run on `agency-growth` — single sitting)

```bash
cd infrastructure
# 0. PREREQ — add the not-yet-present keys to SOPS, then materialize env:
#    MAUTIC_API_USER (manual), MAUTIC_API_URL, TWENTY_API_URL, SLACK_WEBHOOK_URL (manual),
#    NEXT_PUBLIC_TURNSTILE_SITE_KEY/TURNSTILE_SECRET (touchvodka, test keys OK).
sops security/secrets.prod.enc.env        # add the above; save
make growth-secrets                       # sops -d → compose/.env.growth

# 1. TWENTY — UI: create the first (owner) user at https://crm.fatdogspirits.com,
#    Settings → APIs → mint a read/write token. Paste into SOPS as TWENTY_API_TOKEN,
#    re-run `make growth-secrets`, then:
make twenty-bootstrap                      # brand/source/consent*/doiStatus/mauticContactId fields

# 2. MAUTIC — UI: Configuration → API Settings → enable API + "Enable HTTP basic auth".
make mautic-bootstrap                      # fields + per-brand segments + positive scoring
#    Copy the printed `brand-touch-vodka-leads` id → SOPS as MAUTIC_SEGMENT_TOUCH_VODKA.
#    Build the "TOFU → Intent" drip + remaining scoring in the UI per services/mautic/campaigns.md.

# 3. n8n — import + wire (MUST run on the box):
make n8n-import                            # imports the 4 flows (active:false)
#    UI: create + bind credentials — Twenty bearer, Mautic basic, and an SMTP cred named
#    "SMTP2GO" (mail.smtp2go.com:587, STARTTLS, minted user/pass) re-picked on the two emailSend
#    nodes. Set flow env (TWENTY_API_URL, MAUTIC_API_URL, LEAD_WEBHOOK_SECRET, DOI_SECRET,
#    SLACK_WEBHOOK_URL, SITE_BASE_URL, MAUTIC_SEGMENT_TOUCH_VODKA). ACTIVATE all 4.
#    Verify: `POST /webhook/lead` now returns 401-without-secret (NOT 404).
```

## Prerequisite 1 — services must be UP (S6 + Vinny)

- [ ] OpenTofu apply approved + run → the shared plane is live.
- [ ] **Twenty** reachable (`crm.fatdogspirits.com` serves the app, not a 404) +
      schema bootstrapped (`infrastructure/services/twenty/bootstrap-schema.sh`)
      so the `brand`/`source`/`consent*`/`doiStatus`/`mauticContactId` fields exist.
- [ ] **Mautic** reachable (`m.fatdogspirits.com`) + API/Basic-Auth enabled +
      segment `brand-touch-vodka-leads` created + the drip campaign + scoring
      (`infrastructure/services/mautic/campaigns.md`).
- [ ] **SMTP2GO** sending domain (`touchvodka.com` / `mail.touchvodka.com`)
      **added + verified** (SPF `include:spf.smtp2go.com` + DKIM/return-path
      CNAMEs green) — hosted relay, no box to stand up.
- [ ] **n8n** reachable (`n8n.fatdogspirits.com`).

## Prerequisite 2 — credentials must exist (Vinny → SOPS secret set)

Provision and add to the prod secret set (none are present today):

- [ ] `TWENTY_API_TOKEN` (mint in Twenty → Settings → APIs; read/write People,
      Companies, Opportunities)
- [ ] `MAUTIC_API_USER` + `MAUTIC_API_PASSWORD`
- [ ] `SMTP2GO_SMTP_HOST` (`mail.smtp2go.com`) / `SMTP2GO_SMTP_PORT` (`587`) /
      `SMTP2GO_SMTP_USER` / `SMTP2GO_SMTP_PASSWORD` (mint an SMTP user in SMTP2GO —
      shared by Mautic + Twenty + n8n + the site)
- [ ] `SMTP2GO_API_KEY` (optional — only if any sender uses the HTTP API path)
- [ ] `LEAD_WEBHOOK_SECRET` (`openssl rand -base64 32`) — shared site↔n8n
- [ ] `DOI_SECRET` (`openssl rand -base64 32`) — HMAC for the opt-in token
- [ ] `MAUTIC_SEGMENT_TOUCH_VODKA` — the numeric segment id (note: env key is
      **upper-snake**, hyphens not allowed; the doi-confirm flow normalizes the
      slug to this)
- [ ] `SLACK_WEBHOOK_URL` (or Telegram) for new-lead notifications
- [ ] **Cloudflare Turnstile** site key + `TURNSTILE_SECRET` for touchvodka.com
- [ ] Sending-domain **SPF / DKIM / DMARC** published + verified in SMTP2GO
      (`infrastructure/services/email/dns/`)

## The live pass (once both prereqs clear) — one sitting

1. **n8n flows** — import the 4 `infrastructure/services/n8n/flows/*.json`
   (or rebuild via the n8n MCP → `validate_workflow` → `create_workflow_from_code`).
   Bind credentials (Twenty Bearer, Mautic Basic, and an **SMTP credential named
   `SMTP2GO`** → `mail.smtp2go.com:587`, STARTTLS, the minted SMTP user/pass — bound
   on the two `Send …` emailSend nodes). Set env: `TWENTY_API_URL`, `MAUTIC_API_URL`,
   `LEAD_WEBHOOK_SECRET`, `DOI_SECRET`, `SLACK_WEBHOOK_URL`, `SITE_BASE_URL`,
   `MAUTIC_SEGMENT_TOUCH_VODKA`. **Activate** `/webhook/lead` + `/webhook/doi/confirm`.
2. **touchvodka Amplify env** (the site reads these; they're also forwarded in
   `next.config.ts` `env{}` per `amplify-nextconfig-env`):
   - `LEAD_WEBHOOK_URL=https://n8n.fatdogspirits.com/webhook/lead`
   - `LEAD_WEBHOOK_SECRET=<same as n8n>`
   - `NEXT_PUBLIC_TURNSTILE_SITE_KEY=…`, `TURNSTILE_SECRET=…`
   - `SMTP2GO_SMTP_HOST=mail.smtp2go.com`, `SMTP2GO_SMTP_PORT=587`,
     `SMTP2GO_SMTP_USER=…`, `SMTP2GO_SMTP_PASSWORD=…`
   - `EMAIL_PROVIDER=office365`  ← **keep legacy live first** (see cutover below)
   - `CONTACT_RECIPIENT_EMAIL=info@touchvodka.com`
   - `OFFICE365_EMAIL` / `OFFICE365_APP_PASSWORD` (legacy, kept until verified)
3. **Verify end-to-end** (don't mark ✅ until all pass):
   - Submit a real lead from the rebuilt **/find-us** form →
     - lands in **Twenty** as a Person, `brand=touch-vodka`, consent stamped
       (`consentMarketing`, `consentTimestamp`, `consentSource`), `doiStatus=pending`.
     - lands in **Mautic** (`unconfirmed` until opt-in; then `brand-touch-vodka-leads`).
   - **Double-opt-in** email delivers via SMTP2GO; clicking confirm flips
     `doiStatus=confirmed` and starts the drip.
   - One **transactional** email (contact-form reply) delivers via SMTP2GO with
     **SPF/DKIM/DMARC pass** (check headers / mail-tester + the SMTP2GO activity log).
   - **Honeypot** filled → silently dropped (200, no CRM write).
   - **Turnstile** failing token → 400, no CRM write.
4. **Email cutover (only after SMTP2GO verified delivering):**
   - Flip touchvodka `EMAIL_PROVIDER=smtp2go`.
   - Re-send a contact-form test → confirm `via: smtp2go` in the response + inbox.
   - Then retire the legacy fallback: remove `OFFICE365_*` and the
     `sendViaOffice365` fallback from `src/lib/email.ts`, drop `/api/contact`'s
     legacy note. Document the cutover date in `LEARNINGS.md`.
5. **Onboarding status:** flip touchvodka **Leads/Email (S8)** to ✅ in
   `sessions/ONBOARDING.md` **only** after step 3 passes end-to-end; append a
   dated completion-log line.

## Already done (this pass, no live deps)

- ✅ Site handlers match the contract: `/api/lead` (validate → honeypot →
  Turnstile → `x-lead-secret` → 202 fire-and-forget), `/api/contact` (legacy kept
  live), `src/lib/email.ts` (SMTP2GO-primary + Office365 fallback, cutover-guarded).
- ✅ 4 n8n flows validated: parse, connection integrity, reachability, consent-IF
  gate present, node types confirmed via the n8n MCP. **Fixed 2 bugs** (see
  LEARNINGS): missing Twenty link-back node; invalid hyphenated env-var segment key.
- ✅ Brand slug `touch-vodka` consistent across foundation `LEAD_BRANDS`, Twenty
  schema, Mautic segment pattern, site `SITE_KEY`, CMS `client`.
