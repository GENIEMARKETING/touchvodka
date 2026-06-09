# Project instructions

Scaffolded from **vinny-init**. This site is part of the Vinny agency system: it
consumes shared packages and the shared backend — it does not reinvent them.

## The contract (do not remove)

| File | Purpose |
|---|---|
| `.graphifyignore` + `graphify-out/` | this project's knowledge graph |
| `CLAUDE.md` (this file) | project instructions |
| `LEARNINGS.md` | mistakes → fixes; promote durable ones to the mistakes-registry |
| `scripts/preflight.ts` | contract + quality-floor gate (`pnpm preflight`) |
| `.github/workflows/ci.yml` | calls the shared reusable CI workflow |

## Reuse before you build (GraphRAG loop)

Before creating any new section or component:
1. Browse the **catalog** (Storybook on Amplify) and the **global graph**.
2. If it exists → install `@vinny/ui` or `npx @vinny/blocks add <name>`.
3. If new → build it here with a motion spec + story + test. Once it's used 3×,
   extract it to `@vinny/ui` / `@vinny/blocks` so the next project finds it.

## Shared, not owned

- **UI/motion:** `@vinny/ui` (auto-updates via Renovate) + `@vinny/ui/motion`.
- **Tokens:** `@vinny/foundation` (easings, durations, stagger) — import, never copy.
- **Backend:** the shared Strapi (content) + Medusa (commerce) on Layer 0. This
  site has **no database of its own**; scope shared data by this site's key.
- **Assets:** heavy media (image sequences, Lottie, hero video) live on the CDN
  (S5), referenced by URL — never committed to git.

## Motion rules (enforced by `preflight`)

Respect `prefers-reduced-motion`; any pinned ScrollTrigger needs `anticipatePin`;
set `will-change` on enter and clear it on complete. `pnpm preflight` fails CI on
violations.

## After changing code

Run `graphify update .` to keep `graphify-out/` current (AST-only, no API cost).
