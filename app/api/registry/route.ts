import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import {
  isDeploymentEnvironment,
  isEnterpriseReplacementStatus,
} from "@/lib/project-governance";
import { isProjectStatus, PROJECT_STATUSES, type ProjectStatus } from "@/lib/portfolio";

// Admin list ordering: most-live first, then winding-down, then
// externally-owned. Typed as Record<ProjectStatus, number> so tsc forces
// a rank for any status added to the ADR 0001 ladder — the previous
// hand-written CASE ranked six statuses that no longer exist and none of
// the six that had been added since.
const STATUS_RANK: Record<ProjectStatus, number> = {
  production: 1,
  maintained: 2,
  piloting: 3,
  building: 4,
  prototype: 5,
  approved: 6,
  scoping: 7,
  idea: 8,
  paused: 9,
  sunsetting: 10,
  archived: 11,
  tracked: 12,
};

const SORT_ORDER = (Object.keys(STATUS_RANK) as ProjectStatus[]).sort(
  (a, b) => STATUS_RANK[a] - STATUS_RANK[b]
);

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
              proposed_deployment_environment,
              enterprise_replacement_status,
              existing_enterprise_system_name,
              existing_enterprise_system_annual_cost_usd,
              existing_enterprise_system_renewal_date,
              submission_id, created_at, updated_at
       FROM applications
       ORDER BY
         -- Ladder order, most-live first. Driven by PROJECT_STATUSES so a
         -- new ADR 0001 status can't silently sort last; anything outside
         -- the union sorts to the end (array_position returns NULL, and
         -- NULLS LAST makes that explicit rather than accidental).
         array_position($1::text[], status) NULLS LAST,
         updated_at DESC
       LIMIT 500`,
      [SORT_ORDER]
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
      proposed_deployment_environment,
      enterprise_replacement_status,
      existing_enterprise_system_name,
      existing_enterprise_system_annual_cost_usd,
      existing_enterprise_system_renewal_date,
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

    const deploymentEnvironment =
      proposed_deployment_environment ?? "to-be-determined";
    const replacementStatus =
      enterprise_replacement_status ?? "to-be-determined";

    if (!isDeploymentEnvironment(deploymentEnvironment)) {
      return NextResponse.json(
        { error: "Invalid proposed deployment environment" },
        { status: 400 }
      );
    }
    if (!isEnterpriseReplacementStatus(replacementStatus)) {
      return NextResponse.json(
        { error: "Invalid enterprise replacement status" },
        { status: 400 }
      );
    }
    // Same rule as PATCH — the column has no CHECK, so guard it here.
    if (status !== undefined && (typeof status !== "string" || !isProjectStatus(status))) {
      return NextResponse.json(
        {
          error: "Invalid status",
          detail: `status must be one of the ADR 0001 operational states: ${PROJECT_STATUSES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const existingSystemName =
      typeof existing_enterprise_system_name === "string"
        ? existing_enterprise_system_name.trim()
        : "";
    const hasAnnualCost =
      existing_enterprise_system_annual_cost_usd !== null &&
      existing_enterprise_system_annual_cost_usd !== undefined &&
      existing_enterprise_system_annual_cost_usd !== "";
    const annualCost = Number(existing_enterprise_system_annual_cost_usd);
    const renewalDate =
      typeof existing_enterprise_system_renewal_date === "string" &&
      existing_enterprise_system_renewal_date !== ""
        ? existing_enterprise_system_renewal_date
        : null;

    if (
      replacementStatus === "yes" &&
      (!existingSystemName ||
        !hasAnnualCost ||
        !Number.isFinite(annualCost) ||
        annualCost < 0)
    ) {
      return NextResponse.json(
        {
          error:
            "A replacement project requires the existing system name and a non-negative annual cost",
        },
        { status: 400 }
      );
    }
    if (renewalDate && !/^\d{4}-\d{2}-\d{2}$/.test(renewalDate)) {
      return NextResponse.json(
        { error: "Renewal date must use YYYY-MM-DD" },
        { status: 400 }
      );
    }

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
          submission_id,
          proposed_deployment_environment,
          enterprise_replacement_status,
          existing_enterprise_system_name,
          existing_enterprise_system_annual_cost_usd,
          existing_enterprise_system_renewal_date)
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
               $41,
               $42,$43,$44,$45,$46)
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
        deploymentEnvironment,
        replacementStatus,
        replacementStatus === "yes" ? existingSystemName : null,
        replacementStatus === "yes" ? annualCost : null,
        replacementStatus === "yes" ? renewalDate : null,
      ]
    );

    return NextResponse.json(app, { status: 201 });
  } catch (error) {
    console.error("POST /api/registry error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
