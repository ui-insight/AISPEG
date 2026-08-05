-- Migration 025: Deployment-target classification on the request registry
--
-- ADR 0008 (UTR Landscape), PR 2 of the delivery sequence: every open
-- request gets a proposed deployment target so the Landscape can show
-- demand against the five-target supply model (Migration 024).
--
-- Posture notes:
--
-- Registry-level, not per-origin: unlike the inferred_* columns on
-- oit_idea_requests (Migration 023), destination classification applies
-- to requests from every origin, so it lives on tech_requests itself.
--
-- CHECKed, not free: ADR 0008 binds this column to the same two-place
-- discipline Migration 024 established for applications — the CHECK
-- here and the vocabulary in lib/project-governance.ts change together.
-- 'platform' is excluded (a request that would stand up a platform
-- converts to a project first) and 'to-be-determined' is excluded
-- (NULL carries "not yet classified"; the Landscape renders NULL rows
-- as an explicit unclassified pool). 'external-hosted' is included
-- because Track A purchase requests land on the vendor's
-- infrastructure — much of the IDEA backlog is expected to classify
-- there.
--
-- Confidence is structural: 'inferred' rows come from the MindRouter
-- pass (scripts/infer-request-targets.ts) with provenance; 'confirmed'
-- requires a named human and a timestamp. Inference NEVER overwrites a
-- confirmed classification, and — mirroring Migrations 019/020/023 —
-- never writes track/stage. Target assignment stays triage's call;
-- the machine only proposes.

BEGIN;

ALTER TABLE tech_requests
  ADD COLUMN proposed_deployment_target TEXT
    CHECK (proposed_deployment_target IN (
      'databricks-dashboard',
      'nexus-module',
      'standalone-oci',
      'standalone-oit-k8s',
      'rcds-vm',
      'oit-managed-tbd',
      'external-hosted',
      'not-applicable'
    )),
  ADD COLUMN target_confidence TEXT
    CHECK (target_confidence IN ('inferred', 'confirmed')),
  ADD COLUMN target_inference_rationale TEXT,
  ADD COLUMN target_inference_model TEXT,
  ADD COLUMN target_inferred_at TIMESTAMPTZ,
  ADD COLUMN target_confirmed_by TEXT,
  ADD COLUMN target_confirmed_at TIMESTAMPTZ,
  -- A classification always carries its confidence, and vice versa.
  ADD CONSTRAINT tech_requests_target_coherence_check CHECK (
    (proposed_deployment_target IS NULL) = (target_confidence IS NULL)
  ),
  -- 'confirmed' is a human act: it names who and when.
  ADD CONSTRAINT tech_requests_target_confirmed_check CHECK (
    target_confidence IS DISTINCT FROM 'confirmed'
    OR (target_confirmed_by IS NOT NULL AND target_confirmed_at IS NOT NULL)
  );

CREATE INDEX idx_tech_requests_proposed_deployment_target
  ON tech_requests (proposed_deployment_target);

COMMIT;
