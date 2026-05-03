-- Migration 006: Work Categories
--
-- Adds the "by problem" exploration axis to applications. Each row
-- carries 0–3 audience-facing category slugs (e.g. 'documents',
-- 'process', 'reconciliation') so /portfolio cards can show the
-- kinds of operational work each intervention helps with.
--
-- Source of truth for the slug set is lib/work-categories.ts. We
-- intentionally don't add a CHECK constraint enumerating the slugs
-- here — the typed module on the app side is the audit trail, and
-- pinning the slug list at the DB layer would couple migration
-- cadence to taxonomy edits. Membership is enforced by the typed
-- Intervention shape during seed.
--
-- Companion to:
--   - lib/work-categories.ts (taxonomy)
--   - lib/portfolio.ts (Intervention.workCategories)
--   - scripts/seed-portfolio.ts (port into applications.work_categories)

BEGIN;

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS work_categories TEXT[] NOT NULL DEFAULT '{}';

-- GIN index — same pattern as the other multi-valued classification
-- arrays (sensitivity, integrations, etc.) so a future category
-- facet on /portfolio can filter cheaply via @> array overlap.
CREATE INDEX IF NOT EXISTS idx_applications_work_categories
  ON applications USING GIN (work_categories);

INSERT INTO schema_migrations (version) VALUES ('006_work_categories')
  ON CONFLICT (version) DO NOTHING;

COMMIT;
