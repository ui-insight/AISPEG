import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

// GET /api/submissions/[id]/notes — list notes for a submission
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const rows = await query(
      `SELECT id, author, content, created_at
       FROM submission_notes
       WHERE submission_id = $1
       ORDER BY created_at DESC`,
      [id]
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/submissions/[id]/notes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/submissions/[id]/notes — add a note to a submission
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { author, content } = body;
    if (!author || !content) {
      return NextResponse.json(
        { error: "Missing required fields: author, content" },
        { status: 400 }
      );
    }

    const note = await queryOne<{ id: string; author: string; content: string; created_at: string }>(
      `INSERT INTO submission_notes (submission_id, author, content)
       VALUES ($1, $2, $3)
       RETURNING id, author, content, created_at`,
      [id, author, content]
    );

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error("POST /api/submissions/[id]/notes error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
