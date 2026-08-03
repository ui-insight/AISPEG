-- Migration 021: qualitative ROI claims — kind-discriminated ledger.
--
-- roi_claims (Migration 018) required every claim to carry a number
-- (annual_value_usd or fte), which made narrative-only ROI cases —
-- like Ben Hunter's five-part VandalChat justification — unrecordable.
-- This migration keeps ONE ledger and discriminates by kind instead of
-- adding a parallel "impact narratives" table.
--
-- Vocabulary posture: `claim_kind` is structural — it changes what
-- integrity means for the row — so it carries a CHECK, mirroring
-- tech_requests.origin. The kind-shape constraint is deliberately
-- two-sided: a qualitative claim may NOT carry numbers (if you can put
-- a number on it, it's quantified — no half-quantified rows), and
-- where a quantified claim's honesty lives in `basis`, a qualitative
-- claim's honesty lives in `evidence` (verbatim quotes, document
-- paths), so evidence is mandatory for that kind.
--
-- Promotion path: when a qualitative claim gains real numbers, the row
-- flips kind and gains values in one UPDATE — the updated_at trigger
-- dates the promotion. No supersession machinery.
--
-- Aggregation guard: anything summing the ledger must filter
-- claim_kind = 'quantified' explicitly (lib/roi-claims.ts is the read
-- seam). The portfolio bottom-line number is unaffected — it derives
-- from lib/portfolio.ts replacement facts, not this table.

BEGIN;

ALTER TABLE roi_claims
  ADD COLUMN IF NOT EXISTS claim_kind TEXT NOT NULL DEFAULT 'quantified';
ALTER TABLE roi_claims
  ADD COLUMN IF NOT EXISTS evidence TEXT;

DO $$
DECLARE
  numbers_check TEXT;
BEGIN
  -- Structural CHECK on claim_kind (named, so later migrations can
  -- evolve it deliberately).
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'roi_claims'::regclass AND conname = 'roi_claims_claim_kind'
  ) THEN
    ALTER TABLE roi_claims ADD CONSTRAINT roi_claims_claim_kind
      CHECK (claim_kind IN ('quantified', 'qualitative'));
  END IF;

  -- Drop 018's numbers-required check. It was created inline and
  -- auto-named, so find it by definition: it is the only check besides
  -- the ones this migration names that mentions annual_value_usd
  -- (the subject-XOR check mentions only application_slug/request_id).
  SELECT conname INTO numbers_check
  FROM pg_constraint
  WHERE conrelid = 'roi_claims'::regclass
    AND contype = 'c'
    AND conname NOT IN ('roi_claims_claim_kind', 'roi_claims_kind_shape')
    AND pg_get_constraintdef(oid) ILIKE '%annual_value_usd%';
  IF numbers_check IS NOT NULL THEN
    EXECUTE format('ALTER TABLE roi_claims DROP CONSTRAINT %I', numbers_check);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'roi_claims'::regclass AND conname = 'roi_claims_kind_shape'
  ) THEN
    ALTER TABLE roi_claims ADD CONSTRAINT roi_claims_kind_shape CHECK (
      (claim_kind = 'quantified'
        AND (annual_value_usd IS NOT NULL OR fte IS NOT NULL))
      OR
      (claim_kind = 'qualitative'
        AND annual_value_usd IS NULL AND fte IS NULL AND evidence IS NOT NULL)
    );
  END IF;
END $$;

INSERT INTO schema_migrations (version) VALUES ('021_qualitative_roi_claims')
  ON CONFLICT (version) DO NOTHING;

COMMIT;
