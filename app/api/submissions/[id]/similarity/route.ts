import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import {
  computeAndStoreSimilarity,
  type SubmissionProfile,
} from "@/lib/similarity";

// GET /api/submissions/[id]/similarity — get cached similarity matches
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const matches = await query(
      `SELECT sm.score, sm.overlap_details,
              a.id AS application_id, a.name AS application_name,
              a.status AS application_status, a.department AS application_department,
              a.github_repo, a.url AS application_url
       FROM similarity_matches sm
       JOIN applications a ON a.id = sm.application_id
       WHERE sm.submission_id = $1
       ORDER BY sm.score DESC`,
      [id]
    );

    return NextResponse.json(matches);
  } catch (error) {
    console.error("GET similarity error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/submissions/[id]/similarity — recompute similarity matches
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch the submission's detail profile
    const detail = await queryOne<SubmissionProfile>(
      `SELECT sensitivity, complexity, userbase, auth_level,
              integrations, data_sources, university_systems, output_types
       FROM submission_details
       WHERE submission_id = $1`,
      [id]
    );

    if (!detail) {
      return NextResponse.json(
        { error: "Submission details not found" },
        { status: 404 }
      );
    }

    const matches = await computeAndStoreSimilarity(id, detail);
    return NextResponse.json(matches);
  } catch (error) {
    console.error("POST similarity error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
