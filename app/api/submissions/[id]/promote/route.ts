import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

/**
 * POST /api/submissions/[id]/promote
 *
 * Promotes a submission into the application registry by creating a new
 * applications row pre-populated with the submission's data.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Fetch the submission + details
    const sub = await queryOne<{
      id: string;
      idea_text: string;
      score: number;
      tier: number;
      submitter_name: string | null;
      submitter_email: string | null;
      department: string | null;
    }>(
      `SELECT id, idea_text, score, tier, submitter_name, submitter_email, department
       FROM submissions WHERE id = $1`,
      [id]
    );

    if (!sub) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    // Check if already promoted
    const existing = await queryOne(
      `SELECT id FROM applications WHERE submission_id = $1`,
      [id]
    );
    if (existing) {
      return NextResponse.json(
        { error: "Already promoted", application_id: (existing as { id: string }).id },
        { status: 409 }
      );
    }

    // Get details
    const detail = await queryOne<{
      sensitivity: string[];
      complexity: string | null;
      userbase: string | null;
      auth_level: string | null;
      integrations: string[];
      data_sources: string[];
      university_systems: string[];
      output_types: string[];
    }>(
      `SELECT sensitivity, complexity, userbase, auth_level,
              integrations, data_sources, university_systems, output_types
       FROM submission_details WHERE submission_id = $1`,
      [id]
    );

    const app = await queryOne<{ id: string }>(
      `INSERT INTO applications
         (name, description, owner_name, owner_email, department,
          tier, status, sensitivity, complexity, userbase, auth_level,
          integrations, data_sources, university_systems, output_types,
          submission_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
       RETURNING id`,
      [
        sub.idea_text?.slice(0, 100) || "Untitled Application",
        sub.idea_text || "",
        sub.submitter_name,
        sub.submitter_email,
        sub.department,
        sub.tier,
        "approved",
        detail?.sensitivity || [],
        detail?.complexity || null,
        detail?.userbase || null,
        detail?.auth_level || null,
        detail?.integrations || [],
        detail?.data_sources || [],
        detail?.university_systems || [],
        detail?.output_types || [],
        sub.id,
      ]
    );

    // Update submission status
    await query(
      `UPDATE submissions SET status = 'in-progress' WHERE id = $1`,
      [id]
    );

    return NextResponse.json(
      { application_id: app!.id, message: "Promoted to registry" },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/submissions/[id]/promote error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
