import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

// GET /api/registry/[id] — get a single application
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const app = await queryOne(
      `SELECT id, name, description, owner_name, owner_email, department,
              github_repo, url, tier, status, sensitivity, complexity, userbase,
              auth_level, integrations, data_sources, university_systems,
              output_types, submission_id, created_at, updated_at
       FROM applications
       WHERE id = $1`,
      [id]
    );

    if (!app) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(app);
  } catch (error) {
    console.error("GET /api/registry/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PATCH /api/registry/[id] — update an application
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Build dynamic SET clause from provided fields
    const allowedFields: Record<string, string> = {
      name: "name",
      description: "description",
      owner_name: "owner_name",
      owner_email: "owner_email",
      department: "department",
      github_repo: "github_repo",
      url: "url",
      tier: "tier",
      status: "status",
      sensitivity: "sensitivity",
      complexity: "complexity",
      userbase: "userbase",
      auth_level: "auth_level",
      integrations: "integrations",
      data_sources: "data_sources",
      university_systems: "university_systems",
      output_types: "output_types",
    };

    const sets: string[] = [];
    const values: unknown[] = [];
    let paramIdx = 1;

    for (const [key, col] of Object.entries(allowedFields)) {
      if (key in body) {
        sets.push(`${col} = $${paramIdx}`);
        values.push(body[key]);
        paramIdx++;
      }
    }

    if (sets.length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    values.push(id);
    const result = await queryOne(
      `UPDATE applications SET ${sets.join(", ")} WHERE id = $${paramIdx} RETURNING id, status, updated_at`,
      values
    );

    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("PATCH /api/registry/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/registry/[id] — delete an application
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = await queryOne(
      `DELETE FROM applications WHERE id = $1 RETURNING id`,
      [id]
    );
    if (!result) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ deleted: true });
  } catch (error) {
    console.error("DELETE /api/registry/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
