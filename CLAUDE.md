# Institutional AI Initiative — Agent Collaboration Guide

## Project Overview

Interactive website for the University of Idaho's institutional AI
initiative, coordinated by **IIDS** (Institute for Interdisciplinary Data
Sciences, which runs MindRouter and DGX Stack). The site maintains a
growing inventory of AI projects across UI units — some built by
IIDS, others led by partner units, plus tools from the AI4RA partnership
(UI + Southern Utah University NSF GRANTED, producing OpenERA, Vandalizer,
MindRouter, ProcessMapping) that UI deploys institutionally. Built with
Next.js 16 (App Router), Tailwind CSS v4, TypeScript, PostgreSQL, and
MindRouter for AI features.

**Repo identity note**: the repository name and infrastructure identifiers
(`aispeg.insight.uidaho.edu`, container names, the Postgres database) are
historical — the project began as a collaboration site for the AI Strategic
Plan Execution Group (AISPEG). That group is dormant. **User-facing
surfaces no longer reference AISPEG.** When generating new copy, headings,
or metadata, frame the project as IIDS-coordinated. See
[`REFACTOR.md`](./REFACTOR.md) for the May 2026 refactor history and the
strategic decisions that shaped the current architecture.

## Agent Rules (MUST follow)

These are normative constraints, not suggestions. The rest of this file
is background and patterns; the rules below are non-negotiable. When a
rule conflicts with something else in this document, the rule wins.

### Process
1. **ALWAYS work on a feature branch.** NEVER commit directly to `main`.
   All work lands via PR.
2. **ALWAYS run `npm run build` before declaring work done.** It's the
   primary verification step — type errors, missing imports, and
   prerendering failures all surface here.
3. **ALWAYS run `npm run verify:portfolio` if you touched
   `lib/portfolio.ts`.** CI enforces it; running locally catches drift
   before push. See [ADR 0001](./docs/adr/0001-product-lifecycle-taxonomy.md).
4. **ALWAYS read [`.impeccable.md`](./.impeccable.md) before any visual
   or design change.** The design direction is non-obvious and the
   project has a documented restraint vs. decoration policy.
5. **ALWAYS read [`REFACTOR.md`](./REFACTOR.md) before non-trivial
   structural changes.** It documents what was deliberately removed and
   why — saves you from re-introducing dead patterns.

### Code
6. **NEVER use raw hex colors.** Use Tailwind tokens (`ui-charcoal`,
   `ui-gold`, `ui-gold-dark`, `brand-huckleberry`, `brand-lupine`,
   `brand-clearwater`, `brand-silver`).
7. **NEVER add `"use client"`** unless the component genuinely uses
   `useState`, `useEffect`, or event handlers. Server components are
   the default for a reason — they keep the bundle small and the data
   path simple.
8. **NEVER add component libraries.** The project uses native HTML +
   Tailwind. No shadcn, MUI, Radix UI, Headless UI, or similar. If you
   need a primitive, write it.
9. **ALWAYS prefer a typed module over a JSON blob** for structured
   data, so tsc catches drift across consumers.
10. **NEVER reference "AISPEG" in user-facing copy, headings, or
    metadata.** The project is IIDS-coordinated; AISPEG is the
    historical repo name only. (Internal infra identifiers like
    `aispeg.insight.uidaho.edu` and the Postgres database name stay
    as-is.)

### Structure
11. **NEVER add Sidebar entries for sub-sections.** The IA is
    intentionally narrow. Sub-pages live under their parent's `layout.tsx`
    with a sub-nav — declare `subNavItems` there and render the shared
    `components/SectionSubNav.tsx` (see `app/standards/layout.tsx` and
    `app/coordination/layout.tsx`), not as new sidebar items.
12. **NEVER recreate routes removed in the May 2026 refactor**:
    `/knowledge`, `/cautionary-tales`, `/roadmap`, `/outreach`,
    `/action-plan`, `/approach`, `/standards/[id]`, `/explore` (retired
    per [ADR 0003](docs/adr/0003-strategic-plan-map-home.md); the
    strategic-plan map lives at `/standards/strategic-plan/map`). They
    were cut on purpose — see `REFACTOR.md`. Recover from git history
    only if a salvage need is explicitly raised.
