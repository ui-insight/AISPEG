# Institutional AI Initiative — University of Idaho

A coordination nexus for the University of Idaho's institutional AI work,
operated by the **Institute for Interdisciplinary Data Sciences (IIDS)**.
The site shows what's being built, what's stalled, and where to engage.

> **Repository note**: the repo is named `AISPEG` and the deployed URLs use
> the `aispeg` slug for historical reasons — the project began as a
> collaboration site for the AI Strategic Plan Execution Group. That group
> is dormant. User-facing surfaces present the site as IIDS-coordinated.
> See [`REFACTOR.md`](./REFACTOR.md) for the May 2026 refactor history.

## What's on the site

Five primary surfaces in the sidebar, plus an About link in the footer.

| Surface | Route | Job |
|---|---|---|
| **Projects** | `/portfolio` | Inventory of AI projects across UI units. Each entry names a home unit and operational owner. The category filter chips serve the by-problem browse. `/portfolio/pipeline` is the unified request queue — every requested project from every origin. |
| **Submit a Project** | `/builder-guide` | A 9-step assessment that scopes an AI idea, classifies it into one of four tiers, and connects the submitter to a named owner at IIDS. Status page at `/intake/[token]`. |
| **Coordination** | `/coordination` | **Process** — how a request becomes tracked institutional work. Sub-sections: Intake Crosswalk, OIT Pathway, OIT Portfolio, Op Excellence Survey. |
| **Standards** | `/standards` | **Reference** — what the work is measured against. The public ledger of software-development and user-experience standards IIDS has formally requested from OIT, plus `/standards/data-model` (Data Governance Explorer for the AI4RA Unified Data Model), `/standards/strategic-plan` (Strategic Plan Alignment Explorer), and `/standards/strategic-plan/map` (the coverage map). |
| **Reports** | `/reports` | Activity reports, briefs, and time-stamped public artifacts. |

The Coordination / Standards split is load-bearing — process vs. reference.
See [ADR 0006](./docs/adr/0006-coordination-surface-split.md).

Plus `/about`, `/ai4ra-ecosystem` (AI4RA partnership deep-dive), `/docs`
(technical and user documentation), `/admin/*` (registry + submissions
admin during the ClickUp transition), and `/internal/*` (auth-gated ops
surfaces). Several legacy routes (`/knowledge`, `/cautionary-tales`,
`/roadmap`, `/outreach`, `/action-plan`, `/approach`, `/standards/[id]`,
`/explore`) were cut in the May 2026 refactor; recover from git history if
needed.

## Quick start

```bash
git clone --recurse-submodules https://github.com/ui-insight/AISPEG.git
cd AISPEG
cp .env.example .env.local   # then fill in DATABASE_URL and optional GITHUB_TOKEN
npm install
npm run dev
```

Open <http://localhost:3000>.

If you forget `--recurse-submodules` or want to refresh the vendored
governance catalog, run:

```bash
git submodule update --init --recursive
npm run build:governance   # regenerates lib/governance/{catalog,vocabularies}.ts
```

