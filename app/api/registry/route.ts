import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";

// GET /api/registry — list all applications
export async function GET() {
  try {
    const rows = await query(
      `SELECT id, slug, name, tagline, description, owner_name, owner_email,
              department, home_units, operational_owners, build_participants,
              tags, github_repo, url, tier, status, visibility_tier,
              sensitivity, complexity, userbase, auth_level,
              integrations, data_sources, university_systems, output_types,
              ai4ra_relationship, tracking_only, clickup_task_id,
              submission_id, created_at, updated_at
       FROM applications
       ORDER BY
         CASE status
           WHEN 'production' THEN 1
           WHEN 'Production' THEN 1
           WHEN 'staging' THEN 2
           WHEN 'Piloting' THEN 2
           WHEN 'in-development' THEN 3
           WHEN 'Prototype' THEN 3
           WHEN 'approved' THEN 4
           WHEN 'idea' THEN 5
           WHEN 'Planned' THEN 5
           WHEN 'retired' THEN 6
           WHEN 'Archived' THEN 6
           WHEN 'Tracked' THEN 7
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
      // Required
      name,
      // Identity
      slug,
      tagline,
      description,
      // Ownership
      owner_name,
      owner_email,
      department,
      home_units,
      operational_owners,
      build_participants,
      // Classification
      tier,
      status,
      visibility_tier,
      tags,
      sensitivity,
      complexity,
      userbase,
      auth_level,
      integrations,
      data_sources,
      university_systems,
      output_types,
      // Links
      github_repo,
      url,
      repo_url,
      docs_url,
      live_url,
      is_private_repo,
      // AI4RA / governance
      ai4ra_relationship,
      dual_destiny_planned,
      external_deployments,
      institutional_review_status,
      tracking_only,
      // Content
      funding,
      operational_function,
      operational_excellence_outcome,
      features,
      tech,
      // Misc
      related_slugs,
      clickup_task_id,
      submission_id,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Application name is required" },
        { status: 400 }
      );
    }

    const toArray = (val: unknown) => (Array.isArray(val) ? val : []);
    const ownersJson =
      operational_owners == null
        ? "[]"
        : typeof operational_owners === "string"
        ? operational_owners
        : JSON.stringify(operational_owners);

    const app = await queryOne<{ id: string }>(
      `INSERT INTO applications
         (name, slug, tagline, description,
          owner_name, owner_email, department,
          home_units, operational_owners, build_participants,
          tags,
          tier, status, visibility_tier,
          sensitivity, complexity, userbase, auth_level,
          integrations, data_sources, university_systems, output_types,
          github_repo, url, repo_url, docs_url, live_url, is_private_repo,
          ai4ra_relationship, dual_destiny_planned, external_deployments,
          institutional_review_status, tracking_only,
          funding, operational_function, operational_excellence_outcome,
          features, tech,
          related_slugs, clickup_task_id,
          submission_id)
       VALUES ($1,$2,$3,$4,
               $5,$6,$7,
               $8,$9::jsonb,$10,
               $11,
               $12,$13,$14,
               $15,$16,$17,$18,
               $19,$20,$21,$22,
               $23,$24,$25,$26,$27,$28,
               $29,$30,$31,
               $32,$33,
               $34,$35,$36,
               $37,$38,
               $39,$40,
               $41)
       RETURNING id`,
      [
        name,
        slug || null,
        tagline || null,
        description || "",
        owner_name || null,
        owner_email || null,
        department || null,
        toArray(home_units),
        ownersJson,
        toArray(build_participants),
        toArray(tags),
        tier || 1,
        status || "idea",
        visibility_tier || "internal",
        toArray(sensitivity),
        complexity || null,
        userbase || null,
        auth_level || null,
        toArray(integrations),
        toArray(data_sources),
        toArray(university_systems),
        toArray(output_types),
        github_repo || null,
        url || null,
        repo_url || null,
        docs_url || null,
        live_url || null,
        is_private_repo === true,
        ai4ra_relationship || "None",
        dual_destiny_planned === true,
        toArray(external_deployments),
        institutional_review_status || null,
        tracking_only === true,
        funding || null,
        operational_function || null,
        operational_excellence_outcome || null,
        toArray(features),
        toArray(tech),
        toArray(related_slugs),
        clickup_task_id || null,
        submission_id || null,
      ]
    );

    return NextResponse.json(app, { status: 201 });
  } catch (error) {
    console.error("POST /api/registry error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
