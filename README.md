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

| Surface | Route | Job |
|---|---|---|
| **Projects** | `/portfolio` | Portfolio of AI projects across UI units. Each entry names a home unit and operational owner. |
| **Submit a Project** | `/builder-guide` | A 9-step assessment that scopes an AI idea, classifies it into one of four tiers, and connects the submitter to a named owner at IIDS. |
| **Reports** | `/reports` | Activity reports, briefs, and time-stamped public artifacts. |
| **Explore** | `/explore` | "By problem" entry point — category tiles built from `lib/work-categories.ts`, complementary to `/portfolio`'s by-home-unit grouping. |
| **Standards** | `/standards` | Public ledger of the institutional software-development and user-experience standards IIDS has formally requested from OIT. Sub-sections: `/standards/data-model` (Data Governance Explorer for the AI4RA Unified Data Model) and `/standards/strategic-plan` (Strategic Plan Alignment Explorer — pillars, priorities, and the projects advancing each one). |

Plus `/docs` (technical and user documentation) and `/admin/*` (registry +
submissions admin during the ClickUp transition). Several legacy routes
(`/knowledge`, `/cautionary-tales`, `/roadmap`, `/outreach`,
`/action-plan`, `/approach`) were cut in the May 2026 refactor; recover
from git history if needed.

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
  layout.tsx                 # Root layout + metadata
  portfolio/                 # Projects — AI projects inventory
  builder-guide/             # Submit a Project — 9-step assessment
  reports/                   # Reports surface
  standards/                 # Standards ledger
  ai4ra-ecosystem/           # AI4RA partnership reference page
  admin/                     # Registry + submissions admin
    registry/
    submissions/
  api/                       # Next.js API routes
    submissions/, registry/, ai/
  docs/                      # User + technical documentation

components/                  # Reusable React components
  Sidebar.tsx, PortfolioCard.tsx, IssueCard.tsx, DocPage.tsx, ...

lib/                         # Domain logic and data
  portfolio.ts               # Inventory of AI projects (typed)
  standards-watch.ts         # Standards ledger entries
  builder-guide-data.ts      # Assessment quiz, scoring, tiers
  similarity.ts              # Submission ↔ registry overlap engine
  github.ts                  # Issue fetching for home/about surfaces
  mindrouter.ts              # MindRouter LLM client
  db.ts                      # Postgres connection pool

db/migrations/               # SQL migrations (001 → 008)
```

## Refactor in progress

This codebase is mid-refactor. The May 2026 refactor pivots the site from
its original AISPEG-collaboration framing to an IIDS-coordinated
institutional AI initiative site. See [`REFACTOR.md`](./REFACTOR.md) for
the full plan, sprint sequencing, and decisions:

- **Sprint 1** — *complete*. IA reshape, Standards page, AISPEG branding
  removed from user-facing surfaces.
- **Sprint 2** — The Work rebuild: Migration 005 adds friction-ledger
  fields and a `blockers` table; portfolio data migrates from
  `lib/portfolio.ts` into the `applications` table; new `/work` rendering
  with friction first-class; auth-gated `/internal` view.
- **Sprint 3** — ClickUp wiring + Submit-a-Project improvements: named-SLA
  acknowledgment, submitter-visible status page (`/intake/[token]`),
  similarity matching surfaced during assessment.
- **Sprint 4** — *complete (May 2026)*. Reports unification (PR #90),
  `_archive/` deletion (PR #91), Lovable cautionary tale salvaged into
  Reports (PR #92), `lib/data.ts` retired with per-page colocation
  (PR #93). The About page predated the sprint and is live at `/about`.
  Remaining `app/docs/*` drift is tracked as
  [#94](https://github.com/ui-insight/AISPEG/issues/94)–[#98](https://github.com/ui-insight/AISPEG/issues/98).
- **Sprint 5** — *complete (May 2026)*. Data governance integration:
  `vendor/data-governance/` submodule + drift CI + `iids-portfolio`
  domain registration (PR #172).
- **Post-Sprint-5 / May 2026** — Lifecycle taxonomy shipped end-to-end
  ([ADR 0001](./docs/adr/0001-product-lifecycle-taxonomy.md)) with
  Migration 007, the `verify:portfolio` CI gate, and two-tier filter
  UI. Strategic Plan Alignment Explorer shipped
  ([ADR 0002](./docs/adr/0002-strategic-plan-alignment-explorer.md))
  with Migration 008, bidirectional alignment, and drift CI. See
  [`REFACTOR.md`](./REFACTOR.md) for the full timeline.

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
npm run dev      # Dev server on :3000
npm run build    # Production build (also a TypeScript check)
npm run lint     # ESLint
```

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
