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
- ✅ Verified `@geniemarketing/foundation` + `@geniemarketing/ui` build + `npm pack` clean (publish-ready).

## The gate (why it's not live yet) — UPDATED 2026-06-09
Resolving the `@geniemarketing/*` deps for a standalone Amplify build turned out to be a chain of
blockers, ending in an S4-owned release. The Packages PAT is done (`~/.npmrc`); the rest:
1. **`@geniemarketing` scope can't publish to GitHub Packages.** GH Packages namespaces npm by
   `@scope == owner`; there is no `vinny` org (`@geniemarketing%2ffoundation` → `403 create_package`).
   **Decision (Vinny): rename the scope to `@geniemarketing/*`.**
2. **The rename can't be done in-place now.** `vinny-platform` is checked out on
   `s10-landing-modules` and dirty with S10's live WIP (incl. `foundation`/`ui` package.json +
   `pnpm-lock.yaml`) — renaming + `pnpm install` there would clobber S10 (shared-tree race).
3. **There is no canonical `ui` to publish.** `main`'s `@geniemarketing/ui` is a **stub**
   (`0.0.0`, `private:true`); the real `0.1.0` `ui` exists only in S10's *uncommitted* tree.
   Publishing it = releasing S4's package → **S4 must cut the release.**
   **Decision (Vinny): wait for S4 to release.**

➡️ **This deploy is now gated on the S4 handoff** ("Release `@geniemarketing/foundation` +
`@geniemarketing/ui` to GitHub Packages") in `sessions/HANDOFFS.md`. Steps 1–3 below run
**after** S4 publishes those two packages.

## Step 1 — (DONE) Packages PAT
A `write:packages` PAT (vinnyfds) is in `~/.npmrc` (`//npm.pkg.github.com/:_authToken=…`).
S4 can reuse it (verify vinnyfds has org package-create in `GENIEMARKETING`) or use its own.

## Step 2 — (S4) Publish the renamed packages
S4 releases `@geniemarketing/foundation@0.1.0` + `@geniemarketing/ui@0.1.0` to
`npm.pkg.github.com` from a clean tree (canonical `ui`, not S10's WIP). Verify:
`gh api '/orgs/GENIEMARKETING/packages?package_type=npm' --jq '.[].name'` lists both.

## Step 3 — Rewire + finalize the deploy branch  *(S2/operator, once Step 2 is live)*
On `next-rebuild`, point touchvodka at the published org-scoped packages:
```bash
# 1. Rename imports + deps across the repo (20 files): @geniemarketing/  ->  @geniemarketing/
#    - src/**/*.ts(x): import paths   - package.json: @geniemarketing/foundation,@geniemarketing/ui -> @geniemarketing/*
#    - .npmrc: @geniemarketing:registry=…      ->  @geniemarketing:registry=https://npm.pkg.github.com
# 2. Remove the LOCAL-ONLY override block from package.json:
#      "pnpm": { "overrides": { "@geniemarketing/foundation": "link:…", "@geniemarketing/ui": "link:…" } }
# 3. Regenerate the lockfile against the registry (NODE_AUTH_TOKEN from ~/.npmrc):
pnpm install        # rewrites pnpm-lock.yaml from npm.pkg.github.com
pnpm build          # confirm a clean standalone build
git commit -am "deploy: consume @geniemarketing/* from GitHub Packages (drop link overrides)"
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
- Capture any publish/connection gotcha into `mistakes-registry/` (esp. the `@geniemarketing` scope-vs-org
  publish snag and the Amplify GitHub-App-vs-access-token connection).
