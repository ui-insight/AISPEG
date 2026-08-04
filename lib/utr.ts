// ============================================================
// Unified Technology Request — process vocabulary (ADR 0005)
// ============================================================
// The typed source of truth for the UTR process vocabularies the
// registry tables in Migration 018 deliberately leave un-CHECKed:
// tracks, per-track stages, dispositions, origins, event and link
// types. Editing a vocabulary here is the taxonomy change; tsc
// surfaces every consumer (006/007/008 pattern).
//
// Source process: the July 2026 "Unified Technology Request Process"
// draft (one intake form, three tracks, DATA/AI/BUY flags, two gates).
// Flag and gate vocabularies land with their tables in ADR 0005
// Phase 3; this module carries what Phase 1 writes and renders.

// ---- Tracks -----------------------------------------------------------
// Fast Lane / Track A / B / C from the request routing, plus `external`
// for work tracked in the inventory that predates (or sits outside) the
// IIDS build pipeline. Also used by the Intake Crosswalk's per-project
// track derivation (lib/governance-profile.ts).

export type IntakeTrack =
  | "fast-lane"
  | "track-a"
  | "track-b"
  | "track-c"
  | "external";

export const INTAKE_TRACK_LABEL: Record<IntakeTrack, string> = {
  "fast-lane": "Fast Lane",
  "track-a": "Track A · Standard software",
  "track-b": "Track B · Built in-house",
  "track-c": "Track C · Idea / concept",
  external: "External — tracked",
};

// Compact labels for dense matrix/table views, where the full
// "Track B · Built in-house" string is too wide. Pair with the title
// tooltip (INTAKE_TRACK_TITLE) so the short form stays legible.
export const INTAKE_TRACK_SHORT: Record<IntakeTrack, string> = {
  "fast-lane": "Fast Lane",
  "track-a": "A",
  "track-b": "B",
  "track-c": "C",
  external: "Ext",
};

export const INTAKE_TRACK_TITLE: Record<IntakeTrack, string> = {
  "fast-lane": "Fast Lane — low-risk individual purchase, automated approval.",
  "track-a": "Track A — commercial purchase or subscription requiring governance review.",
  "track-b": "Track B — fully realized in-house application needing security and operational acceptance.",
  "track-c": "Track C — early-stage build requiring feasibility assessment and the development queue.",
  external: "External — owned outside IIDS; tracked in the inventory, not routed through the intake process.",
};

export function isIntakeTrack(value: unknown): value is IntakeTrack {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(INTAKE_TRACK_LABEL, value)
  );
}

// ---- Per-track stages -------------------------------------------------
// The named boxes on the process flowchart, in order. Nothing writes
// stages yet (triage under the UTR hasn't started); the vocabulary
// ships so flag/gate work in later phases writes against typed slugs.

export interface UtrStage {
  slug: string;
  label: string;
}

export const UTR_STAGES: Record<Exclude<IntakeTrack, "external">, UtrStage[]> =
  {
    "fast-lane": [
      { slug: "auto-screen", label: "Automated screen" },
      { slug: "purchase", label: "Purchase" },
    ],
    "track-a": [
      { slug: "scorecard", label: "Project scorecard" },
      { slug: "board-first-review", label: "Advisory board first review" },
      { slug: "assessment", label: "Assessment" },
      { slug: "approval-decision", label: "Approval decision" },
      { slug: "decision-documented", label: "Decision documented" },
      { slug: "prioritization", label: "Prioritization" },
      { slug: "purchase-or-project", label: "Purchase or project" },
    ],
    "track-b": [
      { slug: "technical-intake", label: "Technical intake" },
      { slug: "security-review", label: "Security review" },
      { slug: "flag-reviews", label: "Flag reviews" },
      { slug: "acceptance-gate", label: "OIT acceptance gate" },
      { slug: "prioritization", label: "Prioritization" },
      { slug: "hosting-handoff", label: "Hosting & handoff" },
      { slug: "operate", label: "Operate" },
    ],
    "track-c": [
      { slug: "build-registration", label: "Build registration" },
      { slug: "feasibility-scoping", label: "Feasibility & scoping" },
      { slug: "standards-gate", label: "Early standards gate" },
      { slug: "design-flag-reviews", label: "Design-stage flag reviews" },
      { slug: "prioritization", label: "Prioritization" },
      { slug: "development", label: "Development" },
    ],
  };

