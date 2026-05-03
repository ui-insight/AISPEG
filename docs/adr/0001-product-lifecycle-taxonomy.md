# ADR 0001 — Product Lifecycle Taxonomy

**Status:** Accepted
**Date:** 2026-05-03
**Deciders:** Barrie Robison (with @ProfessorPolymorphic), Luke Sheneman (governance scope)
**Supersedes:** the ad-hoc `InterventionStatus` union in [`lib/portfolio.ts`](../../lib/portfolio.ts) (`Planned | Prototype | Piloting | Production | Tracked | Archived`)
**Related:** [#159](https://github.com/ui-insight/AISPEG/issues/159) (governance scope), [#154](https://github.com/ui-insight/AISPEG/issues/154) (work-categories epic — same pattern)

## Context

The AISPEG portfolio catalogs AI interventions across UI units. Status accuracy is load-bearing: a stakeholder reading `/portfolio` makes resourcing decisions partly on what they see. The current six-state union (`Planned | Prototype | Piloting | Production | Tracked | Archived`) has three concrete failure modes:

1. **No distinction between "idea" and "approved-to-build."** `Planned` covers both, so a stakeholder can't tell whether something has an owner or is aspirational.
2. **`Prototype` conflates active development with idle demo state.** A project being built today and a project that was prototyped six months ago and abandoned read identically.
3. **`Production` collapses three different operational realities** — actively maintained, in maintenance-only mode, and being sunset.

Beyond the gaps, the labels are **not measurable**. Nothing in code verifies that a `Production` intervention actually has a `liveUrl` accessible institution-wide, or that a `Piloting` one has an actual cohort. Status drifts because nothing forces it to stay honest.

## Decision

Adopt a **two-layer lifecycle taxonomy** with **measurable verification rules** and **register both layers in the data-governance catalog** under a new `iids-portfolio` domain.

### Layer 1: Operational ladder (9 states + 1 meta)

The day-to-day status IIDS tracks. Each state has a verification rule that can be checked in code.

| Slug | Label | Measurable verification rule |
|---|---|---|
| `idea` | Idea | Has a name and unit-of-interest. **No** committed `operationalOwners[0]` OR **no** committed `iidsSponsor`. `repoUrl` empty or repo has zero commits. |
| `approved` | Approved | Has named `operationalOwners[0]` **AND** named `iidsSponsor` **AND** non-empty `description`. No `liveUrl`. Repo, if present, has < 10 commits OR no commits in the last 14 days. |
| `building` | Building | `repoUrl` set; `lastCommitDate` within last 60 days; no `liveUrl` (or `liveUrl` is staging-only — flagged via a `liveUrlIsStaging: true`); `pilotCohort` empty. |
| `prototype` | Prototype | Demo-able; `liveUrl` may be set (often staging). `pilotCohort` empty. **Either** `lastCommitDate` is older than 30 days **OR** `featureComplete: true` is explicitly set. |
| `piloting` | Piloting | `liveUrl` accessible to a **named cohort**. `pilotCohort` populated with `size > 0` and a bounded `scope` (single unit OR named individuals OR an explicit "limited beta" descriptor). |
| `production` | Production | A **publicly-accessible artifact** exists beyond the original pilot cohort: either (a) a `liveUrl` reachable beyond the pilot, or (b) a public `repoUrl` (`isPrivateRepo: false` or unset) where the repo itself is the consumable deliverable — the path that covers infrastructure, scaffolds, and self-hostable appliances. `productionScope` is `"home-unit"` (entire home unit's users), `"institution-wide"`, or `"external"` (institutional + outside-UI deployments). `supportContact` populated. |
| `maintained` | Maintained | Inherits production's accessibility rule (liveUrl OR public repo). **No commits to `main` in the last 90 days.** No open feature issues — only `bug`-, `security`-, or `chore`-labeled issues. |
| `sunsetting` | Sunsetting | `sunsetDate` set (ISO date, future or recent past). `replacedBy` populated — either a successor intervention `slug` or the literal string `manual-process`. |
| `archived` | Archived | `liveUrl` returns 404, is null, or domain is dead (or, for repo-as-artifact deliverables, `repoUrl` is archived/deleted). Service stopped. Record kept for institutional memory. |
| `tracked` *(meta)* | Tracked | Not built by IIDS. `trackingOnly: true`. Bypasses the operational ladder; the public stage is its own bucket. |

### Layer 2: Public stage rollup (5 buckets)

What stakeholders see. Rolls up automatically from operational state. Stable, low-cardinality, scannable.

| Slug | Label | Maps from | Reader interpretation | Default chip color |
|---|---|---|---|---|
| `exploring` | Exploring | `idea`, `approved` | "Thinking about it / committed to build" | Brand silver (low intensity) |
| `building` | Building | `building`, `prototype` | "Code exists, not yet for real users" | Huckleberry (signal: in motion) |
| `live` | Live | `piloting`, `production`, `maintained` | "In use today" | Clearwater (signal: alive) |
| `retired` | Retired | `sunsetting`, `archived` | "Done or winding down" | Gray (low intensity) |
| `tracked` | Tracked | `tracked` | "Not built by IIDS" | Huckleberry-tint (existing pattern) |

The operational status remains visible as a **secondary chip** on portfolio cards (e.g. `Live · Piloting`). On the landing's stat strip and `/explore`, only public stage shows.

## Three sub-decisions resolved

### 1. Governance domain name → `iids-portfolio`

The catalog already uses domain names that match what the application presents itself as (`audit`, `communications`, `processmapping`). The AISPEG site's user-facing identity is the IIDS portfolio (per [`CLAUDE.md`](../../CLAUDE.md): "AISPEG branding removed from user-facing surfaces"). The historical repo name shouldn't leak into governance schema.

This **resolves [#159](https://github.com/ui-insight/AISPEG/issues/159) in the affirmative**: the IIDS portfolio site registers itself in the data-governance catalog as the `iids-portfolio` domain.

### 2. `Tracked` gets its own public stage

Three options were considered: own stage, roll into whatever the external owner reports, or flat secondary tag with no public stage. We chose **own stage**. Rationale: a stakeholder reading the registry needs to know whether IIDS is responsible for an intervention or is merely tracking it. Hiding that under a `Live`/`Building` rollup obscures the load-bearing distinction.

### 3. `featureComplete` flag, not pure commit-cadence

Pure commit-cadence has false positives — a healthy maintained project with sporadic commits would read as a prototype. The cost of authoring discipline (one boolean) is lower than the cost of stakeholders reading misleading status. The flag is verified, not just claimed: if `featureComplete: true` but the project has no `liveUrl` and the repo's main branch is empty, the verification fails.

### 4. `production` accepts a public repo as the artifact, not just `liveUrl`

The first draft of the rules required a `liveUrl` for `production`. That broke for two real cases in the portfolio: `template-app` is a scaffold consumed by cloning, and `dgx-stack` is a self-hostable appliance — neither is a hosted webapp, and both are honestly in production use. The semantic the rule is reaching for is "**is there a publicly-accessible artifact someone outside the build team can use right now?**" For hosted apps, that's `liveUrl`. For infrastructure, scaffolds, and self-hostable deliverables, the public repo *is* the consumable artifact. Either satisfies the rule. The verifier checks that `repoUrl` is set and `isPrivateRepo` is not true — a private repo with no liveUrl fails, as it should.

## Schema additions to `Intervention`

To make the rules checkable, the `Intervention` interface in [`lib/portfolio.ts`](../../lib/portfolio.ts) gains:

| Field | Type | Why | Authored or derived |
|---|---|---|---|
| `iidsSponsor` | `string` | Distinguishes `idea` from `approved` | Authored |
| `featureComplete` | `boolean?` | Lets `prototype` assert itself even with recent commits | Authored |
| `liveUrlIsStaging` | `boolean?` | Lets `building` retain a staging `liveUrl` without false-positiving into `prototype` | Authored |
| `pilotCohort` | `{ size: number; scope: string; namedUsers?: string[] }?` | Verifies `piloting` | Authored |
| `productionScope` | `"home-unit" \| "institution-wide" \| "external"?` | Verifies `production` | Authored |
| `supportContact` | `string?` | Verifies `production` (someone is on the hook) | Authored |
| `sunsetDate` | `string?` (ISO) | Verifies `sunsetting` | Authored |
| `replacedBy` | `string?` | `sunsetting` → successor pointer | Authored |
| `lastCommitDate` | `string?` (ISO) | Distinguishes `building` ↔ `prototype` and `production` ↔ `maintained` | **Derived** at build time via GitHub API |
| `publicStage` | `PublicStage` | Computed from `status`; cached for query convenience | **Derived** at build time |

All new authored fields are optional on the interface — but the **verification rule** for each operational status enforces them transitively. (E.g. you can't claim `production` without `productionScope` and `supportContact`; tsc won't catch it but the verification CI check will.)

## Verification — locked in code, run in CI

Implementation lands as `lib/portfolio-verification.ts` exporting:

```ts
export interface VerificationProblem {
  slug: string;
  claimedStatus: InterventionStatus;
  problem: string;
  rule: string;
}

export function verifyIntervention(i: Intervention): VerificationProblem[];
export function verifyAll(interventions: Intervention[]): VerificationProblem[];
```

Plus an npm script `npm run verify:portfolio` that fails non-zero if any intervention has problems. CI runs it on every PR. The rules in this ADR are the spec; the file is the executable.

`lastCommitDate` derivation: `scripts/refresh-commit-dates.ts` hits the GitHub API for each `repoUrl`, writes results to an auto-generated `lib/portfolio-meta.ts` (gitignored from manual edits, regenerated like `lib/governance/catalog.ts`). A weekly GitHub Action keeps it fresh.

## Governance registration shape

The `vendor/data-governance` submodule grows a new domain. Initial vocabularies registered under `iids-portfolio`:

| Group | Cardinality | Source of truth |
|---|---|---|
| `InterventionStatus` | 10 values (including `tracked`) | `lib/portfolio.ts` |
| `PublicStage` | 5 values | `lib/portfolio.ts` (derived) |
| `ProductionScope` | 3 values | `lib/portfolio.ts` |
| `Visibility` | 3 values | `lib/portfolio.ts` (existing) |
| `AI4RARelationship` | 5 values | `lib/portfolio.ts` (existing) |
| `WorkCategory` | 8 values | `lib/work-categories.ts` (existing) |

Each value carries `code`, `label`, `displayOrder`, `description`, and (new) a `verificationRule` description string. The implementation of the rule lives in `lib/portfolio-verification.ts`; the catalog records what the rule *is*, not how it's checked.

## Migration of the existing 15 interventions

Status currently claimed → likely re-classification under the new rules. Final assignments happen during the schema PR's data audit; this is a starting point for that conversation.

| Intervention | Current | Likely new | Notes |
|---|---|---|---|
| `stratplan` | Production | `production` (Live) | Verify `productionScope` + `supportContact` |
| `audit-dashboard` | Prototype | `building` (Building) | Active dev; check commit cadence |
| `ucm-daily-register` | Prototype | `prototype` or `piloting` (Building or Live) | Decide based on whether UCM is using it for real issues |
| `embargoed-osp` | Prototype | `building` (Building) | Active dev; embargoed |
| `vandalizer` | Production | `production` (Live) | External deployment confirms `productionScope: "external"` |
| `processmapping` | Prototype | `prototype` (Building) | Demo-able, not yet in regular use |
| `openera` | Production | `production` (Live) | UDM-anchor; institution-wide |
| `execord` | Prototype | `prototype` (Building) | Embargoed deployment |
| `sem-experiential` | Prototype | `building` (Building) | Co-build, active |
| `rfd-career` | Piloting | `piloting` (Live) | Verify `pilotCohort` |
| `mindrouter` | Production | `production` (Live) | Institution-wide infrastructure |
| `dgx-stack` | Production | `production` (Live) | External deployment (SUU) |
| `template-app` | Production | `production` or `maintained` | Check 90-day commit window |
| `oit-data-modernization` | Tracked | `tracked` (Tracked) | Unchanged |
| `nexus` | Production | `production` (Live) | Institution-wide |

## Consequences

**Positive:**
- Status becomes verifiable, not just claimed. CI catches drift.
- Stakeholders get a stable 5-bucket public signal; IIDS gets the operational granularity it needs.
- The taxonomy lives in the governance catalog, picking up drift detection and audit trail by default.
- Resolves [#159](https://github.com/ui-insight/AISPEG/issues/159) for the broader site-IA enums (`Visibility`, `AI4RARelationship`, etc. — all picked up under the same domain).

**Negative:**
- Adds eight authored fields to `Intervention`. Authors carry more discipline.
- Requires a derivation script (`refresh-commit-dates.ts`) and a CI step.
- The 15 existing interventions need a re-classification audit; some statuses will move.
- Couples the AISPEG site's iteration to upstream `vendor/data-governance` for taxonomy edits — the same coupling that already applies to research-admin domain vocabularies. Tradeoff accepted.

**Neutral:**
- The `Tracked` meta-state breaks the ladder pattern slightly, but this is honest — externally-owned interventions don't follow the same lifecycle and should be visibly separated.

## Implementation sequencing

Five PRs, in order. Each ships independently.

1. **This ADR** *(merged)* — locks the design.
2. **Schema PR** — extend `Intervention`, Migration 007 mirrors columns into `applications`, re-classify the 15 existing rows, update `scripts/seed-portfolio.ts`. CI green requires the verification check passes (which won't exist yet — this PR creates the data shape, not the verifier).
3. **Verification PR** — `lib/portfolio-verification.ts` + `npm run verify:portfolio` + `scripts/refresh-commit-dates.ts` + a weekly GitHub Action for derivation. CI now polices status accuracy.
4. **UI PR** — `PublicStage` chip on portfolio cards (primary), operational status chip (secondary). Status filter on `/portfolio` reorganized: top-level by public stage, drill-in by operational. `/explore` and the landing pick up the new public-stage signals. `.impeccable.md` updated.
5. **Governance PR** — add the `iids-portfolio` domain to `vendor/data-governance`, regenerate `lib/governance/*.ts`, drift workflow now polices these vocabularies too. Closes [#159](https://github.com/ui-insight/AISPEG/issues/159).

Roughly 1 → 2 → (3 ‖ 4) → 5. The ADR is load-bearing; the rest is mechanical once rules are locked.
