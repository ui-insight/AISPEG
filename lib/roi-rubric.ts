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
