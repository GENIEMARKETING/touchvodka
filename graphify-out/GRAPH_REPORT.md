# Graph Report - touchvodka-next  (2026-06-10)

## Corpus Check
- 92 files · ~34,284 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 577 nodes · 695 edges · 50 communities (36 shown, 14 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 3 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `e0faad25`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]

## God Nodes (most connected - your core abstractions)
1. `Learnings — Touch Vodka rebuild (T25 onboarding pilot)` - 18 edges
2. `compilerOptions` - 17 edges
3. `attributes` - 12 edges
4. `Cheap Vodka: Finding Quality Budget-Friendly Spirits Without Sacrificing Taste` - 12 edges
5. `useCart()` - 11 edges
6. `mediaUrl()` - 11 edges
7. `PageHero()` - 10 edges
8. `Touch Vodka — WEB_COMPUTE deploy runbook (Wave 1·C / S2-Deploy)` - 10 edges
9. `S9 · Wave 2·G — analytics warehouse verify (operator runbook)` - 10 edges
10. `scripts` - 9 edges

## Surprising Connections (you probably didn't know these)
- `sitemap()` --calls--> `getPostSlugs()`  [EXTRACTED]
  src/app/sitemap.ts → src/lib/blog.ts
- `Home()` --calls--> `getSiteProducts()`  [EXTRACTED]
  src/app/page.tsx → src/lib/strapi.ts
- `generateMetadata()` --calls--> `getProductBySlug()`  [INFERRED]
  src/app/blog/[slug]/page.tsx → src/data/products.ts
- `generateMetadata()` --calls--> `pageMetadata()`  [INFERRED]
  src/app/blog/[slug]/page.tsx → src/lib/seo.ts
- `generateMetadata()` --calls--> `mediaUrl()`  [INFERRED]
  src/app/blog/[slug]/page.tsx → src/lib/media.ts

## Communities (50 total, 14 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (35): Best Uses for Cheap Vodka: Maximizing Value, Can you improve cheap vodka quality at home?, Cheap Vodka: Finding Quality Budget-Friendly Spirits Without Sacrificing Taste, Common Myths About Cheap Vodka Debunked, Corporate Responsibility, Creating Premium-Style Infusions, DIY Filtration Methods, Does cheap vodka give you worse hangovers than expensive vodka? (+27 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (44): required, type, attributes, address, city, country, lat, lng (+36 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (50): Home(), LAST_MODIFIED, sitemap(), AddToCart(), AddToCartProps, inStock(), variantPrice(), getProductBySlug() (+42 more)

### Community 3 - "Community 3"
Cohesion: 0.14
Nodes (14): devDependencies, autoprefixer, @axe-core/playwright, @biomejs/biome, @playwright/test, postcss, tailwindcss, tsx (+6 more)

### Community 4 - "Community 4"
Cohesion: 0.10
Nodes (12): BlogPage(), metadata, metadata, metadata, PageHero(), metadata, Cocktail, COCKTAILS (+4 more)

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+12 more)

### Community 6 - "Community 6"
Cohesion: 0.25
Nodes (6): COLS, CATEGORY_COPY, ConsentBanner(), ConsentBannerProps, ConsentCategoryKey, openConsentPreferences()

### Community 7 - "Community 7"
Cohesion: 0.06
Nodes (33): AgeGate(), AgeGateProps, display, metadata, mono, RootLayout(), metadata, CartButton() (+25 more)

### Community 8 - "Community 8"
Cohesion: 0.16
Nodes (11): FindUsPage(), metadata, DEFAULT_FIELDS, KNOWN_FIELDS, LeadCapture(), LeadCaptureProps, LeadField, getStockists() (+3 more)

