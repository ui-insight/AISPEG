-- Migration 018: Unified Technology Request registry (ADR 0005, Phase 1)
--
-- The canonical request registry: one row per technology request
-- regardless of origin (TDX ticket, ClickUp backlog task, site
-- submission, direct entry). Per-source projection tables
-- (clickup_requests today, tdx_requests later) remain disposable
-- sync targets; this registry is durable site-canonical memory that
-- links, claims, and decisions attach to.
--
-- Vocabulary posture (mirrors 006/007/008): `origin` is structural and
-- carries a CHECK; `track` / `stage` / `disposition` / event and link
-- types are evolving UTR process vocabularies owned by lib/utr.ts — no
-- CHECK constraints, so taxonomy edits stay decoupled from migration
-- cadence.
--
-- FK posture (mirrors ADR 0004 §1): `submission_id` and request↔request
-- links are real FKs (those tables are never truncated by re-seeds).
-- Anything pointing at the portfolio uses `application_slug` as a soft
-- key, because scripts/seed-portfolio.ts TRUNCATEs applications on
-- every re-seed and a CASCADE FK would silently wipe registry data.

BEGIN;

-- ── tech_requests: the canonical request registry ─────────────

CREATE TABLE IF NOT EXISTS tech_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Where the request entered. Structural enum — extending it is a
  -- deliberate migration, unlike the process vocabularies below.
  origin          TEXT NOT NULL
                  CHECK (origin IN ('tdx', 'clickup', 'site-submission', 'direct')),

  -- Origin references. Soft TEXT ids for external systems; a real FK
  -- for submissions (never truncated). At most one is expected per row;
  -- partial unique indexes below make each an idempotent upsert key.
  tdx_ticket_id   TEXT,
  clickup_task_id TEXT,
  submission_id   UUID REFERENCES submissions(id) ON DELETE SET NULL,

  -- Requestor (named humans are load-bearing UI).
  requestor_name  TEXT,
  requestor_email TEXT,
  requestor_unit  TEXT,

  -- Substance.
  title           TEXT NOT NULL,
  need_statement  TEXT,

  -- Routing state. NULL track/stage = not yet triaged under the UTR
  -- process. Values come from lib/utr.ts (no CHECK by design).
  track           TEXT,
  stage           TEXT,
  approval_level  TEXT,

  -- Outcome. Values from lib/utr.ts (no CHECK by design).
  disposition     TEXT NOT NULL DEFAULT 'open',
  decided_at      TIMESTAMPTZ,
  decided_by      TEXT,
  decision_summary TEXT,

  received_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Idempotent upsert keys per origin reference.
CREATE UNIQUE INDEX IF NOT EXISTS idx_tech_requests_tdx_ticket
  ON tech_requests (tdx_ticket_id) WHERE tdx_ticket_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_tech_requests_clickup_task
  ON tech_requests (clickup_task_id) WHERE clickup_task_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_tech_requests_submission
  ON tech_requests (submission_id) WHERE submission_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_tech_requests_disposition
  ON tech_requests (disposition);
CREATE INDEX IF NOT EXISTS idx_tech_requests_received_at
  ON tech_requests (received_at DESC);

CREATE OR REPLACE FUNCTION update_tech_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_tech_requests_updated_at ON tech_requests;
CREATE TRIGGER trg_tech_requests_updated_at
  BEFORE UPDATE ON tech_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_tech_requests_updated_at();

-- ── tech_request_events: append-only audit trail ──────────────

CREATE TABLE IF NOT EXISTS tech_request_events (
  id           BIGSERIAL PRIMARY KEY,
  request_id   UUID NOT NULL REFERENCES tech_requests(id) ON DELETE CASCADE,
  at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  actor        TEXT,
  -- Values from lib/utr.ts: received | triaged | track-assigned |
  -- stage-advanced | flag-raised | flag-resolved | routed | decision |
  -- merged | converted (no CHECK by design).
  event_type   TEXT NOT NULL,
  from_value   TEXT,
  to_value     TEXT,
  note         TEXT
);

CREATE INDEX IF NOT EXISTS idx_tech_request_events_request
  ON tech_request_events (request_id, at DESC);

-- ── tech_request_links: request ↔ request ─────────────────────

CREATE TABLE IF NOT EXISTS tech_request_links (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id          UUID NOT NULL REFERENCES tech_requests(id) ON DELETE CASCADE,
  related_request_id  UUID NOT NULL REFERENCES tech_requests(id) ON DELETE CASCADE,
  -- duplicate-of | roi-aggregates-to | related (lib/utr.ts).
  link_type           TEXT NOT NULL,
  created_by          TEXT,
  note                TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (request_id <> related_request_id),
  UNIQUE (request_id, related_request_id, link_type)
);

-- ── tech_request_project_links: request ↔ portfolio project ───
-- The graph Barrie's stretch goal runs on: duplicates, expanded use of
-- an existing solution, interest in an underway build, conversion.

