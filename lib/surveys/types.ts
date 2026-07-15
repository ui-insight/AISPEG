// ============================================================
// Survey types — shared shape for ingested survey corpora
// ============================================================
// Currently backs the Operational Excellence survey (Pillar 5).
// Typed so a second survey can reuse the same explorer surface.
// ============================================================

import type { WorkCategory } from "../work-categories";

/** Who answered. Faculty export also includes staff respondents. */
export type SurveyAudience = "faculty" | "student";

/**
 * A question-cluster slug. Each open-ended survey question maps to one
 * cluster; the slug is audience-scoped (faculty and student surveys ask
 * different questions), so always pair a cluster with its audience.
 */
export type SurveyClusterKey =
  // faculty
  | "processes"
  | "data-tools"
  | "talent"
  | "collaboration"
  | "additional"
  // student (adds these two; shares processes/collaboration/additional)
  | "data-access"
  | "technology";

/** One anonymized open-ended answer to one question. */
export interface SurveyResponse {
  /** Stable id: `${audience[0]}${respondentNumber}-${cluster}`. */
  id: string;
  audience: SurveyAudience;
  cluster: SurveyClusterKey;
  text: string;
  /** Hand-curated representative verbatim, surfaced on the Themes view. */
  featured?: boolean;
}

/**
 * A named pattern within a cluster. Qualitative (from the leadership
 * summary deck for faculty; derived from the corpus for students) — we
 * deliberately do not attach per-response counts to sub-themes, to avoid
 * implying a precision the tagging doesn't have.
 */
export interface SubTheme {
  label: string;
  description: string;
}

/** How well the current portfolio already answers a demand signal. */
export type CandidateCoverage = "gap" | "partial" | "covered";

/**
 * A potential/requested project derived from the survey's demand signal
 * (phase 2). Evidence-forward: each one names the survey clusters (and a
 * few illustrative verbatims) that motivate it, and is honest about what
 * the current portfolio already covers. These are proposals for triage,
 * not commitments — so no owners, dates, or ROI are asserted.
 */
export interface CandidateProject {
  id: string;
  title: string;
  /** The demand it answers, in plain operational language. */
  problem: string;
  /** What the project would be — one or two sentences, no hype. */
  shape: string;
  audiences: SurveyAudience[];
  /** Survey clusters that evidence this demand. */
  clusters: { audience: SurveyAudience; cluster: SurveyClusterKey }[];
  /** A few illustrative response ids (deep-linked on the surface). */
  evidenceResponseIds?: string[];
  /** The "by problem" category this would sit under, per work-categories. */
  workCategory: WorkCategory;
  coverage: CandidateCoverage;
  /** Existing portfolio slugs this relates to (covers / partially covers). */
  relatedProjectSlugs?: string[];
  /** Honest scope, feasibility, or sensitivity caveat. */
  note?: string;
}

/** A question-cluster: the question asked plus its summarized themes. */
export interface SurveyCluster {
  key: SurveyClusterKey;
  audience: SurveyAudience;
  /** Short nav/label form, e.g. "Processes". */
  label: string;
  /** The question as posed to respondents (lightly trimmed). */
  question: string;
  /** One- or two-sentence stakeholder-facing summary of the cluster. */
  summary: string;
  subThemes: SubTheme[];
}

/** Survey-level metadata for the explorer header. */
export interface SurveyMeta {
  title: string;
  pillar: string;
  fielded: string;
  respondents: { audience: SurveyAudience; label: string; count: number }[];
  /** Responses withheld from the public view for privacy. */
  withheldCount: number;
}
