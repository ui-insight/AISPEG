# ADR 0002 — Strategic Plan Alignment Explorer

**Status:** Accepted
**Date:** 2026-05-03
**Deciders:** Barrie Robison (with @ProfessorPolymorphic)
**Related:** [#100](https://github.com/ui-insight/AISPEG/issues/100) (epic), [ADR 0001](./0001-product-lifecycle-taxonomy.md) (lifecycle taxonomy — same catalog-tracked-vocabulary idiom), PRs #175, #179, #180, #181, #182, #183, #220

## Context

The IIDS portfolio site exists to make institutional AI work legible to UI stakeholders — Provost, Deans, partner units. Those stakeholders ask a recurring question that the site could not answer: **"How does this work advance the University Strategic Plan?"**

The Strategic Plan has a stable structure (5 pillars, ~25 priorities, each priority a one-sentence commitment) and a stable canonical reference URL. It is the document Deans and the Provost cite when justifying resourcing decisions. Anything the institution claims to be doing should ladder up to it.

Three constraints shape the response:

1. **The Strategic Plan is upstream of this repo.** It changes on its own cadence, owned by Strategic Enrollment Management, not IIDS. The site cannot be the source of truth for pillar/priority text.
2. **The portfolio is the source of truth for what IIDS is doing.** Each project's alignment claim is editorial — IIDS asserts it, and the assertion should be reviewable and version-controlled.
3. **Stakeholders need bidirectional lookup.** A Dean reading a project asks "what plan priority does this advance?" A Provost reading the plan asks "what's actually happening on D.2?" Both directions should be one click.

## Decision

Build a **Strategic Plan Alignment Explorer** at `/standards/strategic-plan` that surfaces bidirectional alignment between portfolio projects and Strategic Plan priorities, using the same vendored-submodule + typed-catalog idiom Sprint 5 established for data governance.

### Data architecture

| Layer | Source | Why |
|---|---|---|
| Pillar / priority text | `vendor/strategic-plan/` git submodule | Upstream-owned. Pinned by SHA so the site's render is deterministic. |
| Typed catalog | `lib/strategic-plan/catalog.ts` (auto-generated) | `scripts/build-strategic-plan-catalog.ts` regenerates on `prebuild`/`predev`. Hand edits are forbidden (rule 13 in CLAUDE.md). |
| Alignment claim | `strategicPlanAlignment?: string[]` on each `Project` in `lib/portfolio.ts` | Editorial; references priority codes (e.g. `"D.2"`, `"E.4"`). One commit = one claim, full audit trail. |
| Postgres mirror | Migration 008 — `strategic_plan_alignment text[]` on `applications` | Lets `lib/work.ts` (the runtime read path) join the alignment without re-reading `lib/portfolio.ts`. Seeded by `npm run seed:portfolio`. |

### Surfaces

- **`/standards/strategic-plan`** — pillars overview (catalog-driven).
- **`/standards/strategic-plan/pillars/[code]`** — one pillar's priorities.
- **`/standards/strategic-plan/priorities/[code]`** — one priority + the projects advancing it (reverse lookup via `lib/strategic-plan/project-alignment.ts`).
- **Project cards on `/portfolio`** — render alignment chips so the forward direction is one click from the portfolio entry.

### Drift CI

Two GitHub Actions workflows mirror the governance pattern:

- **`strategic-plan-drift.yml`** (blocking) — on PRs touching `vendor/strategic-plan/**`, `lib/strategic-plan/**`, `app/standards/strategic-plan/**`, or the build script. Validates that every `strategicPlanAlignment` priority code in `lib/portfolio.ts` resolves against the vendored catalog; fails the build if a project references a priority that no longer exists upstream.
- **`strategic-plan-pr-summary.yml`** (advisory) — submodule-freshness comment via `npm run strategic-plan:freshness`, same pattern as the governance freshness comment.

## Sub-decisions resolved

### 1. Lives under `/standards`, not as its own top-level surface

The IA is intentionally narrow (5 sidebar entries). A new top-level entry for Strategic Plan would imply parity with Projects, Explore, Submit, Reports, Standards — which it doesn't have; the explorer is a lens on the portfolio, not a parallel surface. Living under `/standards` (alongside the Data Governance Explorer) frames it correctly: *standards we hold ourselves to*, including the institutional plan.

### 2. Alignment is a `string[]` of priority codes, not a structured object

Each entry could carry a confidence level, an author, a justification paragraph. We chose the leanest possible shape — an array of priority codes — because:

- The git log already records who added the claim, when, and what changed (audit trail for free).
- A justification paragraph belongs on the project's own narrative, not duplicated per-claim.
- Anything richer is data IIDS would have to maintain; the cost of authorship discipline outpaces the value to stakeholders.

If a future need arises (e.g. ranking projects within a priority), promote the type then. YAGNI today.

### 3. Reverse lookup reads from `lib/portfolio.ts` directly, not Postgres

`lib/strategic-plan/project-alignment.ts` filters `projects` from `lib/portfolio.ts` rather than querying the `applications` table. Two reasons:

- The strategic-plan pages are statically renderable — no DB coupling on the read path keeps the build cacheable and the production cold-start fast.
- It applies the same public-vs-internal visibility filter the portfolio does (`Internal-only` excluded; `Partial` included), without re-implementing it in SQL.

When ClickUp wiring lands and `lib/portfolio.ts` retires as the runtime read path, swap this module to read via `lib/work.ts`. The interface (`AlignedProject`) is stable; the data source moves.

## Consequences

**Positive:**

- Stakeholders get a one-click answer to "what plan priority does this advance?" in both directions.
- The Strategic Plan stays upstream and version-controlled; the site never claims to own it.
- Drift CI prevents a renamed/removed upstream priority from silently breaking project claims.
- Reuses the Sprint 5 idiom (vendored submodule → typed catalog → drift workflow) — no new infrastructure, just one more instance.

**Negative:**

- A second submodule to keep current. The `strategic-plan:freshness` advisory mitigates by surfacing staleness on every PR, but it's still a periodic chore.
- Editorial claims in `lib/portfolio.ts` add a field for authors to fill out; backfill (PR #220) handled the existing 14 entries but new projects must declare alignment to be useful in the explorer.

**Neutral:**

- Lives under `/standards`, which means it shares sub-nav real estate with Data Model. Adding a third sub-section in the future is fine; adding a tenth would be a problem — but the IA can absorb it for now.

## Implementation sequencing

Six PRs, in order. Each shipped independently.

1. **Tracer slice** ([#175](https://github.com/ui-insight/AISPEG/pull/175)) — vendor submodule, build script, pillars overview route. Proved the idiom worked end-to-end before building out detail.
2. **Priority detail page** ([#179](https://github.com/ui-insight/AISPEG/pull/179)) — `/standards/strategic-plan/priorities/[code]`.
3. **Alignment field + chips on cards** ([#180](https://github.com/ui-insight/AISPEG/pull/180)) — added `strategicPlanAlignment` to `Project`, rendered chips on `/portfolio` cards.
4. **Drift CI + freshness advisory** ([#181](https://github.com/ui-insight/AISPEG/pull/181)) — blocking drift workflow + advisory freshness comment.
5. **Reverse direction** ([#182](https://github.com/ui-insight/AISPEG/pull/182)) — `getProjectsForPriority` and the projects-advancing-this-priority list on the priority detail page.
6. **Stakeholder framing per pillar** ([#183](https://github.com/ui-insight/AISPEG/pull/183)) — `lib/strategic-plan/pillar-framing.ts` with audience-facing copy on each pillar.

Followed by the data audit:

7. **Backfill** ([#220](https://github.com/ui-insight/AISPEG/pull/220)) — declared alignment for all 14 portfolio projects then in inventory. Migration 008 mirrors the field into `applications`.
