# ADR 0008 — UTR Landscape: the destination-harmonized activity view

**Status:** Accepted
**Date:** 2026-08-05
**Deciders:** Barrie Robison (with @ProfessorPolymorphic)
**Related:** [ADR 0001](./0001-product-lifecycle-taxonomy.md) (lifecycle
axis), [ADR 0005](./0005-unified-technology-request-registry.md) (the
all-origin request registry this view draws demand from),
[ADR 0006](./0006-coordination-surface-split.md) (the last IA reshape;
this ADR adds the next primary surface), PR #335 (the five-target
deployment vocabulary and per-target characteristics this view draws
supply from)

## Context

The site tells its story along three axes: **lifecycle** (the pipeline
queue feeding the portfolio, ADR 0001/0005), **problem** (the work-
category chips), and **strategy** (plan alignment, ADR 0002). The
2026-08-05 deployment-target session created a fourth axis —
**destination** — and it is the only axis where *supply* is a real
constraint. The five targets (Databricks dashboard, Nexus module,
standalone on OCI / OIT Kubernetes / RCDS VM) carry maturity states,
operators, and gates (`lib/deployment-targets.ts`), and those states are
unequal: one target is proven, two are sanctioned but unproven, one is
aspirational, and one is transitional by decision.

That makes the harmonized view a **demand-versus-supply** view:

- **Demand** — the project inventory needing homes, and the all-origin
  request queue (which already absorbed the survey candidates via
  Migration 019, so "three populations" is structurally two: activity in
  flight, and activity requested).
- **Supply** — five characterized targets with unequal readiness.
- **The story is the mismatch.** Ten workloads run on a target that is
  transitional by decision, most without confirmed pathway slots.
  Report-shaped demand queues against a Databricks service that is
  aspiration only. Nexus is the one proven path and has known gate
  friction. These are the sentences the coordination effort takes to
  OIT and the CADSO — and no existing surface computes them.

Neither existing primary surface is shaped to hold this. Coordination
holds *process* (how a request moves), Standards holds *reference* (what
work is measured against). A synthesis of state across both sides of
that line, bolted into either, would be exactly the chimeric structure
the owner asked to avoid. It gets its own surface, designed from the
data model up.

## Decision

**Add `UTR Landscape` as a primary sidebar surface at `/utr-landscape`.
It renders one typed read model — the destination-classified activity
set — leading with the computed mismatch ledger, with per-target detail
pages beneath it.**

### The activity abstraction

The surface reads one shape, produced by a single typed module
(`lib/utr-landscape.ts`) joining the existing read paths — nothing on
this surface has its own storage besides the request-side target
columns below:

```
Activity = {
  kind:        "project" | "request"
  ref:         portfolio slug | tech_request id
  name, owner/unit, origin
  position:    lifecycle status (projects) | disposition/track (requests)
  currentTarget:   DeploymentEnvironment | null      // projects only
  proposedTarget:  DeploymentEnvironment | null
  targetConfidence: "confirmed" | "inferred" | null  // requests only
}
```

Projects carry their targets from Migration 024 (`lib/work.ts`).
Requests gain `proposed_deployment_target` + `target_confidence`
(Migration 025), populated by a MindRouter inference pass in the
pattern of the pipeline's inferred-classification chips (PR #333) and
confirmed by a human at triage. **Inferred and confirmed render
distinguishably, always.** Track D requests are Databricks-shaped;
Tracks B/C land on Nexus or a standalone target — the inference prompt
encodes exactly the two-step selection model from
`lib/deployment-targets.ts` (form factor first, then hosting by
operator and risk).

### Sub-decisions

1. **Name and scope.** "UTR Landscape" plants the surface in the
   Unified Technology Request vocabulary — the institutional frame the
   convergence effort is aligning everything under. The lens holds for
   work predating or outside the intake process because the UTR
   vocabulary already accommodates it (the `external` track;
   per-project track derivation in `lib/governance-profile.ts`).
2. **The mismatch ledger leads.** The v1 page opens with computed
   findings — transitional load (what runs on the RCDS VM and whether a
   pathway plan exists), demand on aspirational supply (open requests
   classified to targets that cannot receive them), gate concentration
   (everything queued behind the one proven path) — each a sentence
   with counts computed at build and links to the evidence. The
   per-target bands (*running here / headed here / queued for here*)
   sit below as the evidence layer, maturity chip on each band header.