CREATE TABLE IF NOT EXISTS tech_request_project_links (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id       UUID NOT NULL REFERENCES tech_requests(id) ON DELETE CASCADE,
  -- Soft key into applications.slug (survives portfolio re-seeds).
  application_slug TEXT NOT NULL,
  -- duplicate-of | expanded-use | interest | converted-to | supersedes |
  -- informs (lib/utr.ts).
  link_type        TEXT NOT NULL,
  -- triage | similarity-engine | admin (lib/utr.ts).
  created_by       TEXT,
  score            REAL,
  note             TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (request_id, application_slug, link_type)
);

CREATE INDEX IF NOT EXISTS idx_tech_request_project_links_slug
  ON tech_request_project_links (application_slug);

-- ── roi_claims: the ROI ledger ────────────────────────────────
-- Claims on projects (soft slug) or requests (FK). Portfolio
-- enterprise-replacement facts remain the source for project
-- bottom-line ROI (rendered directly from lib/portfolio.ts); this
-- table carries request-side claims and non-replacement dimensions,
-- and is what aggregation across the request graph reads.

CREATE TABLE IF NOT EXISTS roi_claims (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Exactly one subject: a portfolio project (soft slug) or a request.
  application_slug  TEXT,
  request_id        UUID REFERENCES tech_requests(id) ON DELETE CASCADE,
  -- hard-dollar-replacement | capacity-fte | cost-avoidance | revenue |
  -- risk-reduction | time-savings (lib/utr.ts; extensible as the
  -- Ben/Scott ROI framework lands — no CHECK by design).
  dimension         TEXT NOT NULL,
  annual_value_usd  NUMERIC(14, 2),
  fte               NUMERIC,
  -- Plain-language justification; every number carries its basis.
  basis             TEXT NOT NULL,
  -- clickup-sync | worksheet | triage | cadso-rubric | owner-attested.
  source            TEXT NOT NULL,
  -- estimated | attested | verified | realized.
  status            TEXT NOT NULL DEFAULT 'estimated',
  effective_fy      TEXT,
  claimed_by        TEXT,
  claimed_at        DATE,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (
    (application_slug IS NOT NULL)::int + (request_id IS NOT NULL)::int = 1
  ),
  CHECK (annual_value_usd IS NOT NULL OR fte IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS idx_roi_claims_application_slug
  ON roi_claims (application_slug);
CREATE INDEX IF NOT EXISTS idx_roi_claims_request
  ON roi_claims (request_id);

DROP TRIGGER IF EXISTS trg_roi_claims_updated_at ON roi_claims;
CREATE TRIGGER trg_roi_claims_updated_at
  BEFORE UPDATE ON roi_claims
  FOR EACH ROW
  EXECUTE FUNCTION update_tech_requests_updated_at();

-- ── Backfill: existing request-shaped rows join the registry ──
-- Idempotent via the per-origin unique keys + ON CONFLICT DO NOTHING;
-- ongoing rows flow in through lib/clickup-sync.ts and the submissions
-- POST route from this migration forward. Registry rows persist even
-- if their projection row is later deleted — the registry is memory,
-- not a mirror.

-- ClickUp backlog → registry. Raw ClickUp status text maps onto the
-- registry disposition vocabulary; unknown statuses stay 'open'.
INSERT INTO tech_requests (
  origin, clickup_task_id, requestor_name, requestor_unit,
  title, need_statement, disposition, received_at
)
SELECT
  'clickup',
  cr.clickup_task_id,
  cr.submitter,
  cr.unit,
  cr.name,
  cr.description,
  CASE lower(cr.status)
    WHEN 'to be reviewed' THEN 'open'
    WHEN 'active'         THEN 'approved'
    WHEN 'rejected'       THEN 'denied'
    WHEN 'complete'       THEN 'converted-to-project'
    ELSE 'open'
  END,
  COALESCE(cr.date_created, cr.synced_at)
FROM clickup_requests cr
ON CONFLICT (clickup_task_id) WHERE clickup_task_id IS NOT NULL
DO NOTHING;

-- Site submissions → registry. Title is the first line of the idea
-- text; the full text is the need statement.
INSERT INTO tech_requests (
  origin, submission_id, requestor_name, requestor_email, requestor_unit,
  title, need_statement, disposition, received_at
)
SELECT
  'site-submission',
  s.id,
  s.submitter_name,
  s.submitter_email,
  s.department,
  left(split_part(s.idea_text, E'\n', 1), 200),
  s.idea_text,
  CASE s.status
    WHEN 'new'         THEN 'open'
    WHEN 'reviewed'    THEN 'open'
    WHEN 'in-progress' THEN 'approved'
    WHEN 'archived'    THEN 'closed'
    ELSE 'open'
  END,
  s.created_at
FROM submissions s
ON CONFLICT (submission_id) WHERE submission_id IS NOT NULL
DO NOTHING;

-- One 'received' audit event per backfilled row that has none yet.
INSERT INTO tech_request_events (request_id, at, actor, event_type, note)
SELECT
  tr.id,
  tr.received_at,
  'migration-018',
  'received',
  'Backfilled into the UTR registry from ' || tr.origin || '.'
FROM tech_requests tr
WHERE NOT EXISTS (
  SELECT 1 FROM tech_request_events e
  WHERE e.request_id = tr.id AND e.event_type = 'received'
);

INSERT INTO schema_migrations (version) VALUES ('018_utr_registry')
  ON CONFLICT (version) DO NOTHING;

COMMIT;
