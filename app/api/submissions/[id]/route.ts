import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

// GET /api/submissions/[id] — get a single submission with details
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const row = await queryOne(
      `SELECT s.*, d.sensitivity, d.complexity, d.userbase, d.auth_level, d.integrations
       FROM submissions s
       LEFT JOIN submission_details d ON d.submission_id = s.id
       WHERE s.id = $1`,
      [id]
    );

    if (!row) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch (error) {
    console.error("GET /api/submissions/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/submissions/[id] — update submission status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const allowedFields = ["status", "submitter_email", "submitter_name", "department"];
    const updates: string[] = [];
    const values: unknown[] = [];
    let paramIndex = 1;

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${paramIndex++}`);
        values.push(body[field]);
      }
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    values.push(id);
    const row = await queryOne(
      `UPDATE submissions SET ${updates.join(", ")} WHERE id = $${paramIndex} RETURNING id, status, updated_at`,
      values
    );

    if (!row) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    return NextResponse.json(row);
  } catch (error) {
    console.error("PATCH /api/submissions/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
