import { NextRequest, NextResponse } from "next/server";
import { findSimilarApplications, type SubmissionProfile } from "@/lib/similarity";
import { intakeConfig } from "@/lib/intake-config";

// POST /api/similarity/preview
//
// Stateless similarity check. Takes a partial assessment profile (the
// shape produced by the builder-guide wizard's `answers` object) and
// returns matches against the applications registry without persisting
// anything. Used to surface similar projects mid-assessment so the
// submitter can decide whether to coordinate before duplicating effort.
//
// Distinct from /api/submissions/[id]/similarity, which persists matches
// and runs at threshold 0.3 after a real submission. This endpoint runs
// at a lower threshold (0.2) — over-notify and let the submitter judge.

interface PreviewRequest {
  sensitivity?: string[];
  complexity?: string | null;
  userbase?: string | null;
  auth?: string | null;
  integrations?: string[];
  dataSources?: string[];
  universitySystems?: string[];
  outputTypes?: string[];
}

function toArray(v: unknown): string[] {
  return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
}

function toStrOrNull(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

export async function POST(request: NextRequest) {
  try {
    const body: PreviewRequest = await request.json();

    const profile: SubmissionProfile = {
      sensitivity: toArray(body.sensitivity),
      complexity: toStrOrNull(body.complexity),
      userbase: toStrOrNull(body.userbase),
      auth_level: toStrOrNull(body.auth),
      integrations: toArray(body.integrations),
      data_sources: toArray(body.dataSources),
      university_systems: toArray(body.universitySystems),
      output_types: toArray(body.outputTypes),
    };

    // Skip the query if the profile carries no signal — avoids a full
    // table scan that would just return zero matches.
    const hasSignal =
      profile.data_sources.length > 0 ||
      profile.university_systems.length > 0 ||
      profile.integrations.length > 0 ||
      profile.sensitivity.length > 0 ||
      profile.output_types.length > 0;

    if (!hasSignal) {
      return NextResponse.json({ matches: [] });
    }

    const matches = await findSimilarApplications(
      profile,
      intakeConfig.liveSimilarityThreshold
    );

    // Limit to top 5; the wizard surfaces these as "consider talking to..."
    // hints, not an exhaustive overlap report.
    return NextResponse.json({ matches: matches.slice(0, 5) });
  } catch (error) {
    console.error("POST /api/similarity/preview error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