The `vendor/data-governance/` submodule pins to
[`ui-insight/data-governance`](https://github.com/ui-insight/data-governance) and
feeds the `/standards/data-model` explorer.

For full local-database setup, see [`/docs/deployment`](./app/docs/deployment/page.tsx).

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |
| Database | PostgreSQL 16 |
| LLM | MindRouter (UI on-prem inference cluster, OpenAI-compatible) |
| Deployment | Docker on Insight infrastructure |
| Package manager | npm |

## Project layout

```
app/                         # Next.js App Router
  page.tsx                   # Landing — steering page
  layout.tsx                 # Root layout + metadata + site assistant widget
  portfolio/                 # Projects — AI projects inventory
    pipeline/                # Unified request queue (all origins)
  builder-guide/             # Submit a Project — 9-step assessment
  intake/[token]/            # Submitter-visible status page
  coordination/              # Coordination — process surfaces
  standards/                 # Standards — reference surfaces
    data-model/              # Data Governance Explorer
    strategic-plan/          # Strategic Plan Alignment Explorer + map
  reports/                   # Reports surface
  presentations/             # Legacy redirect → /reports
  about/                     # About
  ai4ra-ecosystem/           # AI4RA partnership reference page
  internal/                  # Auth-gated ops surfaces (sync, agent log)
  admin/                     # Registry + submissions admin
  api/                       # Next.js API routes
    submissions/, registry/, ai/, ask/, similarity/
  docs/                      # User + technical documentation

components/                  # Reusable React components
  Sidebar.tsx, SectionSubNav.tsx, PortfolioCard.tsx, PortfolioFilters.tsx,
  ProjectDetail.tsx, ChatWidget.tsx, IssueCard.tsx, DocPage.tsx, ...

lib/                         # Domain logic and data
  portfolio.ts               # Inventory of AI projects (typed) + lifecycle
  work.ts                    # Postgres-backed read module for /portfolio
  standards-watch.ts         # Standards ledger entries
  artifacts.ts               # Unified Reports timeline
  builder-guide-data.ts      # Assessment quiz, scoring, tiers
  similarity.ts              # Submission ↔ registry overlap engine
  utr.ts, requests.ts        # Unified Technology Request registry (ADR 0005)
  clickup*.ts                # ClickUp read-only ingestion (ADR 0004)
  oit-*.ts, governance-profile.ts  # Coordination surfaces
  agent/                     # Site assistant — tools, loop, logging
  governance/                # Data Governance Explorer modules
  strategic-plan/            # Strategic Plan Explorer modules
  surveys/                   # Operational Excellence survey data
  github.ts                  # Issue fetching for home/about surfaces
  mindrouter.ts              # MindRouter LLM client
  db.ts                      # Postgres connection pool

db/migrations/               # SQL migrations (001 → 019)
docs/adr/                    # Architecture Decision Records
evals/agent/                 # Site-assistant eval harness
vendor/                      # Git submodules (data-governance, strategic-plan)
```

## Project history

The May 2026 refactor pivoted the site from its original
AISPEG-collaboration framing to an IIDS-coordinated institutional AI
initiative site. Sprints 1–5 are complete; the user-facing surfaces no
longer read as mid-refactor. [`REFACTOR.md`](./REFACTOR.md) is the
May 2026 plan document and is preserved as a historical record — for
decisions made since, read the ADRs.

- **Sprints 1–5** — *complete (May 2026)*. IA reshape, The Work rebuild
  (Migration 005 friction ledger + `blockers`), Submit-a-Project
  delivery (named SLA, `/intake/[token]`, live similarity), Reports
  unification, and data-governance integration (`vendor/data-governance`
  submodule, drift CI, `iids-portfolio` domain).
- **Lifecycle taxonomy** — [ADR 0001](./docs/adr/0001-product-lifecycle-taxonomy.md),
  Migration 007, the `verify:portfolio` CI gate, two-tier filter UI.
  Amended in July 2026 to add the `paused` and `scoping` states.
- **Strategic Plan Alignment Explorer** —
  [ADR 0002](./docs/adr/0002-strategic-plan-alignment-explorer.md),
  Migration 008, bidirectional alignment, drift CI.
- **ClickUp ingestion** *(July 2026)* —
  [ADR 0004](./docs/adr/0004-clickup-ingestion-boundary.md). Read-only
  pull of project status, ROI, and the scored request backlog into
  `clickup_*` tables (Migrations 010–011). Write-side is still future work.
- **Unified Technology Request registry** *(July 2026)* —
  [ADR 0005](./docs/adr/0005-unified-technology-request-registry.md).
  Phase 1 shipped: the `tech_requests` registry (Migration 018) and
  `/portfolio/pipeline` as the single all-origin request queue.
- **Coordination surface** *(July 2026)* —
  [ADR 0006](./docs/adr/0006-coordination-surface-split.md). The four
  process sub-pages moved out of `/standards` into a new `/coordination`
  surface; permanent redirects live in `next.config.mjs`.

Known open documentation drift: `app/docs/*`
([#94](https://github.com/ui-insight/AISPEG/issues/94),
[#96](https://github.com/ui-insight/AISPEG/issues/96),
[#97](https://github.com/ui-insight/AISPEG/issues/97)).

## Working on the codebase

This site is built collaboratively using agentic coding tools (Claude Code,
Codex, Cursor, Copilot, etc.). Two key files for any new contributor:

- **[`CLAUDE.md`](./CLAUDE.md)** — project-level instructions and
  conventions for AI coding agents. Point your agent at this when starting
  a session.
- **[`CONTRIBUTING.md`](./CONTRIBUTING.md)** — how to add content, where
  data lives, common tasks, and the review/build workflow.

Design direction is captured in [`.impeccable.md`](./.impeccable.md).

## Commands

```bash
npm run dev                  # Dev server on :3000
npm run build                # Production build (also a TypeScript check)
npm run lint                 # ESLint
npm run verify:portfolio     # ADR 0001 status-rule enforcer + governance parity (CI)
npm run migrate              # Apply pending SQL migrations
npm run seed:portfolio       # lib/portfolio.ts → applications table
npm run sync:clickup         # ClickUp read-only ingestion (ADR 0004)
```

`npm run build` and `npm run verify:portfolio` both run in CI. Run them
before pushing — the verifier fails any project whose claimed lifecycle
status isn't backed by the evidence ADR 0001 requires.

## Deployment

Production deploys to <https://aispeg.insight.uidaho.edu> (port 9260) on
University of Idaho Insight infrastructure. Dev deploys to
<https://aispeg-dev.insight.uidaho.edu> (port 9270). See
[`/docs/deployment`](./app/docs/deployment/page.tsx) for Docker, migration,
and environment-variable details.

## Branding

The site is a University of Idaho institutional property and follows the
live `uidaho.edu` visual language: Public Sans typography, Pride Gold
`#F1B300`, Brand Black `#191919`, Clearwater teal `#008080` for link
underlines. Full design context in [`.impeccable.md`](./.impeccable.md).
