-- Migration 010: ClickUp ingestion (IIDS-AI4UI space)
--
-- Read-side of the Sprint 3b ClickUp wiring (see ADR 0004). Stores data
-- synced from the IIDS-AI4UI ClickUp space: per-project status narrative
-- and ROI (from each project list's "Project Notes" task), and the scored
-- intake backlog (from the "AI4UI New Project Requests" list).
--
-- Deliberately NO foreign keys to `applications`: scripts/seed-portfolio.ts
-- does `TRUNCATE applications RESTART IDENTITY CASCADE` on every re-seed,
-- and a CASCADE FK here would silently wipe synced data. The join to a
-- portfolio slug happens at read time via the typed map in
-- lib/clickup-map.ts, so seed and sync are order-independent and each
-- individually idempotent.

BEGIN;

-- One row per ClickUp project list in the IIDS-AI4UI space. Fields come
-- from the list's "Project Notes" task (task type "Project Detail",
-- custom_item_id 1007).
CREATE TABLE IF NOT EXISTS clickup_projects (
  clickup_list_id       TEXT PRIMARY KEY,
  name                  TEXT NOT NULL,
  -- Task id of the "Project Notes" task the fields below came from.
  notes_task_id         TEXT,
  -- Estimated capacity returned, in FTE (ClickUp "ROI-FTE" number field).
  roi_fte               NUMERIC,
  roi_explanation       TEXT,
  -- Arrays of { "name": string, "email": string | null }.
  leads                 JSONB NOT NULL DEFAULT '[]',
  pocs                  JSONB NOT NULL DEFAULT '[]',
  stakeholders          JSONB NOT NULL DEFAULT '[]',
  repo_url              TEXT,
  projected_completion  DATE,
  scope                 TEXT,
  business_unit         TEXT,
  synced_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Dated narrative status updates: the comments on each "Project Notes"
-- task. Soft reference to clickup_projects via clickup_list_id.
CREATE TABLE IF NOT EXISTS clickup_status_updates (
  comment_id        TEXT PRIMARY KEY,
  clickup_list_id   TEXT NOT NULL,
  author            TEXT,
  posted_at         TIMESTAMPTZ NOT NULL,
  body_text         TEXT NOT NULL,
  synced_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Timeline rendering reads newest-first per project.
CREATE INDEX IF NOT EXISTS idx_clickup_status_updates_list
  ON clickup_status_updates (clickup_list_id, posted_at DESC);

-- The scored intake backlog ("AI4UI New Project Requests" form responses).
-- The 11 rubric criteria are a fixed instrument defined by the ClickUp
-- form; explicit columns keep the read layer typed end-to-end and make a
-- rubric change a visible migration instead of silent JSONB drift.
CREATE TABLE IF NOT EXISTS clickup_requests (
  clickup_task_id  TEXT PRIMARY KEY,
  name             TEXT NOT NULL,
  -- Raw ClickUp status text ("to be reviewed", "active", "rejected",
  -- "complete"). Normalized to a typed union at read time so upstream
  -- renames degrade loudly instead of corrupting stored data.
  status           TEXT NOT NULL,
  description      TEXT,
  unit             TEXT,
  submitter        TEXT,
  category         TEXT,
  feasibility      TEXT,
  -- A: strategy/impact (weight 0.1 each)
  rubric_a1        NUMERIC,
  rubric_a2        NUMERIC,
  rubric_a3        NUMERIC,
  rubric_a4        NUMERIC,
  -- B: feasibility/effort (weight 0.075 each)
  rubric_b1        NUMERIC,
  rubric_b2        NUMERIC,
  rubric_b3        NUMERIC,
  rubric_b4        NUMERIC,
  -- C: urgency/buy-in (weight 0.1 each)
  rubric_c1        NUMERIC,
  rubric_c2        NUMERIC,
  rubric_c3        NUMERIC,
  -- ClickUp's "Weighted Score" formula value; when the API omits it and
  -- all 11 rubric values are present, the sync computes the same formula
  -- and marks score_source = 'computed'.
  weighted_score   NUMERIC,
  score_source     TEXT NOT NULL DEFAULT 'clickup'
                   CHECK (score_source IN ('clickup', 'computed')),
  date_created     TIMESTAMPTZ,
  date_updated     TIMESTAMPTZ,
  synced_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One row per sync run (script cron or /internal button). Powers the
-- freshness stamps on the public surfaces and the button's feedback.
CREATE TABLE IF NOT EXISTS clickup_sync_runs (
  id           BIGSERIAL PRIMARY KEY,
  started_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at  TIMESTAMPTZ,
  ok           BOOLEAN,
  trigger      TEXT NOT NULL CHECK (trigger IN ('cron', 'manual')),
  -- Counts per table plus any warnings, e.g. a list missing its
  -- "Project Notes" task.
  summary      JSONB,
  error        TEXT
);

COMMIT;
