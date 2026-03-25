import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

// POST /api/submissions — create a new wizard submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      idea_text,
      answers,
      score,
      tier,
      submitter_email,
      submitter_name,
      department,
    } = body;

    if (!idea_text || !answers || score == null || tier == null) {
      return NextResponse.json(
        { error: "Missing required fields: idea_text, answers, score, tier" },
        { status: 400 }
      );
    }

    // Insert submission
    const submission = await queryOne<{ id: string }>(
      `INSERT INTO submissions (idea_text, answers, score, tier, submitter_email, submitter_name, department)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id`,
      [idea_text, JSON.stringify(answers), score, tier, submitter_email || null, submitter_name || null, department || null]
    );

    if (!submission) {
      return NextResponse.json({ error: "Failed to create submission" }, { status: 500 });
    }

    // Insert denormalized details for querying
    const sensitivity = Array.isArray(answers.sensitivity) ? answers.sensitivity : [];
    const integrations = Array.isArray(answers.integrations) ? answers.integrations : [];

    await query(
      `INSERT INTO submission_details (submission_id, sensitivity, complexity, userbase, auth_level, integrations)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        submission.id,
        sensitivity,
        answers.complexity || null,
        answers.userbase || null,
        answers.auth || null,
        integrations,
      ]
    );

    return NextResponse.json({ id: submission.id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/submissions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/submissions — list submissions with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const tier = searchParams.get("tier");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const conditions: string[] = [];
    const params: unknown[] = [];
    let paramIndex = 1;

    if (status) {
      conditions.push(`s.status = $${paramIndex++}`);
      params.push(status);
    }
    if (tier) {
      conditions.push(`s.tier = $${paramIndex++}`);
      params.push(parseInt(tier, 10));
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows = await query(
      `SELECT s.id, s.idea_text, s.score, s.tier, s.submitter_name, s.department, s.status, s.created_at,
              d.sensitivity, d.complexity, d.userbase, d.auth_level, d.integrations
       FROM submissions s
       LEFT JOIN submission_details d ON d.submission_id = s.id
       ${where}
       ORDER BY s.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset]
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/submissions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
