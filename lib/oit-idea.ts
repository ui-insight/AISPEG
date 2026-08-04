// lib/oit-idea.ts
//
// Typed vocabulary for the OIT IDEA form inference layer — the
// `inferred_*` columns on `oit_idea_requests` (Migration 023),
// populated by scripts/infer-idea-requests.ts from the request's prose
// description via MindRouter.
//
// Everything here is an ADVISORY MACHINE CLAIM, never requestor-stated
// fact: provenance rides on each row (inference_model, inferred_at),
// any surface rendering these values must label them as inferred, and
// they never write tech_requests.track/stage — track assignment stays
// triage's call (Migrations 019/020 posture). The suggested track
// reuses IntakeTrack from lib/utr.ts so a triage decision can adopt or
// overrule the suggestion in the same vocabulary.
//
// No CHECK constraints back these values (Migration 018 posture):
// this module is the authority, and unknown stored values must degrade
// loudly at read time via the guards below.

import type { IntakeTrack } from "./utr";

// ---- Suggested track --------------------------------------------------
// The routable subset of IntakeTrack: an incoming request can be
// suggested onto Fast Lane or Tracks A–C, but never `external` (that
// value marks inventory work outside the intake process entirely).

export type IdeaSuggestedTrack = Exclude<IntakeTrack, "external">;

const SUGGESTED_TRACKS: readonly IdeaSuggestedTrack[] = [
  "fast-lane",
  "track-a",
  "track-b",
  "track-c",
  "track-d",
];

export function isIdeaSuggestedTrack(v: unknown): v is IdeaSuggestedTrack {
  return (
    typeof v === "string" &&
    (SUGGESTED_TRACKS as readonly string[]).includes(v)
  );
}

// ---- AI involvement ---------------------------------------------------
// Whether — and how centrally — AI features in the request. Drives the
// pipeline's AI-relevance lens over the all-origin queue.

export type IdeaAiInvolvement = "none" | "ai-feature" | "ai-core";

export const IDEA_AI_INVOLVEMENT_LABEL: Record<IdeaAiInvolvement, string> = {
  none: "No AI involvement",
  "ai-feature": "Includes AI features",
  "ai-core": "AI is the point",
};

export function isIdeaAiInvolvement(v: unknown): v is IdeaAiInvolvement {
  return (
    typeof v === "string" &&
    Object.prototype.hasOwnProperty.call(IDEA_AI_INVOLVEMENT_LABEL, v)
  );
}

// ---- Audience scope ---------------------------------------------------

export type IdeaAudienceScope =
  | "individual"
  | "course"
  | "department"
  | "college"
  | "campus";

export const IDEA_AUDIENCE_SCOPE_LABEL: Record<IdeaAudienceScope, string> = {
  individual: "Individual / small team",
  course: "A course's students",
  department: "Department",
  college: "College",
  campus: "Campus-wide",
};

export function isIdeaAudienceScope(v: unknown): v is IdeaAudienceScope {
  return (
    typeof v === "string" &&
    Object.prototype.hasOwnProperty.call(IDEA_AUDIENCE_SCOPE_LABEL, v)
  );
}

// ---- Data-sensitivity signals -----------------------------------------
// Coarse flags for what a request plausibly touches — the DATA-flag
// input to intake triage, not a compliance determination.

export type IdeaDataSignal =
  | "ferpa"
  | "hipaa"
  | "pii"
  | "cui"
  | "financial"
  | "hr"
  | "biometric"
  | "physical-security";

export const IDEA_DATA_SIGNAL_LABEL: Record<IdeaDataSignal, string> = {
  ferpa: "Student records (FERPA)",
  hipaa: "Health data (HIPAA)",
  pii: "Personal identifiers",
  cui: "Controlled research data (CUI)",
  financial: "Financial data",
  hr: "Employment / personnel data",
  biometric: "Biometric data",
  "physical-security": "Physical security / surveillance",
};

export function isIdeaDataSignal(v: unknown): v is IdeaDataSignal {
  return (
    typeof v === "string" &&
    Object.prototype.hasOwnProperty.call(IDEA_DATA_SIGNAL_LABEL, v)
  );
}

// ---- The full inference shape -----------------------------------------

export interface IdeaInference {
  /** Suggested UTR track (lib/utr.ts vocabulary) — advisory only. */
  track: IdeaSuggestedTrack;
  aiInvolvement: IdeaAiInvolvement;
  /** Commercial product / vendor named in the request, if any. */
  tool: string | null;
  /** 1–2 sentence normalized statement of who needs what and why. */
  needSummary: string;
  audienceScope: IdeaAudienceScope;
  dataSignals: IdeaDataSignal[];
}
