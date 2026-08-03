// lib/roi-claims.ts
//
// Postgres read module for the ROI claims ledger (roi_claims,
// Migrations 018 + 021). Mirrors the lib/requests.ts pattern: typed
// rows out, SQL in one place, callers never touch the pool directly.
//
// The ledger is kind-discriminated (Migration 021): quantified claims
// carry numbers whose honesty lives in `basis`; qualitative claims
// carry no numbers and their honesty lives in `evidence` (verbatim
// quotes, document paths). The discriminated union below makes every
// renderer handle both — tsc enforces it.
//
// Aggregation guard: only quantified claims may enter a sum. Callers
// never filter by hand; sumQuantified() is the one blessed reducer.

import { query } from "./db";
import { type RoiClaimKind } from "./utr";

interface RoiClaimBase {
  id: string;
  /** Exactly one subject: a portfolio project (soft slug) or a request. */
  applicationSlug: string | null;
  requestId: string | null;
  /** Dimension slug from lib/utr.ts — render via roiDimensionLabel(),
   *  which falls back to the raw slug for vocabulary drift. */
  dimension: string;
  /** Plain-language justification; for qualitative claims, the claim itself. */
  basis: string;
  /** clickup-sync | worksheet | triage | cadso-rubric | owner-attested. */
  source: string;
  /** estimated | attested | verified | realized. */
  status: string;
  effectiveFy: string | null;
  claimedBy: string | null;
  /** ISO date (YYYY-MM-DD). */
  claimedAt: string | null;
}

export interface QuantifiedRoiClaim extends RoiClaimBase {
  kind: "quantified";
  annualValueUsd: number | null;
  fte: number | null;
}

export interface QualitativeRoiClaim extends RoiClaimBase {
  kind: "qualitative";
  /** Verbatim quotes and document paths — mandatory for this kind. */
  evidence: string;
}

export type RoiClaim = QuantifiedRoiClaim | QualitativeRoiClaim;

interface RoiClaimRow {
  id: string;
  application_slug: string | null;
  request_id: string | null;
  claim_kind: string;
  dimension: string;
  // node-postgres returns NUMERIC as string to preserve precision.
  annual_value_usd: string | null;
  fte: string | null;
  basis: string;
  evidence: string | null;
  source: string;
  status: string;
  effective_fy: string | null;
  claimed_by: string | null;
  // node-postgres returns DATE columns as JS Date objects.
  claimed_at: Date | null;
}

function toRoiClaim(row: RoiClaimRow): RoiClaim {
  const base: RoiClaimBase = {
    id: row.id,
    applicationSlug: row.application_slug,
    requestId: row.request_id,
    dimension: row.dimension,
    basis: row.basis,
    source: row.source,
    status: row.status,
    effectiveFy: row.effective_fy,
    claimedBy: row.claimed_by,
    claimedAt: row.claimed_at ? row.claimed_at.toISOString().slice(0, 10) : null,
  };
  // Migration 021's kind-shape constraint guarantees evidence on
  // qualitative rows; anything else — including an unknown kind slug —
  // degrades to quantified rather than corrupting the union (same
  // posture as disposition in lib/requests.ts).
  if (row.claim_kind === ("qualitative" satisfies RoiClaimKind) && row.evidence !== null) {
    return { ...base, kind: "qualitative", evidence: row.evidence };
  }
  return {
    ...base,
    kind: "quantified",
    annualValueUsd:
      row.annual_value_usd === null ? null : Number(row.annual_value_usd),
    fte: row.fte === null ? null : Number(row.fte),
  };
}

const CLAIM_COLUMNS = `
  id, application_slug, request_id, claim_kind, dimension,
  annual_value_usd, fte, basis, evidence, source, status,
  effective_fy, claimed_by, claimed_at`;

/**
 * Claims attached to requests, grouped by request id — the join the
 * pipeline surface reads alongside listTechRequests(). Within a
 * request, quantified claims sort before qualitative, then by
 * dimension, so the numbers lead and the narrative follows.
 */
export async function roiClaimsByRequest(): Promise<Map<string, RoiClaim[]>> {
  const rows = await query<RoiClaimRow>(
    `SELECT ${CLAIM_COLUMNS}
     FROM roi_claims
     WHERE request_id IS NOT NULL
     ORDER BY request_id, claim_kind DESC, dimension, created_at`
  );
  const byRequest = new Map<string, RoiClaim[]>();
  for (const row of rows) {
    const claim = toRoiClaim(row);
    const list = byRequest.get(row.request_id!) ?? [];
    list.push(claim);
    byRequest.set(row.request_id!, list);
  }
  return byRequest;
}

/**
 * Annual USD total across a set of claims. Only quantified claims may
 * enter a sum — qualitative rows carry no numbers by constraint, and
 * this is the one place that rule is enforced in code.
 */
export function sumQuantified(claims: RoiClaim[]): number {
  let total = 0;
  for (const claim of claims) {
    if (claim.kind === "quantified" && claim.annualValueUsd !== null) {
      total += claim.annualValueUsd;
    }
  }
  return total;
}
