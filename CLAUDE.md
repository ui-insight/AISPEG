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
    with a sub-nav (see `app/standards/layout.tsx` as the canonical
    pattern), not as new sidebar items.
12. **NEVER recreate routes removed in the May 2026 refactor**:
    `/knowledge`, `/cautionary-tales`, `/roadmap`, `/outreach`,
    `/action-plan`, `/approach`, `/standards/[id]`. They were cut on
    purpose — see `REFACTOR.md`. Recover from git history only if a
    salvage need is explicitly raised.
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
  declared for all 15 portfolio projects (#220).

## Information architecture

Five primary surfaces in the sidebar, plus an About link in the footer:

| Surface | Route | Source of truth |
|---|---|---|
| Projects | `/portfolio` | Postgres `applications` table (read via `lib/work.ts`); `lib/portfolio.ts` is the TS shadow + seed source for `scripts/seed-portfolio.ts`. Filter UI is two-tier: public stage (rollup) → operational status (drill-in), per [ADR 0001](docs/adr/0001-product-lifecycle-taxonomy.md). |
| Explore | `/explore` | `lib/work-categories.ts` (taxonomy) + `lib/portfolio.ts` (counts and representative names) — by-problem axis, complementary to `/portfolio`'s by-home-unit grouping |
| Submit a Project | `/builder-guide` | `lib/builder-guide-data.ts` (quiz definition); Postgres `submissions` (responses) |
| Reports | `/reports` | `lib/artifacts.ts` — unified timeline of briefs, activity reports, and external presentations |
| Standards | `/standards` | `lib/standards-watch.ts` (ledger entries; commit-worthy) |

Plus `/ai4ra-ecosystem` (deep-dive linked from About), `/docs/*`
(technical and user documentation), `/admin/*` (registry + submissions
admin during the ClickUp transition).

Routes cut in the May 2026 refactor (`/knowledge`, `/cautionary-tales`,
`/roadmap`, `/outreach`, `/action-plan`, `/approach`, `/standards/[id]`)
were removed entirely in Sprint 4. Recover from git history if a salvage
need arises; check `REFACTOR.md` for the rationale.

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
  explore/                 # Explore — "by problem" axis, category-tile entry
  builder-guide/           # Submit a Project (assessment quiz)
  intake/[token]/          # Submitter-visible status page (Sprint 3a)
  reports/                 # Reports surface
  presentations/           # Legacy redirect → /reports (kept to preserve inbound links)
  standards/               # Standards (sub-nav: ledger + data-model + strategic-plan)
    data-model/            # Data Governance Explorer (UDM catalog + extensions)
    strategic-plan/        # Strategic Plan Alignment Explorer (pillars + priorities)
  ai4ra-ecosystem/         # AI4RA partnership deep-dive (linked from /about)
  internal/                # Auth-gated views (Basic auth) — same data, sharper detail
  admin/                   # Registry + submissions admin
  api/                     # Next.js API routes
  docs/                    # Technical + user documentation

components/                # Reusable components
  Sidebar.tsx              # Sidebar navigation
  StandardsSubNav.tsx      # Sub-nav under /standards
  PortfolioCard.tsx        # Project card
  PortfolioFilters.tsx     # Two-tier public-stage / operational-status filter
  ProjectDetail.tsx        # Project detail page composition
  IssueCard.tsx            # GitHub issue card
  DocPage.tsx              # Docs layout primitives
  (plus governance + data-model explorer components)

lib/                       # Domain logic
  portfolio.ts             # Project inventory (typed; seed source for the applications table)
  portfolio-verification.ts # ADR 0001 verifier — `npm run verify:portfolio`
  portfolio-meta.ts        # AUTO-GENERATED — derived lastCommitDate per repo (do not edit)
  lifecycle-display.ts     # Display helpers for public-stage / operational status chips
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

db/migrations/             # SQL migrations (001 → 008; 007 = lifecycle, 008 = strategic-plan-alignment)

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
| A sub-section under `/standards` | `app/standards/<sub>/page.tsx` + add a row to `subNavItems` in `components/StandardsSubNav.tsx` | The shared eyebrow + sub-nav lives in `app/standards/layout.tsx`. Each sub-page owns its own H1. Sidebar stays at one "Standards" entry — never edit `Sidebar.tsx` for sub-sections. |
| A canonical UDM table tag | `lib/governance/canonical-udm-tables.ts` | Hand-curated v1 list. The data-governance catalog JSONs do not yet carry canonical/extension classification — once they do, this module retires. |
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
npm run seed:portfolio         # lib/portfolio.ts → applications table (dev DB)
npm run verify:portfolio       # ADR 0001 status-rule enforcer (CI runs this)
npm run refresh:commit-dates   # Hit GitHub API → regenerate lib/portfolio-meta.ts

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
```

### Deploy via Claude Code

```
Deploy in prod using docker on the remote server accessible via
devops@openera.insight.uidaho.edu. Map it to host port 9260. Because of
routing conflicts, use 10.x.x.x address space, not the docker default
172.x.x.x address space.
```

Replace `prod` / `9260` with `dev` / `9270` for the dev deployment.
