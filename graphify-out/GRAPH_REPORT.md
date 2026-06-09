# Graph Report - touchvodka-next  (2026-06-07)

## Corpus Check
- 69 files · ~18,985 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 389 nodes · 423 edges · 44 communities (31 shown, 13 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

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
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 17 edges
2. `attributes` - 12 edges
3. `Cheap Vodka: Finding Quality Budget-Friendly Spirits Without Sacrificing Taste` - 12 edges
4. `scripts` - 9 edges
5. `PageHero()` - 9 edges
6. `Frequently Asked Questions About Cheap Vodka` - 7 edges
7. `Project instructions` - 6 edges
8. `test` - 5 edges
9. `info` - 5 edges
10. `getSiteProducts()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `sitemap()` --calls--> `getPostSlugs()`  [EXTRACTED]
  src/app/sitemap.ts → src/lib/blog.ts
- `Home()` --calls--> `getSiteProducts()`  [EXTRACTED]
  src/app/page.tsx → src/lib/strapi.ts
- `ProductsPage()` --calls--> `getSiteProducts()`  [EXTRACTED]
  src/app/products/page.tsx → src/lib/strapi.ts
- `generateMetadata()` --calls--> `getProductBySlug()`  [INFERRED]
  src/app/blog/[slug]/page.tsx → src/data/products.ts
- `BlogDetailPage()` --calls--> `getPost()`  [EXTRACTED]
  src/app/blog/[slug]/page.tsx → src/lib/blog.ts

## Communities (44 total, 13 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (35): Best Uses for Cheap Vodka: Maximizing Value, Can you improve cheap vodka quality at home?, Cheap Vodka: Finding Quality Budget-Friendly Spirits Without Sacrificing Taste, Common Myths About Cheap Vodka Debunked, Corporate Responsibility, Creating Premium-Style Infusions, DIY Filtration Methods, Does cheap vodka give you worse hangovers than expensive vodka? (+27 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (35): required, type, attributes, address, city, country, lat, lng (+27 more)

### Community 2 - "Community 2"
Cohesion: 0.11
Nodes (23): sitemap(), BlogPage(), metadata, getProductBySlug(), Product, PRODUCTS, TastingNotes, toTastingNotes() (+15 more)

### Community 3 - "Community 3"
Cohesion: 0.07
Nodes (26): dependencies, gsap, @gsap/react, lucide-react, next, nodemailer, react, react-dom (+18 more)

### Community 4 - "Community 4"
Cohesion: 0.12
Nodes (8): metadata, PageHero(), metadata, Cocktail, COCKTAILS, metadata, metadata, metadata

### Community 5 - "Community 5"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+12 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (11): AgeGate(), AgeGateProps, display, metadata, mono, COLS, CATEGORY_COPY, ConsentBanner() (+3 more)

### Community 7 - "Community 7"
Cohesion: 0.18
Nodes (10): Home(), NAV_ITEMS, Stockist, STOCKISTS, getSiteProducts(), strapiConfigured(), strapiFetch(), StrapiResponse (+2 more)

### Community 8 - "Community 8"
Cohesion: 0.16
Nodes (11): FindUsPage(), metadata, DEFAULT_FIELDS, KNOWN_FIELDS, LeadCapture(), LeadCaptureProps, LeadField, getStockists() (+3 more)

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (14): devDependencies, autoprefixer, @axe-core/playwright, @biomejs/biome, @playwright/test, postcss, tailwindcss, tsx (+6 more)

### Community 10 - "Community 10"
Cohesion: 0.22
Nodes (8): ci, css, lintMotion(), lintOnly, problems, REQUIRED, root, stripComments()

### Community 11 - "Community 11"
Cohesion: 0.20
Nodes (9): collectionName, info, description, displayName, pluralName, singularName, kind, options (+1 more)

### Community 12 - "Community 12"
Cohesion: 0.36
Nodes (7): escapeHtml(), POST(), EmailMessage, EmailResult, sendEmail(), sendViaOffice365(), sendViaPostal()

### Community 13 - "Community 13"
Cohesion: 0.42
Nodes (4): errors, freezeMotion(), gotoStable(), test

### Community 14 - "Community 14"
Cohesion: 0.22
Nodes (9): scripts, build, dev, lint, preflight, start, test, test:update (+1 more)

### Community 15 - "Community 15"
Cohesion: 0.25
Nodes (7): code:bash (pnpm install                 # needs NODE_AUTH_TOKEN (read:p), code:bash (# install a section block (you own + customize the copy)), Compose a page, First run, The rules (enforced by `pnpm preflight` + CI), vinny-init, What you get

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
Cohesion: 0.33
Nodes (5): 1. `/api/lead` — owned by **S8** (`@vinny/foundation/lead-contract`), 2. `useConsent()` — owned by **S7** (`@vinny/foundation/consent`), 3. PostHog — owned by **S7** (consent-gated loader), code:ts ({), lead-capture — cross-session contracts (S10 ⇄ S7, S8)

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
Cohesion: 0.50
Nodes (3): code:block1 (## <short title>), Learnings, (seed) Mobile ScrollTrigger pin jumps on iOS

## Knowledge Gaps
- **208 isolated node(s):** `$schema`, `extends`, `description`, `packageRules`, `config` (+203 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `attributes` connect `Community 1` to `Community 11`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Community 9` to `Community 3`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `$schema`, `extends`, `description` to the rest of the system?**
  _208 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05714285714285714 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.10887096774193548 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.07407407407407407 - nodes in this community are weakly interconnected._