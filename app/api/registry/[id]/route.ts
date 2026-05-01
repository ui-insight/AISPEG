import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

// All applications columns the registry detail page reads. Stays in lockstep
// with the schema added in db/migrations/005_friction_ledger.sql.
const READ_COLUMNS = `
  id, slug, name, tagline, description,
  owner_name, owner_email, department,
  home_units, operational_owners, build_participants, tags,
  github_repo, url, tier, status, visibility_tier,
  sensitivity, complexity, userbase, auth_level,
  integrations, data_sources, university_systems, output_types,
  ai4ra_relationship, dual_destiny_planned, external_deployments,
  institutional_review_status,
  repo_url, docs_url, live_url, is_private_repo,
  funding,
  operational_function, operational_excellence_outcome,
  features, tech,
  tracking_only, related_slugs,
  clickup_task_id,
  submission_id, created_at, updated_at
`;

// GET /api/registry/[id] — get a single application
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const app = await queryOne(
      `SELECT ${READ_COLUMNS} FROM applications WHERE id = $1`,
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

// Columns the PATCH endpoint will touch. Maps allowed body keys → column
// names. JSONB columns are listed separately so they can be passed
// through ::jsonb in the dynamic SET clause; pg's default text encoder
// otherwise emits the value as a quoted string.
const SCALAR_COLUMNS: string[] = [
  "name", "slug", "tagline", "description",
  "owner_name", "owner_email", "department",
  "home_units", "build_participants", "tags",
  "github_repo", "url", "tier", "status", "visibility_tier",
  "sensitivity", "complexity", "userbase", "auth_level",
  "integrations", "data_sources", "university_systems", "output_types",
  "ai4ra_relationship", "dual_destiny_planned", "external_deployments",
  "institutional_review_status",
  "repo_url", "docs_url", "live_url", "is_private_repo",
  "funding",
  "operational_function", "operational_excellence_outcome",
  "features", "tech",
  "tracking_only", "related_slugs",
  "clickup_task_id",
];

const JSONB_COLUMNS: string[] = ["operational_owners"];

// PATCH /api/registry/[id] — update an application
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const sets: string[] = [];
    const values: unknown[] = [];
    let paramIdx = 1;

    for (const col of SCALAR_COLUMNS) {
      if (col in body) {
        sets.push(`${col} = $${paramIdx}`);
        values.push(body[col]);
        paramIdx++;
      }
    }

    for (const col of JSONB_COLUMNS) {
      if (col in body) {
        const value =
          typeof body[col] === "string" ? body[col] : JSON.stringify(body[col]);
        sets.push(`${col} = $${paramIdx}::jsonb`);
        values.push(value);
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
