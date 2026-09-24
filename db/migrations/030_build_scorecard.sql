-- Migration 030: UTR Build Evaluation Scorecard — evaluator-attributed scores
--
-- The Four-Bucket Model (lib/build-scorecard.ts; workbook "UTR - Build
-- Evaluation Scorecard (Four-Bucket, DRAFT).xlsx", 2026-09-13) records
-- real numbers and named facts per candidate build instead of a weighted
-- 1–5 index. This migration stores those facts with who said them and why.
--
-- Three tables, one grain each:
--
--   scorecard_runs        — one scoring pass by one evaluator (a model or
--                           a person) against one rubric version. Several
--                           evaluators score the same subjects; runs keep
--                           them separable so surfaces can compare them
--                           side by side rather than average them.
--   scorecard_evaluations — one subject (a portfolio project or a UTR
--                           request) scored within a run, with the
--                           evaluator's overall read and sources.
--   scorecard_field_scores — one rubric field's value for one evaluation,
--                           with a mandatory justification. A NULL value
--                           is an honest "unknown"; the justification
--                           says what is missing.
--
-- Vocabulary posture (mirrors 018): `evaluator_kind` is structural — it
-- changes how a run is read (a model's pass vs. a person's attestation)
-- — so it carries a CHECK. `field_key`, enum slugs, and `rubric_version`
-- are owned by lib/build-scorecard.ts with no CHECK, so a rubric
-- revision doesn't wait on a migration. Net 5-Year $ is not stored; it
-- is the workbook's plain formula, computed at read time from the
-- stored inputs (netFiveYear in lib/build-scorecard.ts).
--
-- Subject posture (mirrors roi_claims, 018): exactly one of a soft
-- application_slug (survives portfolio re-seeds, which TRUNCATE
-- applications) or a real FK to tech_requests.

BEGIN;

CREATE TABLE IF NOT EXISTS scorecard_runs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rubric_version  TEXT NOT NULL,
  evaluator_kind  TEXT NOT NULL CHECK (evaluator_kind IN ('model', 'human')),
  -- Model id (e.g. 'claude-opus-5-5') or a person's name.
  evaluator       TEXT NOT NULL,
  -- Display name, e.g. 'Claude Opus 5.5'.
  evaluator_label TEXT,
  -- Distinguishes repeat passes by the same evaluator.
  run_label       TEXT NOT NULL,
  -- How the run was produced: instructions, conventions (loaded rates),
  -- source snapshot. Read alongside every score in the run.
  method          TEXT NOT NULL,
  -- The interchange file the run was imported from, for provenance.
  source_file     TEXT,
  scored_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (evaluator, run_label)
);

CREATE TABLE IF NOT EXISTS scorecard_evaluations (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id           UUID NOT NULL REFERENCES scorecard_runs(id) ON DELETE CASCADE,
  -- Exactly one subject.
  application_slug TEXT,
  request_id       UUID REFERENCES tech_requests(id) ON DELETE CASCADE,
  -- The evaluator's overall read: what the facts say, the biggest unknown.
  summary          TEXT NOT NULL,
  -- Documents and records consulted.
  sources          TEXT[] NOT NULL DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (
    (application_slug IS NOT NULL)::int + (request_id IS NOT NULL)::int = 1
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_scorecard_evaluations_run_app
  ON scorecard_evaluations (run_id, application_slug)
  WHERE application_slug IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_scorecard_evaluations_run_request
  ON scorecard_evaluations (run_id, request_id)
  WHERE request_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_scorecard_evaluations_app
  ON scorecard_evaluations (application_slug);
CREATE INDEX IF NOT EXISTS idx_scorecard_evaluations_request
  ON scorecard_evaluations (request_id);

CREATE TABLE IF NOT EXISTS scorecard_field_scores (
  evaluation_id  UUID NOT NULL REFERENCES scorecard_evaluations(id) ON DELETE CASCADE,
  -- A SCORECARD_FIELDS key (lib/build-scorecard.ts).
  field_key      TEXT NOT NULL,
  -- Numeric kinds (usd, count, months, year) use value_numeric; date
  -- (ISO), text, and enum (slug) use value_text. Both NULL = unknown.
  value_numeric  NUMERIC(14, 2),
  value_text     TEXT,
  justification  TEXT NOT NULL CHECK (btrim(justification) <> ''),
  -- Where the fact came from, when citable.
  evidence       TEXT,

  PRIMARY KEY (evaluation_id, field_key),
  CHECK (value_numeric IS NULL OR value_text IS NULL)
);

CREATE INDEX IF NOT EXISTS idx_scorecard_field_scores_field
  ON scorecard_field_scores (field_key);

INSERT INTO schema_migrations (version) VALUES ('030_build_scorecard')
  ON CONFLICT (version) DO NOTHING;

COMMIT;
