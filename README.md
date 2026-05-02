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
| **The Work** | `/portfolio` | Portfolio of AI interventions across UI units. Each entry names a home unit and operational owner. |
| **Submit a Project** | `/builder-guide` | A 9-step assessment that scopes an AI idea, classifies it into one of four tiers, and connects the submitter to a named owner at IIDS. |
| **Reports** | `/reports` | Activity reports, decks, and time-stamped public artifacts. |
| **Standards** | `/standards` | Public ledger of the institutional software-development and user-experience standards IIDS has formally requested from OIT. The `/standards/data-model` sub-section is an interactive explorer for the AI4RA Unified Data Model and the per-project extensions across the IIDS portfolio. |

Plus `/docs` (technical and user documentation) and `/admin/*` (registry +
submissions admin during the ClickUp transition). The May 2026 refactor
archived several legacy routes (`/knowledge`, `/cautionary-tales`,
`/roadmap`, `/outreach`, `/action-plan`, `/approach`) into `_archive/`;
they are not part of the active site.

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
  portfolio/                 # The Work — AI interventions inventory
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
  portfolio.ts               # Inventory of AI interventions (typed)
  standards-watch.ts         # Standards ledger entries
  builder-guide-data.ts      # Assessment quiz, scoring, tiers
  similarity.ts              # Submission ↔ registry overlap engine
  github.ts                  # Issue fetching for home/about surfaces
  mindrouter.ts              # MindRouter LLM client
  db.ts                      # Postgres connection pool
  data.ts                    # Legacy strategic content data (slated for cleanup)

db/migrations/               # SQL migrations (001 → 004)
_archive/                    # Routes/files archived in the May 2026 refactor
                             # Pending Sprint 4 salvage; deletion candidate
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
- **Sprint 4** — Reports unification, About page, salvage from `_archive/`,
  cleanup pass on `lib/data.ts` and `app/docs/*`.

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
