# Touch Vodka — WEB_COMPUTE deploy runbook (Wave 1·C / S2-Deploy)

Finish-line steps to fire **`TV-NEXT DEPLOYED`**. Everything reversible/non-disruptive
is already done (see "Status" below); the rest is gated on **one credential** + a
one-time Amplify GitHub-App authorization.

## Status (done — live `touchvodka.com` untouched)
- ✅ Old Vite tree preserved → tag **`legacy/vite`** (`781f41f`) on `GENIEMARKETING/touchvodka`.
- ✅ Rebuild committed + pushed to branch **`next-rebuild`** (NOT `master`; old WEB app has
  `autoBranchCreation=false`, so no deploy was triggered — the live site is unchanged).
- ✅ Added **`src/app/api/revalidate/route.ts`** (secret-gated Strapi ISR webhook target) +
  `REVALIDATION_SECRET` in `.env.example`. Typecheck green.
- ✅ Added **`amplify.yml`** (pnpm + WEB_COMPUTE build spec).
- ✅ Verified `@vinny/foundation` + `@vinny/ui` build + `npm pack` clean (publish-ready).

## The gate (why it's not live yet)
1. **`@vinny/*` are unpublished.** The build resolves them from GitHub Packages
   (`.npmrc` → `npm.pkg.github.com`), but nothing is published; local dev only works via
   the `pnpm.overrides` `link:` to `vinny-platform/`. A standalone Amplify checkout has
   neither → `pnpm install` fails. **Decision (Vinny, 2026-06-09): publish to GitHub Packages.**
2. **No token has Packages scope.** The only GitHub token here is `gist/read:org/repo/workflow`
   — no `write:packages` (publish) or `read:packages` (Amplify install). Needs a new PAT.

---

## Step 1 — Mint the token  *(Vinny — one action)*
Create a PAT (classic) or fine-grained token on `GENIEMARKETING` with **`write:packages`** +
**`read:packages`** (fine-grained: Packages → Read **and** Write). Export it:
```bash
export NODE_AUTH_TOKEN=<the-new-PAT>
```

## Step 2 — Publish the two packages  *(operator)*
```bash
cd vinny-platform/packages/foundation && pnpm build && npm publish        # @vinny/foundation@0.1.0
cd ../ui                              && pnpm build && npm publish         # @vinny/ui@0.1.0
```
- The packages already carry `publishConfig.registry=npm.pkg.github.com` + `private:false` +
  the `repository` link to `GENIEMARKETING/vinny-platform`, so they associate with the org.
- ⚠️ If GitHub rejects the `@vinny` scope ("scope must match owner"), publish under the org
  scope (`@geniemarketing/*`) OR add an org-level scope mapping; then keep the consumer
  `.npmrc`/imports consistent. (Surface this; it's the most likely publish-time snag.)
- Verify: `gh api /orgs/GENIEMARKETING/packages?package_type=npm --jq '.[].name'` lists both.

## Step 3 — Finalize the deploy branch  *(operator)*
On `next-rebuild`, make the repo standalone-installable:
```bash
# 1. Remove the LOCAL-ONLY workspace override block from package.json:
#      "pnpm": { "overrides": { "@vinny/foundation": "link:…", "@vinny/ui": "link:…" } }
#    (Pin @vinny/foundation + @vinny/ui to the published 0.1.0 in dependencies — already ^0.1.0.)
# 2. Regenerate the lockfile against the registry (needs read:packages in NODE_AUTH_TOKEN):
NODE_AUTH_TOKEN=$NODE_AUTH_TOKEN pnpm install        # rewrites pnpm-lock.yaml from npm.pkg.github.com
pnpm build                                            # confirm a clean standalone build
git commit -am "deploy: resolve @vinny/* from GitHub Packages (drop local link overrides)"
git push origin next-rebuild
```

## Step 4 — Create the WEB_COMPUTE app  *(operator — staged, per the migration playbook)*
Do NOT flip the old WEB app. Create a NEW app so we validate before cutover.
```bash
aws amplify create-app \
  --name touchvodka-next \
  --platform WEB_COMPUTE \
  --repository https://github.com/GENIEMARKETING/touchvodka \
  --access-token "$(gh auth token)"   # repo-scoped token works for the connection
# then the production branch:
aws amplify create-branch --app-id <NEW_ID> --branch-name next-rebuild --stage PRODUCTION
aws amplify start-job --app-id <NEW_ID> --branch-name next-rebuild --job-type RELEASE
```
- If the `--access-token` connection is refused, install/authorize the **Amplify GitHub App**
  on `GENIEMARKETING/touchvodka` once in the console, then create the app pointed at it
  (`tiered-backend-and-amplify-migration` playbook: recreate via the GitHub App).
- Set env vars on the new app (`aws amplify update-app --environment-variables ...`):
  `NODE_AUTH_TOKEN` (read:packages), `SITE_KEY=touch-vodka`, `NEXT_PUBLIC_SITE_KEY=touch-vodka`,
  `NEXT_PUBLIC_STRAPI_URL=https://marketing.fatdogspirits.com`, `REVALIDATION_SECRET=<openssl rand -base64 32>`.
  (Strapi token + Medusa keys are S6/S3's Wave-2 step — not required to go live.)

## Step 5 — Validate on the amplifyapp.com URL  *(operator)*
- Build SUCCEEDs; `https://<branch>.<NEW_ID>.amplifyapp.com/` renders the rebuild (seed
  fallback is fine pre-CMS-wire).
- `curl -s -o /dev/null -w '%{http_code}' '.../api/revalidate'` → **401** (secret-gated, route exists).
- `curl '.../api/revalidate?secret=<REVALIDATION_SECRET>' -X POST -d '{}'` → `{"revalidated":true,...}`.

## Step 6 — Cut the domain over  *(operator — the only live-affecting step)*
```bash
# detach touchvodka.com (+ www) from the OLD app, attach to the NEW app:
aws amplify create-domain-association --app-id <NEW_ID> --domain-name touchvodka.com \
  --sub-domain-settings prefix=www,branchName=next-rebuild prefix='',branchName=next-rebuild
# (delete the old app's association first or move it; DNS/cert revalidates — brief.)
```
- Confirm `https://touchvodka.com` serves the rebuild; retire/rename the old WEB app
  (`de6hwz32cs5jq`) once green. Promote `next-rebuild`→`master` (or set master as production)
  so the canonical branch matches.

## Step 7 — Close  *(operator)*
- Register the Strapi ISR webhook → `https://touchvodka.com/api/revalidate?secret=<REVALIDATION_SECRET>`
  (this is also referenced in the S6/S3 Wave-2 cutover).
- **Emit `TV-NEXT DEPLOYED`** in `TOUCHVODKA-GOLIVE.md` §5; flip §6 "Wave 1: tv-next deployed" ✅; log §7.
- Capture any publish/connection gotcha into `mistakes-registry/` (esp. the `@vinny` scope-vs-org
  publish snag and the Amplify GitHub-App-vs-access-token connection).
