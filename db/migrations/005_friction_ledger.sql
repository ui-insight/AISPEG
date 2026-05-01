-- Migration 005: Friction Ledger
--
-- Sprint 2 of the May 2026 refactor. Adds the data shape that lets the
-- /portfolio surface render projects from Postgres instead of from
-- lib/portfolio.ts, with first-class support for blockers (the friction
-- ledger) and a graduated public/internal/embargoed visibility model.
--
-- After this migration applies, run scripts/seed-portfolio.ts to port
-- lib/portfolio.ts entries into the applications + blockers tables.

BEGIN;

-- ── Applications: add intervention-shape columns ─────────────

-- URL slug for /portfolio/[slug] routing. Unique per row.
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- One-line elevator pitch shown in cards.
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS tagline TEXT;

-- Home units (typically 1, occasionally several). Replaces the single
-- `department` column for portfolio rendering; `department` stays for
-- backward compat with the submission flow.
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS home_units TEXT[] NOT NULL DEFAULT '{}';

-- Operational owners as a JSON array of {name, title?} so the title
-- carries with the name without an extra join table.
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS operational_owners JSONB NOT NULL DEFAULT '[]';

-- Units / teams that contributed to building the intervention.
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS build_participants TEXT[] NOT NULL DEFAULT '{}';

-- Free-form tags (e.g. "diffusion", "ai4ra-core"). Independent of
-- the wizard-driven sensitivity/integrations arrays.
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

-- Visibility tier per REFACTOR.md graduated-by-audience model.
--   'public'    — fully public, all detail visible
--   'embargoed' — acknowledged on the public site, deployment detail held
--   'internal'  — not on the public site at all
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS visibility_tier TEXT NOT NULL DEFAULT 'internal'
    CHECK (visibility_tier IN ('public', 'embargoed', 'internal'));

-- ClickUp linkage for Sprint 3 wiring. Postgres is canonical for
-- identity/classification; ClickUp is canonical for status/blockers/workflow.
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS clickup_task_id TEXT;

-- AI4RA relationship: 'Core' | 'Adjacent' | 'Reference' | 'UI-parallel' | 'None'
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS ai4ra_relationship TEXT NOT NULL DEFAULT 'None';

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS dual_destiny_planned BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS external_deployments TEXT[] NOT NULL DEFAULT '{}';

-- Institutional review status: 'OIT-endorsed' | 'Under OIT review' | 'N/A'
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS institutional_review_status TEXT;

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS repo_url TEXT;

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS docs_url TEXT;

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS live_url TEXT;

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS is_private_repo BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS funding TEXT;

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS operational_function TEXT;

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS operational_excellence_outcome TEXT;

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS features TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS tech TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS tracking_only BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS related_slugs TEXT[] NOT NULL DEFAULT '{}';

-- Indexes for the new query patterns
CREATE INDEX IF NOT EXISTS idx_applications_slug ON applications(slug);
CREATE INDEX IF NOT EXISTS idx_applications_visibility_tier ON applications(visibility_tier);
CREATE INDEX IF NOT EXISTS idx_applications_home_units ON applications USING GIN (home_units);
CREATE INDEX IF NOT EXISTS idx_applications_tags ON applications USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_applications_clickup_task_id ON applications(clickup_task_id);

-- ── Blockers: the friction ledger ─────────────────────────────
--
-- Every application carries zero or more blockers. Each blocker has a
-- category (one of the 14 defined in REFACTOR.md), an optional named
-- party (OIT, Vendor X, etc.), the date the block began, public-safe
-- text, internal-only text, and a severity. Resolution closes a blocker
-- without deleting it so the audit trail persists.

CREATE TABLE IF NOT EXISTS blockers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,

  -- One of the 14 categories from REFACTOR.md:
  --   oit-review, oit-standards, unit-engagement, legal-embargo,
  --   hardware-procurement, funding, data-governance, compliance,
  --   personnel, iids-capacity, inter-unit-politics, communications,
  --   external-partner, faculty-governance
  category        TEXT NOT NULL,

  -- The party most directly responsible for unblocking, if any.
  -- Examples: 'OIT', 'Vendor: Anthropic', 'Unit: SEM'.
  named_party     TEXT,

  -- Date the block began (when the ball moved into someone else's court).
  since           DATE NOT NULL,

  -- Public-safe text. Factual, dated, no editorializing. Shown on
  -- /portfolio.
  public_text     TEXT,

  -- Sharper detail with named individuals, contact history, severity
  -- specifics. Shown only on /internal/portfolio. Embargoed records
  -- live entirely here.
  internal_text   TEXT,

  severity        TEXT NOT NULL DEFAULT 'medium'
    CHECK (severity IN ('low', 'medium', 'high')),

  -- Setting resolved_at moves the blocker out of "active." History
  -- preserved.
  resolved_at     DATE,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blockers_application_id ON blockers(application_id);
-- Partial index — most queries want active (unresolved) blockers only.
CREATE INDEX IF NOT EXISTS idx_blockers_category_active
  ON blockers(category)
  WHERE resolved_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_blockers_since ON blockers(since);

-- updated_at trigger for blockers (mirrors the applications pattern)
CREATE OR REPLACE FUNCTION update_blockers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_blockers_updated_at ON blockers;
CREATE TRIGGER trg_blockers_updated_at
  BEFORE UPDATE ON blockers
  FOR EACH ROW
  EXECUTE FUNCTION update_blockers_updated_at();

-- ── Schema migrations tracking ─────────────────────────────────
-- Lightweight version table so the migration runner knows what's applied.
-- Idempotent: re-running this migration is a no-op once the row exists.

CREATE TABLE IF NOT EXISTS schema_migrations (
  version     TEXT PRIMARY KEY,
  applied_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO schema_migrations (version) VALUES ('005_friction_ledger')
  ON CONFLICT (version) DO NOTHING;

COMMIT;
