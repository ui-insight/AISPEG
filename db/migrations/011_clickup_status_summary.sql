-- Migration 011: public status summaries for ClickUp projects
--
-- Colin's call (July 2026): the raw status-update comments are internal
-- notes and should NOT be published verbatim. The public site shows a
-- short generated summary instead; the full comment timeline stays on
-- the auth-gated /internal view. See ADR 0003 (amended).
--
-- The sync generates the summary via MindRouter only when the comment
-- stream has changed since the last summarization (tracked by
-- status_summary_source, the newest comment id at summarization time).

BEGIN;

ALTER TABLE clickup_projects
  ADD COLUMN IF NOT EXISTS status_summary        TEXT,
  ADD COLUMN IF NOT EXISTS status_summary_at     TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status_summary_source TEXT;

COMMIT;
