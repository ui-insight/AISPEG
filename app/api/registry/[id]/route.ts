import { NextRequest, NextResponse } from "next/server";
import { query, queryOne } from "@/lib/db";
import {
  isDeploymentEnvironment,
  isEnterpriseReplacementStatus,
} from "@/lib/project-governance";

// All applications columns the registry detail page reads. Stays in lockstep
// with the registry schema through db/migrations/012_project_governance_tracking.sql.
const READ_COLUMNS = `
  id, slug, name, tagline, description,
  owner_name, owner_email, department,
  home_units, operational_owners, build_participants, tags,
  github_repo, url, tier, status, visibility_tier,
  sensitivity, complexity, userbase, auth_level,
  integrations, data_sources, university_systems, output_types,
  ai4ra_relationship, dual_destiny_planned, external_deployments,
  institutional_review_status,
  proposed_deployment_environment,
  enterprise_replacement_status,
  existing_enterprise_system_name,
  existing_enterprise_system_annual_cost_usd,
  existing_enterprise_system_renewal_date,
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
  "proposed_deployment_environment", "enterprise_replacement_status",
  "existing_enterprise_system_name",
  "existing_enterprise_system_annual_cost_usd",
  "existing_enterprise_system_renewal_date",
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
    const body = (await request.json()) as Record<string, unknown>;

    if (
      "proposed_deployment_environment" in body &&
      !isDeploymentEnvironment(body.proposed_deployment_environment)
    ) {
      return NextResponse.json(
        { error: "Invalid proposed deployment environment" },
        { status: 400 }
      );
    }

    const replacementFields = [
      "enterprise_replacement_status",
      "existing_enterprise_system_name",
      "existing_enterprise_system_annual_cost_usd",
      "existing_enterprise_system_renewal_date",
    ];
    if (replacementFields.some((field) => field in body)) {
      const current = await queryOne<{
        enterprise_replacement_status: string;
        existing_enterprise_system_name: string | null;
        existing_enterprise_system_annual_cost_usd: string | number | null;
        existing_enterprise_system_renewal_date: unknown;
      }>(
        `SELECT enterprise_replacement_status,
                existing_enterprise_system_name,
                existing_enterprise_system_annual_cost_usd,
                existing_enterprise_system_renewal_date
         FROM applications
         WHERE id = $1`,
        [id]
      );

      if (!current) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }

      const replacementStatus = "enterprise_replacement_status" in body
        ? body.enterprise_replacement_status
        : current.enterprise_replacement_status;
      if (!isEnterpriseReplacementStatus(replacementStatus)) {
        return NextResponse.json(
          { error: "Invalid enterprise replacement status" },
          { status: 400 }
        );
      }

      if (replacementStatus === "yes") {
        const rawName = "existing_enterprise_system_name" in body
          ? body.existing_enterprise_system_name
          : current.existing_enterprise_system_name;
        const systemName =
          typeof rawName === "string" ? rawName.trim() : "";
        const rawCost = "existing_enterprise_system_annual_cost_usd" in body
          ? body.existing_enterprise_system_annual_cost_usd
          : current.existing_enterprise_system_annual_cost_usd;
        const annualCost = Number(rawCost);
        const rawRenewalDateValue =
          "existing_enterprise_system_renewal_date" in body
            ? body.existing_enterprise_system_renewal_date
            : current.existing_enterprise_system_renewal_date;
        const rawRenewalDate =
          rawRenewalDateValue instanceof Date
            ? rawRenewalDateValue.toISOString().slice(0, 10)
            : rawRenewalDateValue;

        if (
          !systemName ||
          rawCost === null ||
          rawCost === "" ||
          !Number.isFinite(annualCost) ||
          annualCost < 0
        ) {
          return NextResponse.json(
            {
              error:
                "A replacement project requires the existing system name and a non-negative annual cost",
            },
            { status: 400 }
          );
        }
        if (
          rawRenewalDate &&
          (typeof rawRenewalDate !== "string" ||
            !/^\d{4}-\d{2}-\d{2}$/.test(rawRenewalDate))
        ) {
          return NextResponse.json(
            { error: "Renewal date must use YYYY-MM-DD" },
            { status: 400 }
          );
        }

        body.existing_enterprise_system_name = systemName;
        body.existing_enterprise_system_annual_cost_usd = annualCost;
        body.existing_enterprise_system_renewal_date = rawRenewalDate || null;
      } else {
        // Avoid leaving stale incumbent-system facts behind when an admin
        // changes the replacement decision to no or to-be-determined.
        body.existing_enterprise_system_name = null;
        body.existing_enterprise_system_annual_cost_usd = null;
        body.existing_enterprise_system_renewal_date = null;
      }
    }

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
