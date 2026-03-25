import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

// GET /api/registry — list all applications
export async function GET() {
  try {
    const rows = await query(
      `SELECT id, name, description, owner_name, owner_email, department,
              github_repo, url, tier, status, sensitivity, complexity, userbase,
              auth_level, integrations, data_sources, university_systems,
              output_types, submission_id, created_at, updated_at
       FROM applications
       ORDER BY
         CASE status
           WHEN 'production' THEN 1
           WHEN 'staging' THEN 2
           WHEN 'in-development' THEN 3
           WHEN 'approved' THEN 4
           WHEN 'idea' THEN 5
           WHEN 'retired' THEN 6
         END,
         updated_at DESC
       LIMIT 500`
    );
    return NextResponse.json(rows);
  } catch (error) {
    console.error("GET /api/registry error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST /api/registry — create a new application
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      owner_name,
      owner_email,
      department,
      github_repo,
      url,
      tier,
      status,
      sensitivity,
      complexity,
      userbase,
      auth_level,
      integrations,
      data_sources,
      university_systems,
      output_types,
      submission_id,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Application name is required" },
        { status: 400 }
      );
    }

    const toArray = (val: unknown) => (Array.isArray(val) ? val : []);

    const app = await queryOne<{ id: string }>(
      `INSERT INTO applications
         (name, description, owner_name, owner_email, department,
          github_repo, url, tier, status, sensitivity, complexity, userbase,
          auth_level, integrations, data_sources, university_systems,
          output_types, submission_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       RETURNING id`,
      [
        name,
        description || "",
        owner_name || null,
        owner_email || null,
        department || null,
        github_repo || null,
        url || null,
        tier || 1,
        status || "idea",
        toArray(sensitivity),
        complexity || null,
        userbase || null,
        auth_level || null,
        toArray(integrations),
        toArray(data_sources),
        toArray(university_systems),
        toArray(output_types),
        submission_id || null,
      ]
    );

    return NextResponse.json(app, { status: 201 });
  } catch (error) {
    console.error("POST /api/registry error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
