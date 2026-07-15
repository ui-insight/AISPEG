// ============================================================
// Survey types — shared shape for ingested survey corpora
// ============================================================
// Currently backs the Operational Excellence survey (Pillar 5).
// Typed so a second survey can reuse the same explorer surface.
// ============================================================

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

/**
 * Phase-2 hook (deferred): once a cluster or sub-theme is promoted into
 * the potential/requested-projects inventory, link it here. Left unset
 * until the ingest-into-projects work lands.
 */
export interface CandidateProjectLink {
  /** Portfolio slug or intake reference this demand signal maps to. */
  ref: string;
  label: string;
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
  /** Deferred phase-2 links; empty for now. */
  candidateProjects?: CandidateProjectLink[];
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
