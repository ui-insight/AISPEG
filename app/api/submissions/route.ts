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
    const toArray = (val: unknown) => (Array.isArray(val) ? val : []);

    await query(
      `INSERT INTO submission_details
         (submission_id, sensitivity, complexity, userbase, auth_level, integrations, data_sources, university_systems, output_types)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        submission.id,
        toArray(answers.sensitivity),
        answers.complexity || null,
        answers.userbase || null,
        answers.auth || null,
        toArray(answers.integrations),
        toArray(answers.dataSources),
        toArray(answers.universitySystems),
        toArray(answers.outputTypes),
      ]
    );

    // File the submission into the UTR request registry (tech_requests,
    // ADR 0005) so it joins the unified queue alongside ClickUp and
    // (later) TDX requests. Best-effort: registry failure must not
    // break the submitter's confirmation flow.
    try {
      const registryRow = await queryOne<{ id: string }>(
        `INSERT INTO tech_requests (
           origin, submission_id, requestor_name, requestor_email,
           requestor_unit, title, need_statement, disposition, received_at
         ) VALUES ('site-submission',$1,$2,$3,$4,$5,$6,'open',now())
         ON CONFLICT (submission_id) WHERE submission_id IS NOT NULL
         DO NOTHING
         RETURNING id`,
        [
          submission.id,
          submitter_name || null,
          submitter_email || null,
          department || null,
          String(idea_text).split("\n")[0].slice(0, 200),
          idea_text,
        ]
      );
      if (registryRow) {
        await query(
          `INSERT INTO tech_request_events (request_id, actor, event_type, note)
           VALUES ($1, 'site', 'received', 'Submitted through the Submit-a-Project assessment.')`,
          [registryRow.id]
        );
      }
    } catch (registryError) {
      console.error(
        "POST /api/submissions: UTR registry insert failed (submission saved):",
        registryError
      );
    }

    return NextResponse.json({ id: submission.id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/submissions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/submissions — list submissions with optional filters, search, sort, pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const tier = searchParams.get("tier");
    const department = searchParams.get("department");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "created_at";
    const order = searchParams.get("order") === "asc" ? "ASC" : "DESC";
    const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 200);
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
    if (department) {
      conditions.push(`s.department = $${paramIndex++}`);
      params.push(department);
    }
    if (search) {
      conditions.push(
        `(s.idea_text ILIKE $${paramIndex} OR s.submitter_name ILIKE $${paramIndex} OR s.submitter_email ILIKE $${paramIndex} OR s.department ILIKE $${paramIndex})`
      );
      params.push(`%${search}%`);
      paramIndex++;
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Validate sort column to prevent SQL injection
    const allowedSorts: Record<string, string> = {
      created_at: "s.created_at",
      score: "s.score",
      tier: "s.tier",
      submitter_name: "s.submitter_name",
      department: "s.department",
      status: "s.status",
    };
    const sortColumn = allowedSorts[sort] || "s.created_at";

    // Get total count for pagination
    const countResult = await queryOne<{ count: string }>(
      `SELECT COUNT(*) as count FROM submissions s ${where}`,
      params
    );
    const total = parseInt(countResult?.count || "0", 10);

    const rows = await query(
      `SELECT s.id, s.idea_text, s.score, s.tier, s.submitter_name, s.submitter_email, s.department, s.status, s.created_at,
              d.sensitivity, d.complexity, d.userbase, d.auth_level, d.integrations,
              d.data_sources, d.university_systems, d.output_types
       FROM submissions s
       LEFT JOIN submission_details d ON d.submission_id = s.id
       ${where}
       ORDER BY ${sortColumn} ${order} NULLS LAST
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      [...params, limit, offset]
    );

    return NextResponse.json({ rows, total, limit, offset });
  } catch (error) {
    console.error("GET /api/submissions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
