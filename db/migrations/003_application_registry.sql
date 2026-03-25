-- Migration 003: Application Registry & Similarity Detection
-- Tracks every application in the university portfolio and enables
-- duplicate/overlap detection when new submissions arrive.

BEGIN;

-- ── Application Registry ─────────────────────────────────────

CREATE TABLE IF NOT EXISTS applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  name            TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  owner_name      TEXT,
  owner_email     TEXT,
  department      TEXT,
  github_repo     TEXT,                     -- e.g. "ui-insight/my-app"
  url             TEXT,                     -- production URL

  -- Classification (mirrors wizard dimensions)
  tier            INTEGER NOT NULL DEFAULT 1,  -- 1-4
  status          TEXT NOT NULL DEFAULT 'idea',
    -- idea | approved | in-development | staging | production | retired
  sensitivity     TEXT[] NOT NULL DEFAULT '{}',
  complexity      TEXT,
  userbase        TEXT,
  auth_level      TEXT,
  integrations    TEXT[] NOT NULL DEFAULT '{}',
  data_sources    TEXT[] NOT NULL DEFAULT '{}',
  university_systems TEXT[] NOT NULL DEFAULT '{}',
  output_types    TEXT[] NOT NULL DEFAULT '{}',

  -- Provenance
  submission_id   UUID REFERENCES submissions(id) ON DELETE SET NULL,

  -- Timestamps
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_department ON applications(department);
CREATE INDEX IF NOT EXISTS idx_applications_submission_id ON applications(submission_id);

-- GIN indexes for array overlap queries (similarity detection)
CREATE INDEX IF NOT EXISTS idx_applications_sensitivity ON applications USING GIN (sensitivity);
CREATE INDEX IF NOT EXISTS idx_applications_data_sources ON applications USING GIN (data_sources);
CREATE INDEX IF NOT EXISTS idx_applications_university_systems ON applications USING GIN (university_systems);
CREATE INDEX IF NOT EXISTS idx_applications_integrations ON applications USING GIN (integrations);
CREATE INDEX IF NOT EXISTS idx_applications_output_types ON applications USING GIN (output_types);

-- ── Similarity Matches ───────────────────────────────────────
-- Stores pre-computed similarity results between submissions and
-- existing applications so the admin dashboard can show them instantly.

CREATE TABLE IF NOT EXISTS similarity_matches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id   UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  application_id  UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  score           REAL NOT NULL DEFAULT 0,   -- 0.0 to 1.0
  overlap_details JSONB NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(submission_id, application_id)
);

CREATE INDEX IF NOT EXISTS idx_similarity_submission ON similarity_matches(submission_id);
CREATE INDEX IF NOT EXISTS idx_similarity_score ON similarity_matches(score DESC);

-- ── Trigger: auto-update updated_at ──────────────────────────

CREATE OR REPLACE FUNCTION update_applications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_applications_updated_at ON applications;
CREATE TRIGGER trg_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE FUNCTION update_applications_updated_at();

COMMIT;