### Community 9 - "Community 9"
Cohesion: 0.11
Nodes (18): code:bash (# in the vinny-platform main checkout, auth via ~/.npmrc NOD), code:bash (cd projects/touchvodka-next), code:bash (# on the machine with the age key), code:bash (APP=d1yhwh9axgn9ty), code:sql (SELECT event_type, brand_id, source_id, page_path, consent_c), code:bash (make warehouse-refresh        # populates mart.daily_traffic), code:sql (SELECT date, brand_id, channel, sessions, pageviews), code:sql (SELECT count() AS pre_consent_rows) (+10 more)

### Community 10 - "Community 10"
Cohesion: 0.22
Nodes (8): ci, css, lintMotion(), lintOnly, problems, REQUIRED, root, stripComments()

### Community 11 - "Community 11"
Cohesion: 0.33
Nodes (5): DTC commerce blocks (S10 · Wave 2·H), Files, Live verify, The one seam to fold upstream → S4, Two hard rules

### Community 12 - "Community 12"
Cohesion: 0.33
Nodes (8): escapeHtml(), POST(), EmailMessage, EmailResult, sendEmail(), sendViaOffice365(), sendViaPostal(), sendViaSmtp2go()

### Community 13 - "Community 13"
Cohesion: 0.35
Nodes (5): KEYFRAMES, errors, freezeMotion(), gotoStable(), test

### Community 14 - "Community 14"
Cohesion: 0.05
Nodes (39): dependencies, @geniemarketing/commerce, @geniemarketing/foundation, @geniemarketing/seo, @geniemarketing/ui, gsap, @gsap/react, lucide-react (+31 more)

### Community 15 - "Community 15"
Cohesion: 0.18
Nodes (11): code:bash (pnpm install         # @geniemarketing/* link to the workspa), code:bash (# install a section block (you own + customize the copy)), Compose a page, Develop, First run, Pending (external — see ONBOARDING completion log), The rules (enforced by `pnpm preflight` + CI), Touch Vodka — touchvodka.com (+3 more)

### Community 16 - "Community 16"
Cohesion: 0.29
Nodes (6): Commitment to a Better Future, Join Us, Key Initiatives, Local Community Impact, Our Sustainability Goals, The Water Factor

### Community 17 - "Community 17"
Cohesion: 0.29
Nodes (6): After changing code, Motion rules (enforced by `preflight`), Project instructions, Reuse before you build (GraphRAG loop), Shared, not owned, The contract (do not remove)

### Community 18 - "Community 18"
Cohesion: 0.33
Nodes (5): Building Your Home Bar, Technique Matters, The Cocktail Renaissance, The Four Pillars, The Fundamentals

### Community 19 - "Community 19"
Cohesion: 0.33
Nodes (5): From Grain to Glass, Key Principles, The Distillation Process, The Foundation, Understanding Premium Spirits

### Community 20 - "Community 20"
Cohesion: 0.33
Nodes (5): Assets & media (S5), CDN (S5/T33, gated on S6 "prod up"), Tests, Tiers (per `assets-pipeline/config/clients.json`), What changed in the rebuild

### Community 21 - "Community 21"
Cohesion: 0.29
Nodes (7): 1. `/api/lead` — owned by **S8** (`@geniemarketing/foundation/lead-contract`), 1. `/api/lead` — owned by **S8** (`@geniemarketing/foundation/lead-contract`), 2. `useConsent()` — owned by **S7** (`@geniemarketing/foundation/consent`), 2. `useConsent()` — owned by **S7** (`@geniemarketing/foundation/consent`), 3. PostHog — owned by **S7** (consent-gated loader), code:ts ({), lead-capture — cross-session contracts (S10 ⇄ S7, S8)

### Community 22 - "Community 22"
Cohesion: 0.33
Nodes (5): Apply checklist (S6), code:ts (// lib/stockists.ts (in the consuming app)), code:tsx (const stockists = await getStockists(SITE_KEY);), Fetch helper (consuming app), Strapi "Stockist" content type (Task 23.2)

### Community 23 - "Community 23"
Cohesion: 0.40
Nodes (4): description, extends, packageRules, $schema

### Community 24 - "Community 24"
Cohesion: 0.40
Nodes (4): Boundaries (no overlap), stockist-locator — geo-stack reuse contract (S10 ⇄ S7), What is NOT shared (and why this block renders its own map), What S10 reuses from S7 (verified exports)

### Community 25 - "Community 25"
Cohesion: 0.40
Nodes (4): extends, files, ignore, $schema

### Community 26 - "Community 26"
Cohesion: 0.09
Nodes (21): A "milestone emitted" flag ≠ the service is actually deployed/reachable, Biome `noCommentText` trips on literal `//` in JSX, brand_id slug must match across all systems, code:block1 (## <short title>), Commerce blocks are coupled to Medusa, Confirmed working (not mistakes — the runbook paying off), Footer block and Button block disagree on `--brand-fg`, Learnings (+13 more)

### Community 35 - "Community 35"
Cohesion: 0.14
Nodes (16): code:bash (cd "WEBSITES/assets-pipeline"), code:bash (# real key is the claude-agency-infra IAM user (verified lis), code:block3 (NEXT_PUBLIC_MEDIA_BASE = https://vinny-agency-media.s3.amazo), code:bash (aws amplify update-app --app-id d1yhwh9axgn9ty --environment), code:bash (# 200 from the base host (Route B path, or a Strapi media UR), code:bash (curl -sSI "https://img.fatdogspirits.com/touch-vodka/product), code:bash (cd projects/touchvodka-next), code:bash (CI=1 pnpm test:update     # regenerates e2e/__screenshots__ ) (+8 more)

### Community 44 - "Community 44"
Cohesion: 0.14
Nodes (13): code:bash (# 1. Rename imports + deps across the repo (20 files): @geni), code:bash (aws amplify create-app \), code:bash (# detach touchvodka.com (+ www) from the OLD app, attach to ), Status (done — live `touchvodka.com` untouched), Step 1 — (DONE) Packages PAT, Step 2 — (S4) Publish the renamed packages, Step 3 — Rewire + finalize the deploy branch  *(S2/operator, once Step 2 is live)*, Step 4 — Create the WEB_COMPUTE app  *(operator — staged, per the migration playbook)* (+5 more)

### Community 45 - "Community 45"
Cohesion: 0.18
Nodes (10): 1. Strapi content token → Amplify, 2. Medusa DTC product import (Stripe TEST), 3. Register the Strapi ISR webhook, 4. RLS cross-tenant isolation (already green — re-run optional), 5. Final verification (Wave 2·D done), code:bash (# On agency-core:), code:bash (# On agency-core, in the Medusa app root (where `npx medusa`), code:block3 (MEDUSA_SALES_CHANNEL_ID            = sc_...) (+2 more)

### Community 46 - "Community 46"
Cohesion: 0.20
Nodes (9): Already done (this pass, no live deps), code:bash (cd infrastructure), Gate re-check (probed 2026-06-09 — was 000/404 on 2026-06-08), Operator bootstrap runbook (run on `agency-growth` — single sitting), Prerequisite 1 — services must be UP (S6 + Vinny), Prerequisite 2 — credentials must exist (Vinny → SOPS secret set), The live pass (once both prereqs clear) — one sitting, touchvodka — S8 leads + email live-wiring checklist (+1 more)

### Community 48 - "Community 48"
Cohesion: 0.33
Nodes (5): 1 · Set the Amplify env (app `d1yhwh9axgn9ty`, branch `next-rebuild`), 2 · Confirm the Medusa region is checkout-ready (the gating prereq), 3 · Verify (the S10 done-criterion), S10 — Touch Vodka DTC commerce: operator verify runbook (Wave 2·H), What S10 shipped (code, build-verified offline)

### Community 49 - "Community 49"
Cohesion: 0.33
Nodes (5): Detailed steps live in (do not duplicate — execute these), Order of operations, The merged Amplify env map (app `d1yhwh9axgn9ty`) — set ALL of these in one update, Then → Wave 3 (`sessions/TOUCHVODKA-GOLIVE.md` §WAVE 3) → emit `TOUCHVODKA LIVE`., Wave 2 — consolidated operator pass (touchvodka)

## Knowledge Gaps
- **301 isolated node(s):** `$schema`, `extends`, `description`, `packageRules`, `config` (+296 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **14 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PageHero()` connect `Community 4` to `Community 8`, `Community 2`?**
  _High betweenness centrality (0.005) - this node is a cross-community bridge._
- **What connects `$schema`, `extends`, `description` to the rest of the system?**
  _301 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.044444444444444446 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06196291270918137 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.14285714285714285 - nodes in this community are weakly interconnected._
- **Should `Community 4` be split into smaller, more focused modules?**
  _Cohesion score 0.09523809523809523 - nodes in this community are weakly interconnected._