13. **NEVER edit auto-generated files.** `lib/governance/catalog.ts`,
    `lib/governance/vocabularies.ts`, `lib/strategic-plan/catalog.ts`,
    and `lib/portfolio-meta.ts` are overwritten by their build
    scripts. Edit the source (the `vendor/data-governance/` JSONs, the
    `vendor/strategic-plan/` JSON, or the `refresh-commit-dates`
    script) and regenerate.

### Deployment
14. **NEVER use Docker's default 172.x.x.x address space** for this
    stack. Use 10.x.x.x — there are routing conflicts on the host
    network otherwise.

## Refactor status

This codebase is mid-refactor. Read [`REFACTOR.md`](./REFACTOR.md) before
making non-trivial changes — it documents the strategic decisions, the
data architecture intent (Postgres registry + ClickUp workflow + GitHub
issues + markdown narrative), the friction-ledger taxonomy, and the
sprint sequencing.

- **Sprint 1** — *complete (May 2026)*. IA reshape, Standards page,
  AISPEG branding removed from user-facing surfaces.
- **Sprint 2** — The Work rebuild + Migration 005 (friction-ledger schema)
  + auth-gated `/internal`.
- **Sprint 3** — ClickUp wiring + Submit-a-Project delivery improvements.
- **Sprint 4** — *complete (May 2026)*. Reports unification (PR #90),
  `_archive/` deletion (PR #91), Lovable cautionary tale salvaged into
  Reports (PR #92), `lib/data.ts` retired with per-page colocation
  (PR #93). The About page predated the sprint and is live at `/about`.
  Remaining `app/docs/*` drift is tracked as
  [#94](https://github.com/ui-insight/AISPEG/issues/94)–[#98](https://github.com/ui-insight/AISPEG/issues/98).
- **Sprint 5** — *complete (May 2026)*. Data governance integration:
  `vendor/data-governance/` submodule, `lib/governance/*` typed
  modules, `/standards/data-model` explorer, drift CI, `iids-portfolio`
  domain registered (PR #172).
- **Post-Sprint-5 / May 2026** — Lifecycle taxonomy shipped end-to-end
  per [ADR 0001](./docs/adr/0001-product-lifecycle-taxonomy.md): schema
  + Migration 007 (PR #169), verifier + commit-date derivation
  (PR #170), public-stage chips + two-tier filter (PR #171).
  Strategic Plan Alignment Explorer shipped per
  [ADR 0002](./docs/adr/0002-strategic-plan-alignment-explorer.md):
  vendor catalog + pillars routes (PR #175), priority detail (#179),
  alignment field on portfolio entries (#180), drift CI (#181),
  reverse-direction (#182), stakeholder framing (#183), Migration 008.
  Intervention → Project rename across code, types, and docs
  (PRs #194-196). /portfolio polish: stat-strip lede, filter demotion,
  rename "The Work" → "Projects" (PRs #207-218). UniVerso added as
  the first ui-iids portfolio entry (#221). Strategic-plan alignment
  declared for every portfolio project (#220).
- **July 2026** — Four decisions, four ADRs, all shipped:
  **ClickUp ingestion** ([ADR 0004](./docs/adr/0004-clickup-ingestion-boundary.md),
  Migrations 010–011) — read-only pull of status narrative, ROI, and the
  scored request backlog; no write-back.
  **OIT pathway + FY2027 EA crosswalk** — `/coordination/oit-pathway` and
  `/coordination/oit-portfolio` (PR #283); crosswalk matches require
  owner confirmation, not subject-matter adjacency.
  **Unified Technology Request registry**
  ([ADR 0005](./docs/adr/0005-unified-technology-request-registry.md),
  Migrations 018–019) — Phase 1 registry plus `/portfolio/pipeline` as
  the single all-origin request queue. Phases 2–4 remain; TDX sync is
  blocked on API access.
  **Coordination surface split**
  ([ADR 0006](./docs/adr/0006-coordination-surface-split.md)) — the four
  process sub-pages moved out of `/standards`; permanent redirects in
  `next.config.mjs`.
  ADR 0001 also gained the `paused` and `scoping` operational states and
  the OIT-managed-production accessibility rule.

The inventory currently holds **29 projects across 13 home units**. Don't
copy a count out of this file into UI copy — compute it from
`lib/portfolio.ts` at build time.

## Information architecture

Five primary surfaces in the sidebar, plus an About link in the footer.
The Coordination / Standards split is load-bearing: **Coordination holds
process** (how work gets in and moves), **Standards holds reference**
(what the work is measured against). New surfaces go on the side of that
line they answer to — see [ADR 0006](docs/adr/0006-coordination-surface-split.md).

| Surface | Route | Source of truth |
|---|---|---|
| Projects | `/portfolio` | Postgres `applications` table (read via `lib/work.ts`); `lib/portfolio.ts` is the TS shadow + seed source for `scripts/seed-portfolio.ts`. Filter UI is two-tier: public stage (rollup) → operational status (drill-in), per [ADR 0001](docs/adr/0001-product-lifecycle-taxonomy.md). The category filter (chips driven by `lib/work-categories.ts`) is the by-problem entry point. Sub-route `/portfolio/pipeline` is the **unified request queue** — every requested/suggested project from every origin (`tech_requests` registry via `lib/requests.ts`, ClickUp rubric enrichment via `lib/clickup-data.ts`), per [ADR 0005](docs/adr/0005-unified-technology-request-registry.md). There is no internal copy: the site tells one story (owner decision 2026-07-24). |
| Submit a Project | `/builder-guide` | `lib/builder-guide-data.ts` (quiz definition); Postgres `submissions` (responses) |
| Coordination | `/coordination` | **Process** surfaces — how a request becomes tracked institutional work. Overview page is composed from the typed modules below; sub-nav covers Intake Crosswalk (`lib/governance-profile.ts`), OIT Pathway (`lib/oit-pathway.ts`), OIT Portfolio (`lib/oit-ea-portfolio.ts`), and the Op Excellence Survey (`lib/surveys/*`). Split out of `/standards` in July 2026 — see [ADR 0006](docs/adr/0006-coordination-surface-split.md). |
| Standards | `/standards` | **Reference** surfaces — what the work is measured against. `lib/standards-watch.ts` (ledger entries; commit-worthy). Sub-nav covers Data Model, Strategic Plan, and the strategic-plan coverage Map (per [ADR 0003](docs/adr/0003-strategic-plan-map-home.md)). |
| Reports | `/reports` | `lib/artifacts.ts` — unified timeline of briefs, activity reports, and external presentations |

Plus `/ai4ra-ecosystem` (deep-dive linked from About), `/docs/*`
(technical and user documentation), `/admin/*` (registry + submissions
admin during the ClickUp transition).

Routes cut in the May 2026 refactor (`/knowledge`, `/cautionary-tales`,
`/roadmap`, `/outreach`, `/action-plan`, `/approach`, `/standards/[id]`)
were removed entirely in Sprint 4. `/explore` was retired in May 2026
per [ADR 0003](docs/adr/0003-strategic-plan-map-home.md); the strategic-plan
coverage map moved to `/standards/strategic-plan/map`, and the by-problem
browse role is now served by `/portfolio`'s category filter chips.

Four `/standards/*` process sub-pages moved to `/coordination/*` in July
2026 per [ADR 0006](docs/adr/0006-coordination-surface-split.md)
(`intake-crosswalk`, `oit-pathway`, `oit-portfolio`,
`operational-excellence`). Permanent redirects live in `next.config.mjs`
— don't remove them; those links were circulated externally.
Recover from git history if a salvage need arises; check `REFACTOR.md`
for the rationale.

## Design context

Design direction is defined in [`.impeccable.md`](./.impeccable.md). Read
it before any visual/design work. Key principles at a glance:

1. **Every claim names a human** — owner-names and home-units are
   load-bearing UI.
2. **Restraint over decoration** — Pride Gold `#F1B300` is rare, used for
   emphasis and active CTAs only. No gold stripe on every card.
3. **Density with hierarchy** — stakeholders scan, practitioners read
   detail. Public Sans 900 headings against 400 body for steep contrast.
4. **Brand fidelity over invention** — the site is a UI institutional
   property. Match `uidaho.edu` visual language; do not invent a parallel
   aesthetic.
5. **The site demonstrates what it argues** — evidence-forward,
   owner-named; no decorative "trust us" flourishes.

Brand colors (canonical, defined in `app/globals.css` via `@theme`):
Pride Gold `#F1B300`, Brand Black `#191919`, Brand White `#FFFFFF`,
Silver `#808080`, Huckleberry `#261882`, Lupine `#5E48FF`, Clearwater
`#008080`. Tailwind tokens use `ui-charcoal`, `ui-gold`, `ui-gold-dark`,
plus `brand-*` for the secondary palette.

Typography is single-family Public Sans, variable weight 100–900.
Headings weight 900; body 400; emphasis 600–700. No display serif pairing.

## Tech stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4 (`@import "tailwindcss"`, `@theme`)
- **Language**: TypeScript (strict)
- **Database**: PostgreSQL 16
- **LLM**: MindRouter (OpenAI-compatible, on-prem)
- **Package manager**: npm

## Project structure

```
app/                       # Next.js App Router
  page.tsx                 # Landing — steering page
  layout.tsx               # Root layout, sidebar, metadata
  about/                   # About — strategic frame, AI4RA partnership, IIDS operator note
  portfolio/               # Projects
    pipeline/              # Unified all-origin request queue (ADR 0005)
  builder-guide/           # Submit a Project (assessment quiz)
  intake/[token]/          # Submitter-visible status page (Sprint 3a)
  reports/                 # Reports surface
  presentations/           # Legacy redirect → /reports (kept to preserve inbound links)
  standards/               # Standards — REFERENCE (sub-nav: ledger + data-model
                           #   + strategic-plan + map)
    data-model/            # Data Governance Explorer (UDM catalog + extensions)
    strategic-plan/        # Strategic Plan Alignment Explorer (pillars + priorities)
  coordination/            # Coordination — PROCESS (ADR 0006). Overview + sub-nav
    intake-crosswalk/      # Projects profiled in the Unified Technology Request vocabulary
    oit-pathway/           # OIT six-stage lifecycle, gates, and where our projects sit
    oit-portfolio/         # OIT's FY2027 EA inventory + owner-confirmed crosswalks
    operational-excellence/ # Oct 2025 survey — themes, responses, candidate projects
  ai4ra-ecosystem/         # AI4RA partnership deep-dive (linked from /about)
  internal/                # Auth-gated ops surfaces (sync trigger, agent log).
                           #   Request queue moved public → /portfolio/pipeline
                           #   (2026-07-24); /internal/requests redirects there.
                           #   NOTE: /internal/portfolio still renders a second
                           #   view of the inventory, which predates and
                           #   contradicts the one-story directive — under
                           #   review; don't build on it.
  admin/                   # Registry + submissions admin
  api/                     # Next.js API routes
  docs/                    # Technical + user documentation

components/                # Reusable components
  Sidebar.tsx              # Sidebar navigation
  SectionSubNav.tsx        # Shared sub-nav; items declared in each surface's layout.tsx
  PortfolioCard.tsx        # Project card
  PortfolioFilters.tsx     # Two-tier public-stage / operational-status filter
  ProjectDetail.tsx        # Project detail page composition
  IssueCard.tsx            # GitHub issue card
  DocPage.tsx              # Docs layout primitives
  (plus governance + data-model explorer components)

lib/                       # Domain logic
  portfolio.ts             # Project inventory + lifecycle module (types, rollup, labels, colors, type guards)
  portfolio-verification.ts # ADR 0001 verifier — `npm run verify:portfolio`
  oit-ea-portfolio.ts      # OIT's FY2027 EA inventory in OIT's structure + crosswalk to portfolio slugs
  portfolio-meta.ts        # AUTO-GENERATED — derived lastCommitDate per repo (do not edit)
  work.ts                  # Postgres-backed query module for /portfolio (reads applications + blockers)
  work-categories.ts       # "By problem" taxonomy — typed slugs + audience-facing labels
  standards-watch.ts       # Standards ledger
  artifacts.ts             # Unified Reports timeline — briefs, activity reports, external talks
  builder-guide-data.ts    # Assessment quiz + scoring + tiers
  intake-config.ts         # Named human + SLA + status labels for Submit-a-Project
  similarity.ts            # Submission ↔ registry overlap engine
  github.ts                # GitHub Issues API
  mindrouter.ts            # MindRouter LLM client
  db.ts                    # Postgres connection pool
  clickup.ts               # ClickUp REST client + typed custom-field extraction (ADR 0004)
  clickup-map.ts           # IIDS-AI4UI list ids ↔ portfolio slugs (typed map)
  clickup-sync.ts          # ClickUp → Postgres sync engine (script + /internal/sync share it)
  clickup-data.ts          # Read module over the clickup_* projection tables
  utr.ts                   # Unified Technology Request vocabularies (ADR 0005)
  requests.ts              # Postgres read module for the request registry
  governance-profile.ts    # Per-project UTR intake profile (Intake Crosswalk)
  oit-pathway.ts           # OIT six-stage lifecycle + gates
  project-governance.ts    # Governance-tracking facts per project
  project-value.ts         # Replacement-cost / bottom-line-ROI facts
  project-map-graph.ts     # Graph model behind the strategic-plan coverage map
  roi-rubric.ts            # ROI dimensions + fiscal-year helpers (CADSO rubric pending)
  rubric.ts                # ClickUp 11-criterion request-scoring rubric
  agent/                   # Site assistant — tool registry, loop, prompts,
                           #   rate limiting, query logging (POST /api/ask)
  surveys/                 # Operational Excellence survey — themes, responses,
                           #   candidate projects
  governance/              # Data Governance Explorer typed modules
    types.ts               # Shared interfaces (Project, Table, Column, Vocabulary*)
    canonical-udm-tables.ts # Hand-curated canonical-vs-extension tagging (v1)
    cross-project-fk.ts    # Cross-project foreign-key declarations
    glossary.ts            # Term glossary surfaced in chip tooltips
    project-framing.ts     # Per-project framing copy
    vocabulary-usage.ts    # Reverse index — which projects use which vocab
    catalog.ts             # AUTO-GENERATED — projects + tables (do not edit)
    vocabularies.ts        # AUTO-GENERATED — controlled vocabularies (do not edit)
  strategic-plan/          # Strategic Plan Alignment Explorer typed modules
    types.ts               # Pillar / Priority interfaces
    pillar-framing.ts      # Stakeholder-facing framing per pillar
    project-alignment.ts   # Reverse lookup — projects advancing each priority
    catalog.ts             # AUTO-GENERATED — pillars + priorities (do not edit)

db/migrations/             # SQL migrations (001 → 019). Landmarks: 005 = friction
                           #   ledger, 007 = lifecycle, 008 = strategic-plan
                           #   alignment, 009 = agent query log, 010–011 = clickup
                           #   ingestion, 012 = enterprise-replacement facts,
                           #   018 = UTR registry, 019 = survey candidates

evals/agent/               # Site-assistant eval harness (`npm run eval:agent`)

scripts/                   # Node scripts run via tsx
  build-governance-catalog.ts     # vendor/data-governance/ → lib/governance/{catalog,vocabularies}.ts
  build-strategic-plan-catalog.ts # vendor/strategic-plan/ → lib/strategic-plan/catalog.ts
  governance-freshness.ts         # Submodule freshness PR comment
  governance-pr-summary.ts        # Catalog-diff PR comment
  strategic-plan-freshness.ts     # Strategic-plan submodule freshness PR comment
  migrate.ts                      # Postgres migration runner
  seed-portfolio.ts               # lib/portfolio.ts → applications table
  verify-portfolio.ts             # ADR 0001 status-rule enforcer
  refresh-commit-dates.ts         # GitHub API → lib/portfolio-meta.ts (weekly Action)
  sync-clickup.ts                 # ClickUp IIDS-AI4UI space → clickup_* tables (ADR 0004)

vendor/                    # Vendored dependencies (git submodules)
  data-governance/         # ui-insight/data-governance — UDM + controlled vocabs
  strategic-plan/          # UI Strategic Plan pillars + priorities
```

## Conventions

Patterns the codebase follows — explanatory, not normative (the
normative version of any of these lives in **Agent Rules** above).

- **Typed modules over JSON blobs** for structured data. Canonical
  examples: `lib/portfolio.ts`, `lib/standards-watch.ts`,
  `lib/work-categories.ts`, `lib/artifacts.ts`. tsc catches drift
  across every consumer when a slug is renamed.
- **Server components by default.** Client components are the
  exception, used only for interactive surfaces (`components/Sidebar.tsx`,
  the builder-guide wizard, `components/PortfolioFilters.tsx`).
- **Routes drop in by file convention.** New `app/<route>/page.tsx`
  picks up the layout automatically.
- **Project entries are load-bearing UI.** When adding to
  `lib/portfolio.ts`, fill all required fields — the shape is in
  the same file. `homeUnits`, `operationalOwners`, and
  `buildParticipants` render directly to the public site, so name
  real people and units.

## Adding content

| To add… | Edit | Notes |
|---|---|---|
| A project | `lib/portfolio.ts` | Use existing entries as templates. Set `visibility` honestly. Set `status` honestly per the verification rules in [ADR 0001](docs/adr/0001-product-lifecycle-taxonomy.md) — `npm run verify:portfolio` polices it. Tag with `workCategories` from `lib/work-categories.ts`. Declare `strategicPlanAlignment` against priority codes from `lib/strategic-plan/catalog.ts` (see [ADR 0002](docs/adr/0002-strategic-plan-alignment-explorer.md)). After editing, re-run `scripts/seed-portfolio.ts` against dev to refresh the `applications` table. |
| Strategic-plan alignment on a project | `lib/portfolio.ts` (the `strategicPlanAlignment` field on the entry) | Reference priority codes (e.g. `"A.1"`, `"D.3"`) defined in `lib/strategic-plan/catalog.ts`. The drift CI workflow validates references against the upstream `vendor/strategic-plan/` snapshot. Per [ADR 0002](docs/adr/0002-strategic-plan-alignment-explorer.md). |
| A work category | `lib/work-categories.ts` (constant + label record) + tag relevant projects | Audience-facing labels (a Dean's vocabulary). Header comment in the file documents add/rename/retire/promote mechanics. tsc enforces consistency across consumers. |
| A standards ledger entry | `lib/standards-watch.ts` | Each is commit-worthy; the git log is the audit trail. |
| A sub-section under `/standards` or `/coordination` | `app/<surface>/<sub>/page.tsx` + add a row to `subNavItems` in that surface's `layout.tsx` | Pick the surface by the Coordination/Standards split — process vs. reference ([ADR 0006](docs/adr/0006-coordination-surface-split.md)). The eyebrow and `subNavItems` sit together in `layout.tsx`, rendered through `components/SectionSubNav.tsx`. Each sub-page owns its own H1. Sidebar stays at one entry per surface — never edit `Sidebar.tsx` for sub-sections. |
| A canonical UDM table tag | `lib/governance/canonical-udm-tables.ts` | Hand-curated v1 list. The data-governance catalog JSONs do not yet carry canonical/extension classification — once they do, this module retires. |
| An OIT FY portfolio row, or a crosswalk to one | `lib/oit-ea-portfolio.ts` | Point-in-time transcription of OIT's spreadsheet — re-transcribe on a new cut and bump `SOURCE_AS_OF`. Keep OIT's columns in OIT's vocabulary; `portfolioSlug` is the only seam to `lib/portfolio.ts`, and a claimed match needs both `crosswalkConfidence` and `crosswalkNote`. `npm run verify:portfolio` polices both. |
| A presentation or external talk | `lib/artifacts.ts` (entry with `kind: "presentation"`, `external: true`, `href` pointing at the hosted deck) | The artifact appears in the /reports timeline. |
| A report | `app/reports/page.tsx` and (if needed) a route under `app/reports/<slug>` | Time-stamped, reverse-chron. |

For Sprint 2+ schema changes, write a SQL migration under `db/migrations/`
and update `lib/db.ts` only if the connection pool needs new behavior.

## Development commands

```bash
npm run dev                    # Dev server on :3000 (predev runs build:governance + build:strategic-plan)
npm run build                  # Production build (prebuild runs build:governance + build:strategic-plan)
npm run build:governance       # Regenerate lib/governance/{catalog,vocabularies}.ts
                               # from vendor/data-governance/ submodule
npm run build:strategic-plan   # Regenerate lib/strategic-plan/catalog.ts
                               # from vendor/strategic-plan/ submodule
npm run lint                   # ESLint

# Portfolio data + ADR 0001 enforcement
npm run migrate                # Apply pending SQL migrations against $DATABASE_URL
                               # (sole authority — never pipe a .sql into psql;
                               #  hand-applied files desync schema_migrations)
npm run seed:portfolio         # lib/portfolio.ts → applications table (dev DB)
npm run verify:portfolio       # ADR 0001 status-rule enforcer (CI runs this).
                               # Also polices strategic-plan codes, the OIT
                               # crosswalk, and ProjectStatus/PublicStage parity
                               # with the vendored iids-portfolio vocabulary —
                               # adding a status is a two-repo change.
npm run refresh:commit-dates   # Hit GitHub API → regenerate lib/portfolio-meta.ts

# ClickUp ingestion (ADR 0004; needs CLICKUP_API_TOKEN)
npm run sync:clickup           # IIDS-AI4UI space → clickup_* tables (status, ROI, rubric)
                               # Prod runs the same engine via POST /internal/sync (host cron)

# Submodule freshness (used by PR-summary workflows)
npm run governance:freshness        # Renders submodule-staleness comment
npm run strategic-plan:freshness    # Same, for the strategic-plan submodule
```

`npm run build` is the primary verification step. Run it before committing.

A `Governance Drift` workflow (`.github/workflows/governance-drift.yml`) runs
on PRs that touch `vendor/data-governance/**`, `lib/governance/**`,
`app/standards/data-model/**`, or `scripts/build-governance-catalog.*`, and
fails the build if the upstream drift script reports drift between the
vendored registry and the live portfolio repos.

A second `Governance PR Summary` workflow
(`.github/workflows/governance-pr-summary.yml`) is **advisory only** (does
not fail the build) and runs on every PR. It posts (and updates in place)
two PR comments via HTML markers:

- **Submodule freshness** (`<!-- governance-bot:freshness -->`) — warns
  when the vendored `vendor/data-governance` pointer is more than
  `STALE_AFTER_DAYS` (default 14) behind upstream `main`.
- **Catalog change summary**
  (`<!-- governance-bot:catalog-changes -->`) — when this PR changes
  `lib/governance/catalog.ts` or `lib/governance/vocabularies.ts`,
  posts a human-readable diff (tables / columns / vocabulary groups /
  values added or removed) so reviewers can scan the impact without
  reading the full generated diff. The diff logic lives in
  `scripts/governance-pr-summary.ts`; freshness rendering lives in
  `scripts/governance-freshness.ts`. Both have npm-script aliases for
  local use:

```bash
npm run governance:pr-summary       # needs BASE_*_PATH env vars
npm run governance:pr-summary:test  # uses .test-governance/test.env fixtures
npm run governance:freshness        # needs PINNED_SHA + PINNED_COMMIT_DATE_ISO
```

### Governance submodule

`vendor/data-governance/` is a git submodule pointing at
[`ui-insight/data-governance`](https://github.com/ui-insight/data-governance) — the
canonical AI4RA Unified Data Model catalog and controlled-vocabulary
registry. The `prebuild` and `predev` hooks regenerate
`lib/governance/catalog.ts` and `lib/governance/vocabularies.ts` from
this submodule (and `lib/strategic-plan/catalog.ts` from the
`vendor/strategic-plan/` submodule), so the typed catalog modules stay
in sync.

When the upstream catalog changes, refresh the submodule:

```bash
git submodule update --remote vendor/data-governance
git add vendor/data-governance && git commit -m "Bump data-governance"
```

Then commit the regenerated `lib/governance/*.ts` files alongside the
submodule-pointer bump.

## Deployment

### Remote server

- **Host**: `devops@openera.insight.uidaho.edu`
- **Networking**: Use `10.x.x.x` address space (not Docker default `172.x.x.x`)

### Port mapping (all Insight apps)

| URL | Port |
|---|---|
| https://openera.insight.uidaho.edu | 9200 |
| https://openera-dev.insight.uidaho.edu | 9210 |
| https://strategicplan.insight.uidaho.edu | 9220 |
| https://strategicplan-dev.insight.uidaho.edu | 9230 |
| https://processmapping.insight.uidaho.edu | 9240 |
| https://processmapping-dev.insight.uidaho.edu | 9250 |
| **https://aispeg.insight.uidaho.edu** | **9260** |
| **https://aispeg-dev.insight.uidaho.edu** | **9270** |
| https://ucmnews.insight.uidaho.edu | 9280 |
| https://ucmnews-dev.insight.uidaho.edu | 9290 |

### Deploy commands

```bash
docker compose --profile prod up -d --build       # Production (port 9260)
docker compose --profile dev up -d --build        # Dev (port 9270)
docker compose --profile prod logs -f
docker compose --profile prod down

# Migrations — scripts/migrate.ts is the sole authority. Dev applies them
# automatically via the migrate-dev one-shot (the app container is gated on
# its clean exit). Production is deliberate:
docker compose --profile migrate run --rm migrate-prod
```

### Deploy via Claude Code

```
Deploy in prod using docker on the remote server accessible via
devops@openera.insight.uidaho.edu. Map it to host port 9260. Because of
routing conflicts, use 10.x.x.x address space, not the docker default
172.x.x.x address space.
```

Replace `prod` / `9260` with `dev` / `9270` for the dev deployment.
