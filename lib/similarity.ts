/**
 * Similarity detection engine.
 *
 * Computes an overlap score between a submission's attributes and every
 * application in the registry.  The score is a weighted Jaccard-like
 * coefficient across the array dimensions, plus exact-match bonuses for
 * scalar fields.
 *
 * Score range: 0.0 (no overlap) to 1.0 (identical profile).
 * Threshold for "similar": >= 0.3
 */

import { query } from "@/lib/db";

// ── Types ────────────────────────────────────────────────────

export interface SubmissionProfile {
  sensitivity: string[];
  complexity: string | null;
  userbase: string | null;
  auth_level: string | null;
  integrations: string[];
  data_sources: string[];
  university_systems: string[];
  output_types: string[];
}

export interface ApplicationRow {
  id: string;
  name: string;
  status: string;
  department: string | null;
  sensitivity: string[];
  complexity: string | null;
  userbase: string | null;
  auth_level: string | null;
  integrations: string[];
  data_sources: string[];
  university_systems: string[];
  output_types: string[];
}

export interface SimilarityResult {
  application_id: string;
  application_name: string;
  application_status: string;
  application_department: string | null;
  score: number;
  overlap_details: {
    sensitivity: string[];
    integrations: string[];
    data_sources: string[];
    university_systems: string[];
    output_types: string[];
    complexity_match: boolean;
    userbase_match: boolean;
    auth_match: boolean;
  };
}

// ── Weights ──────────────────────────────────────────────────

const WEIGHTS = {
  data_sources: 0.25,        // Most important — same data = likely overlap
  university_systems: 0.25,  // Same systems = high overlap
  sensitivity: 0.15,         // Same compliance needs
  integrations: 0.10,
  output_types: 0.10,
  complexity: 0.05,
  userbase: 0.05,
  auth_level: 0.05,
};

// ── Helpers ──────────────────────────────────────────────────

/** Jaccard similarity for two string arrays (intersection / union) */
function jaccard(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = [...setA].filter((x) => setB.has(x));
  const union = new Set([...setA, ...setB]);
  return union.size === 0 ? 0 : intersection.length / union.size;
}

/** Overlapping items between two arrays */
function overlap(a: string[], b: string[]): string[] {
  const setB = new Set(b);
  return a.filter((x) => setB.has(x));
}

// ── Core ─────────────────────────────────────────────────────

function computeScore(
  sub: SubmissionProfile,
  app: ApplicationRow
): { score: number; details: SimilarityResult["overlap_details"] } {
  const dsOverlap = overlap(sub.data_sources, app.data_sources);
  const usOverlap = overlap(sub.university_systems, app.university_systems);
  const senOverlap = overlap(sub.sensitivity, app.sensitivity);
  const intOverlap = overlap(sub.integrations, app.integrations);
  const outOverlap = overlap(sub.output_types, app.output_types);

  const complexityMatch =
    !!sub.complexity && !!app.complexity && sub.complexity === app.complexity;
  const userbaseMatch =
    !!sub.userbase && !!app.userbase && sub.userbase === app.userbase;
  const authMatch =
    !!sub.auth_level && !!app.auth_level && sub.auth_level === app.auth_level;

  const score =
    WEIGHTS.data_sources * jaccard(sub.data_sources, app.data_sources) +
    WEIGHTS.university_systems *
      jaccard(sub.university_systems, app.university_systems) +
    WEIGHTS.sensitivity * jaccard(sub.sensitivity, app.sensitivity) +
    WEIGHTS.integrations * jaccard(sub.integrations, app.integrations) +
    WEIGHTS.output_types * jaccard(sub.output_types, app.output_types) +
    WEIGHTS.complexity * (complexityMatch ? 1 : 0) +
    WEIGHTS.userbase * (userbaseMatch ? 1 : 0) +
    WEIGHTS.auth_level * (authMatch ? 1 : 0);

  return {
    score: Math.round(score * 1000) / 1000,
    details: {
      sensitivity: senOverlap,
      integrations: intOverlap,
      data_sources: dsOverlap,
      university_systems: usOverlap,
      output_types: outOverlap,
      complexity_match: complexityMatch,
      userbase_match: userbaseMatch,
      auth_match: authMatch,
    },
  };
}

/**
 * Find applications similar to a submission profile.
 * Returns matches with score >= threshold, sorted descending.
 */
export async function findSimilarApplications(
  profile: SubmissionProfile,
  threshold = 0.3
): Promise<SimilarityResult[]> {
  // Fetch all non-retired applications
  const apps = await query<ApplicationRow>(
    `SELECT id, name, status, department,
            sensitivity, complexity, userbase, auth_level,
            integrations, data_sources, university_systems, output_types
     FROM applications
     WHERE status != 'retired'`
  );

  const results: SimilarityResult[] = [];

  for (const app of apps) {
    const { score, details } = computeScore(profile, app);
    if (score >= threshold) {
      results.push({
        application_id: app.id,
        application_name: app.name,
        application_status: app.status,
        application_department: app.department,
        score,
        overlap_details: details,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Compute and persist similarity matches for a submission.
 * Called after a submission is created or when the registry changes.
 */
export async function computeAndStoreSimilarity(
  submissionId: string,
  profile: SubmissionProfile
): Promise<SimilarityResult[]> {
  const matches = await findSimilarApplications(profile, 0.2);

  // Clear old matches
  await query(`DELETE FROM similarity_matches WHERE submission_id = $1`, [
    submissionId,
  ]);

  // Insert new matches
  for (const match of matches) {
    await query(
      `INSERT INTO similarity_matches (submission_id, application_id, score, overlap_details)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (submission_id, application_id) DO UPDATE
         SET score = EXCLUDED.score, overlap_details = EXCLUDED.overlap_details`,
      [submissionId, match.application_id, match.score, match.overlap_details]
    );
  }

  return matches;
}