3. **Per-target detail pages live here**, not under `/coordination`:
   `/utr-landscape/[target]` renders the characterization from
   `lib/deployment-targets.ts` — including `openQuestions` rendered as
   open questions (the Databricks unknowns are themselves a message) —
   plus the target's full activity list. This resolves where the
   characteristics grid ships, deliberately rather than as a seventh
   coordination tab.
4. **Not a second portfolio, not a second pipeline.** One story
   (owner decision 2026-07-24): activity rows link out to
   `/portfolio/[slug]` and `/portfolio/pipeline`; the Landscape adds no
   editing, no alternate queue, and duplicates no detail view. It is a
   projection, and says so.
5. **Honesty rules.** Maturity language comes only from
   `lib/deployment-targets.ts`; every count is computed from the read
   model at render time, never hand-written; a request's inferred
   target is never displayed without its inferred marking; an activity
   with no classification appears in an explicit unclassified pool
   rather than being silently dropped.
6. **Sidebar position.** Directly after Projects — the Landscape is
   "where the work lands" to the portfolio's "what the work is." The
   sidebar grows to seven entries; the IA-narrowness rule guards
   against sub-section entries, and this is a primary surface earning
   its slot by synthesis the others cannot host.

## Delivery

This ADR is PR 1 of the sequence agreed 2026-08-05:

| PR | Scope |
|---|---|
| 1 | This ADR |
| 2 | Migration 025 (`proposed_deployment_target`, `target_confidence` on `tech_requests`) + `lib/requests.ts` read path + MindRouter target-inference pass |
| 3 | `lib/utr-landscape.ts` — the unified read model, per-target rollups, mismatch computations (data only) |
| 4 | The surface MVP: sidebar entry, mismatch ledger, per-target bands |
| 5 | `/utr-landscape/[target]` detail pages (characteristics + open questions + activity list) |
| 6 | Cross-links: project detail pages and pipeline rows into their target; `/coordination/oit-pathway` into the OIT-managed target pages |

Whether the landing page's steering role should feature the Landscape
is explicitly out of scope here — that is a separate decision against
the landing critique arc, taken after the surface exists.

## Consequences

- The sidebar grows to seven primary entries. Accepted: the surface
  synthesizes across the Coordination/Standards line and cannot live on
  either side of it without distortion.
- `tech_requests` gains target columns whose vocabulary CHECK must stay
  in lockstep with `lib/project-governance.ts` — the same two-place
  discipline Migration 024 established for `applications`.
- The mismatch computations become commit-worthy logic: a change to
  what counts as a mismatch is a reviewable diff in
  `lib/utr-landscape.ts`, not copy drift.
- When targets firm up (Databricks service defined, first OCI/K8s
  landing), updating `lib/deployment-targets.ts` reflows the ledger
  automatically — the surface argues from data it does not own.

## Amendment — sixth target (2026-08-07)

The five-target supply model gained a sixth: **Vandalizer workflow**
(`vandalizer-workflow`), a third platform-hosted form factor alongside
the Databricks dashboard and the Nexus module. The trigger was the
question of requests satisfiable by existing IIDS platforms: document-
extraction- and document-Q&A-shaped requests were being forced to a
standalone target or left unclassified when their honest destination is
a workflow inside the already-operating, universally-accessible
Vandalizer platform (Migration 026 widens the CHECKs; the form-factor
step of the selection model gains a document branch).

Two boundaries drawn in the same decision:

- **MindRouter is not a target.** It is an inference gateway
  applications call — a dependency, not a place work lands. A request
  met by "just use chat" closes as `routed-to-existing` with no target;
  a new app calling MindRouter classifies to wherever the app lands.
- **`routed-to-existing` and target classification are complementary,
  not competing.** A request fully met by Vandalizer as it stands
  closes as `routed-to-existing` (interest-pool link to the
  `vandalizer` entry); a request needing a *new* workflow built inside
  the platform classifies to `vandalizer-workflow` and stays in the
  landscape's demand picture.
