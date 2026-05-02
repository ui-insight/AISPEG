# Institutional AI Initiative — Agent Collaboration Guide

## Project Overview

Interactive website for the University of Idaho's institutional AI
initiative, coordinated by **IIDS** (Institute for Interdisciplinary Data
Sciences, which runs MindRouter and DGX Stack). The site maintains a
growing inventory of AI interventions across UI units — some built by
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
- **Sprint 4** — Reports unification *(complete)*, About page *(complete)*,
  `_archive/` deletion *(complete)*, deeper cleanup of `lib/data.ts` and
  `app/docs/*` *(in progress)*.

## Information architecture

Four primary surfaces in the sidebar, plus an About link in the footer:

| Surface | Route | Source of truth |
|---|---|---|
| The Work | `/portfolio` | `lib/portfolio.ts` (TS for now; migrating to Postgres `applications` in Sprint 2) |
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
  page.tsx                 # Landing — four-card steering page
  layout.tsx               # Root layout, sidebar, metadata
  portfolio/               # The Work
  builder-guide/           # Submit a Project (assessment quiz)
  reports/                 # Reports surface
  standards/               # Standards (sub-nav: ledger + data-model explorer)
  standards/data-model/    # Data Governance Explorer (UDM catalog + extensions)
  ai4ra-ecosystem/         # AI4RA partnership reference (Sprint 4 salvage)
  admin/                   # Registry + submissions admin
  api/                     # Next.js API routes
  docs/                    # Technical + user documentation

components/                # Reusable components
  Sidebar.tsx              # Sidebar navigation
  PortfolioCard.tsx        # Intervention card
  IssueCard.tsx            # GitHub issue card
  DocPage.tsx              # Docs layout primitives

lib/                       # Domain logic
  portfolio.ts             # Intervention inventory (typed)
  standards-watch.ts       # Standards ledger
  artifacts.ts             # Unified Reports timeline — briefs, activity reports, external talks
  builder-guide-data.ts    # Assessment quiz + scoring + tiers
  similarity.ts            # Submission ↔ registry overlap engine
  github.ts                # GitHub Issues API
  mindrouter.ts            # MindRouter LLM client
  db.ts                    # Postgres connection pool
  data.ts                  # Legacy strategic data (slated for Sprint 4 cleanup)
  governance/              # Data Governance Explorer typed modules
    types.ts               # Shared interfaces (Project, Table, Column, Vocabulary*)
    canonical-udm-tables.ts # Hand-curated canonical-vs-extension tagging (v1)
    catalog.ts             # AUTO-GENERATED — projects + tables (do not edit)
    vocabularies.ts        # AUTO-GENERATED — controlled vocabularies (do not edit)

db/migrations/             # SQL migrations (001 → 004; 005 lands in Sprint 2)

scripts/                   # Node scripts run via tsx
  build-governance-catalog.ts # Reads vendor/data-governance/ → emits lib/governance/{catalog,vocabularies}.ts

vendor/                    # Vendored dependencies
  data-governance/         # Git submodule → ui-insight/data-governance
```

## Conventions

- All structured data prefers a typed module (`lib/portfolio.ts`,
  `lib/standards-watch.ts`) over a JSON blob, so the build catches schema
  drift.
- Pages are server components by default. Add `"use client"` only when a
  component needs `useState`, `useEffect`, or event handlers
  (`Sidebar.tsx`, the wizard).
- Tailwind utilities use the project tokens: `ui-charcoal`, `ui-gold`,
  `ui-gold-dark`, `brand-huckleberry`, `brand-lupine`. Avoid raw hex.
- New routes go in `app/<route>/page.tsx` and pick up the layout
  automatically. Add to `components/Sidebar.tsx` if it belongs in primary
  nav (rare — the IA is intentionally narrow).
- Markdown content for narrative pages can live in `content/` (currently
  unused but reserved).
- When adding to `lib/portfolio.ts`, fill **all** required fields. The
  shape is in the same file. `homeUnits`, `operationalOwners`, and
  `buildParticipants` are load-bearing UI.

## Adding content

| To add… | Edit | Notes |
|---|---|---|
| An intervention | `lib/portfolio.ts` | Use existing entries as templates. Set `visibility` honestly. |
| A standards ledger entry | `lib/standards-watch.ts` | Each is commit-worthy; the git log is the audit trail. |
| A sub-section under `/standards` | `app/standards/<sub>/page.tsx` + add a row to `subNavItems` in `components/StandardsSubNav.tsx` | The shared eyebrow + sub-nav lives in `app/standards/layout.tsx`. Each sub-page owns its own H1. Sidebar stays at one "Standards" entry — never edit `Sidebar.tsx` for sub-sections. |
| A canonical UDM table tag | `lib/governance/canonical-udm-tables.ts` | Hand-curated v1 list. The data-governance catalog JSONs do not yet carry canonical/extension classification — once they do, this module retires. |
| A presentation or external talk | `lib/artifacts.ts` (entry with `kind: "presentation"`, `external: true`, `href` pointing at the hosted deck) | The artifact appears in the /reports timeline. |
| A report | `app/reports/page.tsx` and (if needed) a route under `app/reports/<slug>` | Time-stamped, reverse-chron. |

For Sprint 2+ schema changes, write a SQL migration under `db/migrations/`
and update `lib/db.ts` only if the connection pool needs new behavior.

## Development commands

```bash
npm run dev                # Dev server on :3000 (auto-runs build:governance first)
npm run build              # Production build (auto-runs build:governance first)
npm run build:governance   # Regenerate lib/governance/{catalog,vocabularies}.ts
                           # from vendor/data-governance/ submodule
npm run lint               # ESLint
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
this submodule, so the typed catalog modules stay in sync.

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
