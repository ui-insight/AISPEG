-- Migration 007: Lifecycle Taxonomy
--
-- Mirrors the operational-ladder fields from ADR 0001 into the
-- applications table. The TS module (lib/portfolio.ts) is the source
-- of truth for the InterventionStatus / PublicStage / ProductionScope
-- vocabularies; per the ADR, no CHECK constraints are added at the DB
-- layer (same rationale as 006_work_categories: keep migration cadence
-- decoupled from taxonomy edits).
--
-- The verification rules for each status are spec'd in the ADR and
-- enforced by lib/portfolio-verification.ts (lands in a follow-up PR).
-- This migration is the data shape only.
--
-- Companion to:
--   - docs/adr/0001-product-lifecycle-taxonomy.md
--   - lib/portfolio.ts (Intervention shape extensions)
--   - scripts/seed-portfolio.ts (ports the new fields into this table)

BEGIN;

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS iids_sponsor         TEXT,
  ADD COLUMN IF NOT EXISTS feature_complete     BOOLEAN,
  ADD COLUMN IF NOT EXISTS live_url_is_staging  BOOLEAN,
  ADD COLUMN IF NOT EXISTS pilot_cohort         JSONB,
  ADD COLUMN IF NOT EXISTS production_scope     TEXT,
  ADD COLUMN IF NOT EXISTS support_contact      TEXT,
  ADD COLUMN IF NOT EXISTS sunset_date          DATE,
  ADD COLUMN IF NOT EXISTS replaced_by          TEXT;

-- Index on production_scope so the upcoming /portfolio facet (drill-in
-- by operational status under the public-stage rollup) can filter
-- production rows by scope without a sequential scan.
CREATE INDEX IF NOT EXISTS idx_applications_production_scope
  ON applications(production_scope);

INSERT INTO schema_migrations (version) VALUES ('007_lifecycle_taxonomy')
  ON CONFLICT (version) DO NOTHING;

COMMIT;
