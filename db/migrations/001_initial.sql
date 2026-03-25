-- Migration 001: Initial schema for AISPEG Application Lifecycle Platform
-- Creates the core submissions tables for the App Builder Guide wizard.

BEGIN;

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  idea_text       TEXT NOT NULL,
  answers         JSONB NOT NULL,
  score           INTEGER NOT NULL,
  tier            INTEGER NOT NULL CHECK (tier BETWEEN 1 AND 4),
  submitter_email TEXT,
  submitter_name  TEXT,
  department      TEXT,
  status          TEXT NOT NULL DEFAULT 'new'
                  CHECK (status IN ('new', 'reviewed', 'in-progress', 'archived')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE submission_details (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id   UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  sensitivity     TEXT[] NOT NULL DEFAULT '{}',
  complexity      TEXT,
  userbase        TEXT,
  auth_level      TEXT,
  integrations    TEXT[] NOT NULL DEFAULT '{}',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_tier ON submissions(tier);
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX idx_submission_details_submission_id ON submission_details(submission_id);

-- Auto-update updated_at on submissions
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

COMMIT;
