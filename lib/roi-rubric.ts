// ============================================================
// ROI Rubric — PENDING the CADSO office's scoring definition
// ============================================================
// The Chief AI and Data Science Officer's office will supply the ROI
// rubric (scoring dimensions + scale) that the institutional intake
// process uses. Until it arrives, ROI is rendered as "assessment
// pending" across the Intake Crosswalk.
//
// When the rubric lands:
//   1. Define RUBRIC_DIMENSIONS + a scoring helper here.
//   2. Flip ROI_RUBRIC_READY to true.
//   3. Populate `roi` on entries in lib/governance-profile.ts.
//
// The `RoiAssessment` shape below is deliberately minimal so it can be
// replaced without churn once the real dimensions are known.
// ============================================================

export interface RoiAssessment {
  /** Rolled-up score, once a rubric exists. */
  score?: number;
  /** Human-readable range the score lives in, e.g. "0–100". */
  scale?: string;
  /** Plain-language ROI statement for a governance reviewer. */
  summary?: string;
  /** ISO date the assessment was made. */
  assessedOn?: string;
}

// Flip to `true` once RUBRIC_DIMENSIONS + scoring exist. Consumers use
// this to decide between "assessment pending" and a real score display.
export const ROI_RUBRIC_READY = false as const;

// ============================================================
// Bottom-line ROI — hard-dollar savings from replacing software
// and contracts (the institutional prioritization principle the
// UTR working group adopted in July 2026; see ADR 0005).
// ============================================================
// Distinct from the rubric above and from capacity estimates:
// bottom-line ROI is derived from each project's declared
// enterprise-system replacement facts (lib/project-governance.ts,
// Migration 012), so every dollar traces to a named incumbent
// contract. No replacement declared → no bottom-line claim.

import type { EnterpriseSystemReplacement } from "./project-governance";

export interface BottomLineRoi {
  /** Annual hard-dollar savings once the incumbent contract retires. */
  annualUsd: number;
  /** The incumbent system whose contract the project replaces. */
  systemName: string;
  /** ISO date the incumbent contract next renews, when known. */
  renewalDate?: string;
}

export function bottomLineFromReplacement(
  replacement: EnterpriseSystemReplacement
): BottomLineRoi | null {
  if (replacement.status !== "yes") return null;
  return {
    annualUsd: replacement.annualCostUsd,
    systemName: replacement.systemName,
    renewalDate: replacement.renewalDate,
  };
}

/** "$150,000/yr" — full form for cards and the coverage strip. */
export function formatAnnualUsd(amount: number): string {
  return `$${amount.toLocaleString("en-US")}/yr`;
}

/** "$150k/yr" — compact form for dense matrix cells. */
export function formatAnnualUsdCompact(amount: number): string {
  const thousands = Math.round(amount / 1000);
  return `$${thousands.toLocaleString("en-US")}k/yr`;
}

/** "Mar 31, 2027" — renewal dates in running text. */
export function formatRenewalDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}
