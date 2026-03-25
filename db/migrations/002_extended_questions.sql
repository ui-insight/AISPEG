-- Migration 002: Extended questions and submission notes
-- Adds granular data source columns and a notes table for admin review.

BEGIN;

ALTER TABLE submission_details ADD COLUMN IF NOT EXISTS data_sources TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE submission_details ADD COLUMN IF NOT EXISTS university_systems TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE submission_details ADD COLUMN IF NOT EXISTS output_types TEXT[] NOT NULL DEFAULT '{}';

CREATE TABLE IF NOT EXISTS submission_notes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id   UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  author          TEXT NOT NULL,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_submission_notes_submission_id ON submission_notes(submission_id);

COMMIT;
