-- Migration 008: strategic_plan_alignment column on applications
--
-- Adds the project-side half of the bidirectional project ↔ strategic-plan
-- relationship (epic #100, slice #101). Each row carries an array of
-- priority codes (e.g. {"A.1", "D.2"}) drawn from the typed catalog at
-- lib/strategic-plan/catalog.ts. The set ships empty for every existing
-- intervention; IIDS fills in alignment over time.
--
-- Validation: unknown codes are caught at build time by
-- scripts/verify-portfolio.ts (CI-gated). The DB column is intentionally
-- a plain TEXT[] without a CHECK constraint — the catalog is the source
-- of truth, and gating in TypeScript keeps the rule colocated with the
-- rest of the portfolio shape verification (ADR 0001 pattern).

ALTER TABLE applications
  ADD COLUMN strategic_plan_alignment TEXT[] NOT NULL DEFAULT '{}'::text[];
