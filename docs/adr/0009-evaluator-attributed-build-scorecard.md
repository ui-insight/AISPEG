# ADR 0009 — Evaluator-attributed build scorecard

**Status:** Accepted for the data model and explorer. The rubric itself is
a discussion draft pending Steering/DGC ratification (OD21).
**Date:** 2026-09-24
**Deciders:** Barrie Robison (with @ProfessorPolymorphic)
**Related:** [ADR 0005](./0005-unified-technology-request-registry.md)
(the request registry and the "prioritization model TBD" this fills in),
`lib/rubric.ts` (Prioritization Rubric v2, the model this replaces on
ratification), workbook *UTR - Build Evaluation Scorecard (Four-Bucket,
DRAFT).xlsx* (2026-09-13), superseded by the *second DRAFT* workbook
(2026-09-21) — see the amendment below

## Context

The UTR working group's draft Four-Bucket scorecard drops the v2
rubric's weighted 1–5 composite. Each candidate build gets one row of
real numbers and named facts — a five-year financial case, risk, impact,
feasibility — plus a gate that removes locked-constrained items from
comparison. The only arithmetic is Net 5-Year $, a plain sum.

Two requirements came with it:

1. Score every active project and every open request, and keep the
   justification for each value, not only the value.
2. More than one evaluator will score the same subjects — several
   models, and people. Their answers must stay separable.

## Decision

**Three tables (Migration 030), one grain each.** `scorecard_runs` (one
evaluator's pass against one rubric version, with the method that
produced it), `scorecard_evaluations` (one subject in a run: a project
slug or a request FK, plus the evaluator's summary and sources), and
`scorecard_field_scores` (one field's value with a mandatory
justification and optional evidence pointer).

**Long, not wide.** One row per field rather than 30 value columns plus
30 justification columns. The field vocabulary lives in
`lib/build-scorecard.ts` with no CHECK (the 006/007/008 posture), so a
rubric revision is a TS edit and a new `rubric_version`, not a
migration. `evaluator_kind` (model | human) is structural and CHECKed.

**Unknown is a value.** A NULL value with a justification is a complete
answer. The importer requires all 30 fields on every evaluation, so
"didn't look" and "looked, no basis" can't be confused.

**Net 5-Year $ is computed, never stored.** `netFiveYear()` implements
the workbook's column L and reports which inputs were blank. Where the
spreadsheet silently counts a blank start year as six years of savings,
the code returns no total.

**Evaluators are never merged.** No average, no consensus column. The
explorer shows one run at a time; the subject page puts every
evaluator's value and justification side by side and flags fields where
they differ. Disagreement is the useful signal.

**Runs arrive as interchange files.** `data/scorecards/*.json`, validated
against the typed module by `scripts/import-scorecard.ts` (same posture
as the OIT IDEA import). Request subjects resolve by registry id, then
origin reference, then origin + title, because dev and prod registry
UUIDs differ. A run is keyed by (evaluator, run label); re-importing
replaces it.

## Consequences

- The v2 ClickUp scores and the four-bucket runs coexist until OD21.
  `/portfolio/pipeline` keeps v2; `/portfolio/scorecard` shows the draft.
- Model-produced values are published with the model's name on them.
  The first run (claude-opus-5-5, 2026-09-24) used stated loaded-rate
  conventions for converting time to dollars; its method text says so,
  and its confidence tags carry that honestly. Owners should correct
  facts by adding a human run, not by editing a model's run.
- Subjects are soft-keyed to the portfolio by slug, so a portfolio
  re-seed never wipes scores.

## Amendment — 2026-09-24: second draft adds three bucket scores

The second draft workbook (2026-09-21) keeps all 30 fact fields and
adds one 1–10 judgment score at the end of each of Buckets 2–4, read
against a banded Scoring Guide. Directions differ: **Risk 10 = worst**,
**Impact and Feasibility 10 = best**. Financial stays a dollar figure.
The four figures are read side by side and never combined.

- `lib/build-scorecard.ts` moves to rubric version
  `utr-four-bucket-draft-2026-09-21`: three `score` fields
  (`risk_score`, `impact_score`, `feasibility_score`) with a
  `direction`, and `SCORE_GUIDE` carrying the bands verbatim. No
  migration: scores store in `value_numeric` like any numeric field.
- Surfaces show only runs against the current rubric version, since the
  field sets differ. The first-draft run stays in the database and in
  `data/scorecards/` as history.
- Every score column and score value states its direction, the failure
  the second draft calls out by name.
- The second-draft run carries the first run's facts forward (same
  evaluator, same day), corrects the ones that day's status changes made
  stale, and adds the three scores with band-anchored justifications.
  Its method text says so.
