-- Migration 023: OIT IDEA form ingestion (ADR 0005)
--
-- The OIT IDEA form is the request front door ADR 0005 anticipated
-- arriving "as a TDX ticket — with no shared identity". It arrived
-- first as a manual spreadsheet export (data/oit-idea/*.json,
-- 58 requests as of the 2026-08-02 cut), so this follows the ADR 0004
-- projection pattern: a disposable per-source projection table
-- (`oit_idea_requests`, re-importable on each new export cut) plus a
-- durable mirror into the canonical `tech_requests` registry.
--
-- Origin posture: `origin` is structural and CHECKed (Migration 018).
-- 'oit-idea' is added here as a deliberate extension. It is distinct
-- from 'tdx' on purpose: 'tdx' is reserved for the enhanced unified
-- intake form the 7/20 decision assigns to TDX (synced via the future
-- scripts/sync-tdx.ts once API access lands); 'oit-idea' is the
-- current-generation IDEA form whose backlog reaches us as export
-- cuts. If OIT later confirms the IDEA form is TDX-hosted and
-- supplies ticket ids, a follow-up migration can backfill
-- tech_requests.tdx_ticket_id alongside oit_idea_key without
-- re-originating rows.
--
-- Key posture: this export cut carries no ticket id, so the upsert
-- key (`oit_idea_key` here, `source_key` on the projection) is
-- derived: sha256 of "<title>|<created raw timestamp>". Deterministic
-- across re-imports of the same rows, but fragile against OIT editing
-- a title upstream — a renamed title mints a new key and a duplicate
-- row. Acceptable for a point-in-time bootstrap; switch the key to
-- OIT's real ticket id (with a mapping migration) as soon as an
-- export cut includes one.
--
-- Inference posture: the inferred_* columns are the landing zone for
-- the MindRouter structured-extraction pass over the prose
-- descriptions. They are advisory machine claims, never
-- requestor-stated fact: provenance rides along (inference_model,
-- inferred_at), surfaces must label them as inferred, and — mirroring
-- Migrations 019/020 — they never write tech_requests.track/stage.
-- Track assignment stays triage's call. No CHECKs on inferred values
-- (evolving vocabulary, owned by lib/ once the inference script
-- lands; same posture as track/stage/disposition in 018).

BEGIN;

-- ── tech_requests: admit the new origin + its upsert key ─────────────

ALTER TABLE tech_requests
  DROP CONSTRAINT IF EXISTS tech_requests_origin_check;
ALTER TABLE tech_requests
  ADD CONSTRAINT tech_requests_origin_check
  CHECK (origin IN ('tdx', 'clickup', 'site-submission', 'direct', 'oit-idea'));

ALTER TABLE tech_requests
  ADD COLUMN IF NOT EXISTS oit_idea_key TEXT;

-- Idempotent upsert key, same shape as the other per-origin refs.
CREATE UNIQUE INDEX IF NOT EXISTS idx_tech_requests_oit_idea_key
  ON tech_requests (oit_idea_key) WHERE oit_idea_key IS NOT NULL;

-- ── oit_idea_requests: disposable per-source projection ──────────────

CREATE TABLE IF NOT EXISTS oit_idea_requests (
  -- sha256("<title>|<createdRaw>") — provisional key, see header.
  source_key    TEXT PRIMARY KEY,

  -- Raw export columns, verbatim.
  title         TEXT NOT NULL,
  description   TEXT NOT NULL,
  requestor     TEXT NOT NULL,
  dept          TEXT NOT NULL,
  -- OIT's workflow status text ("Received" | "In Progress" |
  -- "On Hold" in the 2026-08-02 cut). Kept verbatim, normalized at
  -- read time so upstream renames degrade loudly (clickup_requests
  -- posture).
  oit_status    TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL,
  modified_at   TIMESTAMPTZ NOT NULL,

  -- Which export cut last touched this row.
  source_cut    DATE NOT NULL,

  -- MindRouter inference layer (advisory; populated by a later
  -- extraction script; see header).
  inferred_track           TEXT,
  inferred_ai_involvement  TEXT,
  inferred_tool            TEXT,
  inferred_need_summary    TEXT,
  inferred_audience_scope  TEXT,
  inferred_data_signals    TEXT[],
  inference_model          TEXT,
  inferred_at              TIMESTAMPTZ,

  synced_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_oit_idea_requests_created
  ON oit_idea_requests (created_at DESC);

COMMIT;
