# ADR 0003 — ClickUp Ingestion Boundary

**Status:** Accepted
**Date:** 2026-07-10
**Deciders:** Colin Addington
**Related:** [REFACTOR.md](../../REFACTOR.md) ("ClickUp ↔ Postgres boundary", Sprint 3b), [ADR 0001](./0001-product-lifecycle-taxonomy.md) (lifecycle taxonomy the new portfolio entries must satisfy), Migration 010

## Context

REFACTOR.md drew the source-of-truth boundary in Sprint 2: *"Project status, blockers, daily workflow — ClickUp. Where Colin already lives."* The wiring itself (Sprint 3b) was deferred. Meanwhile the IIDS-AI4UI ClickUp space matured into a real operational system:

- **Each active AI4UI project is a ClickUp list** (14 as of July 2026). Each list carries a "Project Notes" task (task type "Project Detail") whose **comments are the dated status narrative**, and whose custom fields carry **ROI-FTE / ROI-Explanation**, leads, POCs, stakeholders, repo link, and projected completion.
- **The intake backlog is a list of form responses** ("AI4UI New Project Requests"), each scored on an 11-criterion rubric (A1–A4 strategy/impact ×0.1, B1–B4 feasibility/effort ×0.075, C1–C3 urgency/buy-in ×0.1, sum ×20) with a ClickUp formula field computing the weighted score.

The site should publish three things from that system: current status of active projects, their ROI estimations, and the scored request backlog. Colin decided **all three are public**.

## Decision

**Pull-only ingestion, ClickUp → Postgres, on a cron + manual trigger.** No write-back to ClickUp in this feature (the Sprint 3b write side — new submissions creating ClickUp tasks — remains future work).

### What flows

| From ClickUp | Into | Surfaced at |
|---|---|---|
| "Project Notes" task fields per project list: ROI-FTE, ROI-Explanation, Lead(s), POC(s), Stakeholders, repo link, projected completion, scope, business unit | `clickup_projects` | Project detail pages (ROI line), internal views |
| Comments on each "Project Notes" task | `clickup_status_updates` | **Public:** a generated summary (`clickup_projects.status_summary`) on detail pages and cards. **Internal:** the full dated timeline. See "Accepted risk" below — amended July 2026. |
| Backlog request tasks: name, status, description, unit, submitter, category, feasibility, 11 rubric values, weighted score | `clickup_requests` | `/portfolio/pipeline` |

### What does not flow

Ordinary work tasks, assignees, checklists, attachments, time tracking, chat, and every other list in the workspace. The sync reads exactly the lists named in `lib/clickup-map.ts` and nothing else.

## Sub-decisions resolved

### 1. Synced tables carry no foreign keys to `applications`

`scripts/seed-portfolio.ts` re-seeds with `TRUNCATE applications RESTART IDENTITY CASCADE`. A CASCADE FK from synced tables would silently wipe ClickUp data on every re-seed. Instead, synced rows are keyed by ClickUp ids (list id, comment id, task id) and join to portfolio slugs **at read time** via the typed map in `lib/clickup-map.ts`. Seed and sync are order-independent; each is individually idempotent.

### 2. List/space ids are code; only the token is config

Workspace, space, and list ids are stable structured data — they live in `lib/clickup-map.ts` where tsc checks every consumer (CLAUDE.md rule 9). `CLICKUP_API_TOKEN` is the only environment variable.

### 3. Rubric criteria are explicit columns, not JSONB

The rubric is a fixed 11-field instrument defined by the ClickUp form. Explicit `rubric_a1..rubric_c3` columns keep the read layer typed end-to-end and make a rubric change a visible migration rather than silent blob drift. If ClickUp's formula value is missing, the sync computes the same formula locally and marks `score_source = 'computed'` — the site never silently invents a number.

### 4. Sync failure posture: stale beats missing

Rows for a list are deleted (to mirror ClickUp deletions) only after that list fetched successfully, per list. A mid-run failure leaves previously synced data intact and records the failure in `clickup_sync_runs`. Lists missing their "Project Notes" task are warned about and skipped, never a hard failure. Every surface that renders synced data shows a freshness stamp from `clickup_sync_runs`.

### 5. Trigger: script + authed route, not GitHub Actions

The Postgres instance lives on the on-prem docker host; GitHub runners can't reach it. So:

- `npm run sync:clickup` — tsx script for local/dev/one-off runs.
- `POST /internal/sync` — route handler behind the existing `/internal` Basic-auth middleware, used by the "Sync now" button on `/internal` and by the host cron:

```
17 6,12,18 * * *  curl -s -u "$BASIC_AUTH_USER:$BASIC_AUTH_PASS" -X POST https://aispeg.insight.uidaho.edu/internal/sync
```

Both triggers call the same `runSync()` in `lib/clickup-sync.ts`.

## Accepted risk: internal-voice comments become public copy — *amended July 2026*

Status-update comments were written in ClickUp as internal notes. The original decision published them verbatim; Colin revised it: **the public site never renders the comment corpus.** Instead:

- The sync generates a 2–4 sentence public summary per project via MindRouter (migration 011: `status_summary`, `status_summary_at`, `status_summary_source`), regenerated only when the comment stream changes. The prompt forbids email addresses, meeting links, and internal asides, and forbids inventing details.
- The full dated timeline renders only on the auth-gated `/internal` view.
- If MindRouter is unavailable, the previous summary is kept (stale beats missing) and the sync run records a warning; a project with no summary yet simply shows nothing publicly.

**Ongoing:** the site remains a projection of ClickUp — comment hygiene still matters because the summarizer can only be as accurate as its inputs, and `/internal` shows the notes verbatim (this extends the "ClickUp data hygiene" risk REFACTOR.md already names). Spot-checking generated summaries after significant comment activity is part of the sync-review habit.

## Consequences

- `/portfolio` project pages gain a dated, human-authored status timeline and an ROI line — the site's evidence-forward claim gets primary-source backing.
- `/portfolio/pipeline` makes the intake rubric public: units can see how requests are scored and where theirs stands.
- The nine AI4UI projects that existed only in ClickUp join `lib/portfolio.ts` (and the public site) as first-class entries, verified by ADR 0001 rules.
- ClickUp data-entry discipline (notes-task fields, comment cadence) now directly determines public-site quality.