// ---- Request origins --------------------------------------------------
// Structural (CHECKed in Migrations 018 + 023): where a request
// entered. 'oit-idea' is the current OIT IDEA form, reaching us as
// spreadsheet export cuts (scripts/import-idea-requests.ts); 'tdx' is
// reserved for the enhanced unified intake form the 7/20 decision
// assigns to TDX, once API access lands.

export type RequestOrigin =
  | "tdx"
  | "clickup"
  | "site-submission"
  | "direct"
  | "oit-idea";

export const REQUEST_ORIGIN_LABEL: Record<RequestOrigin, string> = {
  tdx: "TDX",
  clickup: "ClickUp intake",
  "site-submission": "Site submission",
  direct: "Direct entry",
  "oit-idea": "OIT IDEA form",
};

// ---- Dispositions -----------------------------------------------------
// Where a request stands or ended. `routed-to-existing` is the
// "existing solution meets need" outcome: the request closes AND the
// requestor joins the existing project's interest pool (Phase 2).

export type RequestDisposition =
  | "open"
  | "fast-tracked"
  | "approved"
  | "denied"
  | "withdrawn"
  | "closed"
  | "merged"
  | "converted-to-project"
  | "routed-to-existing";

export const REQUEST_DISPOSITION_LABEL: Record<RequestDisposition, string> = {
  open: "Open",
  "fast-tracked": "Fast-tracked",
  approved: "Approved",
  denied: "Not pursued",
  withdrawn: "Withdrawn",
  closed: "Closed",
  merged: "Merged",
  "converted-to-project": "Became a project",
  "routed-to-existing": "Routed to existing solution",
};

/** Dispositions that still need attention (the working queue). */
export const OPEN_DISPOSITIONS: RequestDisposition[] = ["open"];

export function isRequestDisposition(
  value: unknown
): value is RequestDisposition {
  return (
    typeof value === "string" &&
    Object.prototype.hasOwnProperty.call(REQUEST_DISPOSITION_LABEL, value)
  );
}

// ---- Audit event types ------------------------------------------------

export type RequestEventType =
  | "received"
  | "triaged"
  | "track-assigned"
  | "stage-advanced"
  | "flag-raised"
  | "flag-resolved"
  | "routed"
  | "decision"
  | "merged"
  | "converted";

// ---- Link types -------------------------------------------------------
// Request ↔ project (tech_request_project_links).

export type RequestProjectLinkType =
  | "duplicate-of"
  | "expanded-use"
  | "interest"
  | "converted-to"
  | "supersedes"
  | "informs";

// Request ↔ request (tech_request_links).

export type RequestLinkType = "duplicate-of" | "roi-aggregates-to" | "related";

// ---- ROI claim vocabularies (roi_claims) ------------------------------
// Dimensions extend as the ROI framework the working group is drafting
// lands; `hard-dollar-replacement` is stable now (the adopted
// bottom-line definition — see lib/roi-rubric.ts).

export type RoiDimension =
  | "hard-dollar-replacement"
  | "capacity-fte"
  | "cost-avoidance"
  | "revenue"
  | "risk-reduction"
  | "time-savings"
  | "strategic-enablement";

export const ROI_DIMENSION_LABEL: Record<RoiDimension, string> = {
  "hard-dollar-replacement": "Bottom-line (contract replacement)",
  "capacity-fte": "Capacity returned (FTE)",
  "cost-avoidance": "Cost avoidance",
  revenue: "Revenue",
  "risk-reduction": "Risk reduction",
  "time-savings": "Time savings",
  "strategic-enablement": "Strategic enablement",
};

/**
 * Label for a dimension value read back from the database. The column
 * carries no CHECK by design, so a row written by a newer vocabulary
 * than this module falls back to its raw slug rather than crashing the
 * renderer.
 */
export function roiDimensionLabel(value: string): string {
  return (ROI_DIMENSION_LABEL as Record<string, string>)[value] ?? value;
}

// Structural (CHECKed in Migration 021): whether a claim carries
// numbers or narrative + evidence. Qualitative claims may NOT carry
// numbers — if you can put a number on it, it's quantified — and must
// carry evidence (verbatim quotes, document paths); a quantified
// claim's honesty lives in `basis` instead.

export type RoiClaimKind = "quantified" | "qualitative";

export const ROI_CLAIM_KIND_LABEL: Record<RoiClaimKind, string> = {
  quantified: "Quantified",
  qualitative: "Qualitative",
};

export type RoiClaimSource =
  | "clickup-sync"
  | "worksheet"
  | "triage"
  | "cadso-rubric"
  | "owner-attested";

export type RoiClaimStatus = "estimated" | "attested" | "verified" | "realized";
