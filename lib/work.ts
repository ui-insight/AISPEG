// lib/work.ts
//
// Query module for the post-Sprint-2 portfolio. Reads from Postgres
// `applications` + `blockers` tables. Replaces the lib/portfolio.ts
// runtime queries (the file stays as the seed source until Sprint 3).
//
// Visibility model:
//   - public:    fully public, all detail
//   - embargoed: acknowledged on the public site, deployment detail held
//   - internal:  not on the public site at all
//
// Blockers carry public_text (safe for /portfolio) and internal_text
// (sharper detail, only shown on /internal/portfolio).

import "server-only";
import { query } from "./db";
import type { WorkCategory } from "./work-categories";
import type {
  AI4RARelationship,
  InstitutionalReviewStatus,
  OperationalOwner,
  PilotCohort,
  ProductionScope,
  Project,
  ProjectStatus,
  Visibility,
} from "./portfolio";

export type { OperationalOwner } from "./portfolio";

export type VisibilityTier = "public" | "embargoed" | "internal";
export type BlockerSeverity = "low" | "medium" | "high";

export type BlockerCategory =
  | "oit-review"
  | "oit-standards"
  | "unit-engagement"
  | "legal-embargo"
  | "hardware-procurement"
  | "funding"
  | "data-governance"
  | "compliance"
  | "personnel"
  | "iids-capacity"
  | "inter-unit-politics"
  | "communications"
  | "external-partner"
  | "faculty-governance";

export const blockerCategoryLabels: Record<BlockerCategory, string> = {
  "oit-review": "OIT review",
  "oit-standards": "OIT standards",
  "unit-engagement": "Unit engagement",
  "legal-embargo": "Legal / vendor embargo",
  "hardware-procurement": "Hardware / procurement",
  funding: "Funding / budget",
  "data-governance": "Data access / governance",
  compliance: "Compliance / regulatory",
  personnel: "Personnel / hiring",
  "iids-capacity": "IIDS capacity",
  "inter-unit-politics": "Inter-unit politics",
  communications: "Communications clearance",
  "external-partner": "External partner / sponsor",
  "faculty-governance": "Faculty governance",
};

export interface Blocker {
  id: string;
  applicationId: string;
  category: BlockerCategory;
  namedParty: string | null;
  since: string; // ISO date
  publicText: string | null;
  internalText: string | null;
  severity: BlockerSeverity;
  resolvedAt: string | null;
}

// DB-only metadata layered on top of the canonical Project shape.
// `visibility` (Project enum) is derived from `visibilityTier` (DB enum) in
// toApplication; both stay on Application so consumers can use whichever
// axis fits the surface (the public site speaks Visibility; admin/internal
// surfaces speak VisibilityTier).
export interface ApplicationMeta {
  id: string;
  tier: number;
  visibilityTier: VisibilityTier;
  clickupTaskId: string | null;
  updatedAt: string;
}

// Project fields the DB always populates (default empty array / false)
// — narrow them from optional to required on the runtime Application
// shape so consumers don't have to ?? everywhere.
type AlwaysPopulated =
  | "workCategories"
  | "features"
  | "tech"
  | "tags"
  | "trackingOnly"
  | "relatedSlugs"
  | "strategicPlanAlignment"
  | "externalDeployments"
  | "isPrivateRepo"
  | "dualDestinyPlanned";

export type Application = Omit<Project, AlwaysPopulated> &
  Required<Pick<Project, AlwaysPopulated>> &
  ApplicationMeta;

export interface ApplicationWithBlockers extends Application {
  activeBlockers: Blocker[];
}

interface ApplicationRow {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string;
  home_units: string[];
  operational_owners: OperationalOwner[];
  build_participants: string[];
  tags: string[];
  tier: number;
  status: string;
  visibility_tier: VisibilityTier;
  ai4ra_relationship: string;
  dual_destiny_planned: boolean;
  external_deployments: string[];
  institutional_review_status: string | null;
  repo_url: string | null;
  docs_url: string | null;
  live_url: string | null;
  is_private_repo: boolean;
  funding: string | null;
  operational_function: string | null;
  operational_excellence_outcome: string | null;
  features: string[];
  tech: string[];
  tracking_only: boolean;
  related_slugs: string[];
  work_categories: string[];
  strategic_plan_alignment: string[];
  iids_sponsor: string | null;
  feature_complete: boolean | null;
  live_url_is_staging: boolean | null;
  pilot_cohort: PilotCohort | null;
  production_scope: string | null;
  support_contact: string | null;
  sunset_date: string | null;
  replaced_by: string | null;
  clickup_task_id: string | null;
  updated_at: string;
}

interface BlockerRow {
  id: string;
  application_id: string;
  category: BlockerCategory;
  named_party: string | null;
  since: string;
  public_text: string | null;
  internal_text: string | null;
  severity: BlockerSeverity;
  resolved_at: string | null;
}

// Inverse of scripts/seed-portfolio.ts:visibilityTier(). DB is the
// source-of-truth at runtime, but the canonical Project shape speaks
// the authoring enum.
function visibilityFromTier(tier: VisibilityTier): Visibility {
  switch (tier) {
    case "public":
      return "Public";
    case "embargoed":
      return "Partial";
    case "internal":
      return "Internal-only";
  }
}

function toApplication(row: ApplicationRow): Application {
  return {
    // ApplicationMeta (DB-only)
    id: row.id,
    tier: row.tier,
    visibilityTier: row.visibility_tier,
    clickupTaskId: row.clickup_task_id,
    updatedAt: row.updated_at,

    // Project — core
    slug: row.slug,
    name: row.name,
    tagline: row.tagline ?? "",
    description: row.description,
    homeUnits: row.home_units ?? [],
    operationalOwners: row.operational_owners ?? [],
    buildParticipants: row.build_participants ?? [],

    // Project — status / visibility
    status: row.status as ProjectStatus,
    visibility: visibilityFromTier(row.visibility_tier),
    institutionalReviewStatus:
      (row.institutional_review_status as InstitutionalReviewStatus | null) ??
      undefined,

    // Project — lifecycle taxonomy (ADR 0001)
    iidsSponsor: row.iids_sponsor ?? "",
    featureComplete: row.feature_complete ?? undefined,
    liveUrlIsStaging: row.live_url_is_staging ?? undefined,
    pilotCohort: row.pilot_cohort ?? undefined,
    productionScope: (row.production_scope as ProductionScope | null) ?? undefined,
    supportContact: row.support_contact ?? undefined,
    sunsetDate: row.sunset_date ?? undefined,
    replacedBy: row.replaced_by ?? undefined,

    // Project — AI4RA
    ai4raRelationship: row.ai4ra_relationship as AI4RARelationship,
    dualDestinyPlanned: row.dual_destiny_planned,
    externalDeployments: row.external_deployments ?? [],

    // Project — artifacts
    repoUrl: row.repo_url ?? undefined,
    docsUrl: row.docs_url ?? undefined,
    liveUrl: row.live_url ?? undefined,
    isPrivateRepo: row.is_private_repo,
    funding: row.funding ?? undefined,

    // Project — content
    operationalFunction: row.operational_function ?? "",
    operationalExcellenceOutcome: row.operational_excellence_outcome ?? "",
    features: row.features ?? [],
    tech: row.tech ?? [],

    // Project — meta
    tags: row.tags ?? [],
    trackingOnly: row.tracking_only,
    relatedSlugs: row.related_slugs ?? [],
    workCategories: (row.work_categories ?? []) as WorkCategory[],
    strategicPlanAlignment: row.strategic_plan_alignment ?? [],
  };
}

// node-postgres returns DATE columns as JS Date objects parsed in local
// time, which is fragile across server/client boundaries. Coerce to a
// plain "YYYY-MM-DD" ISO date string.
function toIsoDate(value: unknown): string {
  if (value instanceof Date) {
    const yyyy = value.getUTCFullYear();
    const mm = String(value.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(value.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }
  return String(value);
}

function toBlocker(row: BlockerRow): Blocker {
  return {
    id: row.id,
    applicationId: row.application_id,
    category: row.category,
    namedParty: row.named_party,
    since: toIsoDate(row.since),
    publicText: row.public_text,
    internalText: row.internal_text,
    severity: row.severity,
    resolvedAt: row.resolved_at ? toIsoDate(row.resolved_at) : null,
  };
}

const APPLICATION_COLUMNS = `
  id, slug, name, tagline, description,
  home_units, operational_owners, build_participants, tags,
  tier, status, visibility_tier,
  ai4ra_relationship, dual_destiny_planned, external_deployments,
  institutional_review_status,
  repo_url, docs_url, live_url, is_private_repo,
  funding,
  operational_function, operational_excellence_outcome,
  features, tech,
  tracking_only, related_slugs,
  work_categories,
  strategic_plan_alignment,
  iids_sponsor, feature_complete, live_url_is_staging,
  pilot_cohort, production_scope, support_contact,
  sunset_date, replaced_by,
  clickup_task_id, updated_at
`;

export interface ListOptions {
  /**
   * Which visibility tiers to include.
   * - "public" — default for the public /portfolio surface; includes
   *   public + embargoed (embargoed entries render with a held-detail
   *   notice but are not hidden).
   * - "internal" — for /internal/portfolio; includes all three tiers.
   */
  audience?: "public" | "internal";
}

function tiersFor(audience: "public" | "internal"): VisibilityTier[] {
  return audience === "internal"
    ? ["public", "embargoed", "internal"]
    : ["public", "embargoed"];
}

export async function listApplications(
  opts: ListOptions = {}
): Promise<ApplicationWithBlockers[]> {
  const audience = opts.audience ?? "public";
  const tiers = tiersFor(audience);

  const apps = await query<ApplicationRow>(
    `SELECT ${APPLICATION_COLUMNS}
     FROM applications
     WHERE visibility_tier = ANY($1)
     ORDER BY name`,
    [tiers]
  );

  if (apps.length === 0) return [];

  const ids = apps.map((a) => a.id);
  const blockers = await query<BlockerRow>(
    `SELECT * FROM blockers
     WHERE application_id = ANY($1)
       AND resolved_at IS NULL
     ORDER BY since ASC`,
    [ids]
  );

  const blockersByApp = new Map<string, Blocker[]>();
  for (const b of blockers) {
    const list = blockersByApp.get(b.application_id) ?? [];
    list.push(toBlocker(b));
    blockersByApp.set(b.application_id, list);
  }

  return apps.map((row) => ({
    ...toApplication(row),
    activeBlockers: blockersByApp.get(row.id) ?? [],
  }));
}

export async function getApplicationBySlug(
  slug: string,
  opts: ListOptions = {}
): Promise<ApplicationWithBlockers | null> {
  const audience = opts.audience ?? "public";
  const tiers = tiersFor(audience);

  const apps = await query<ApplicationRow>(
    `SELECT ${APPLICATION_COLUMNS}
     FROM applications
     WHERE slug = $1 AND visibility_tier = ANY($2)
     LIMIT 1`,
    [slug, tiers]
  );

  if (apps.length === 0) return null;
  const app = apps[0]!;

  const blockers = await query<BlockerRow>(
    `SELECT * FROM blockers
     WHERE application_id = $1 AND resolved_at IS NULL
     ORDER BY since ASC`,
    [app.id]
  );

  return {
    ...toApplication(app),
    activeBlockers: blockers.map(toBlocker),
  };
}

export interface HomeUnitGroup {
  unit: string;
  items: ApplicationWithBlockers[];
}

export function groupByHomeUnit(
  apps: ApplicationWithBlockers[]
): HomeUnitGroup[] {
  const groups = new Map<string, ApplicationWithBlockers[]>();
  for (const app of apps) {
    const unit = app.homeUnits[0] ?? "Unassigned";
    const list = groups.get(unit) ?? [];
    list.push(app);
    groups.set(unit, list);
  }
  return Array.from(groups.entries())
    .map(([unit, items]) => ({ unit, items }))
    .sort((a, b) => a.unit.localeCompare(b.unit));
}

export function daysSince(isoDate: string): number {
  const then = new Date(isoDate + "T00:00:00Z").getTime();
  const ms = Date.now() - then;
  return Math.max(0, Math.floor(ms / 86_400_000));
}

export interface RelatedApplication {
  slug: string;
  name: string;
  tagline: string | null;
}

export async function getRelatedApplications(
  app: Application,
  opts: ListOptions = {}
): Promise<RelatedApplication[]> {
  if (app.relatedSlugs.length === 0) return [];
  const audience = opts.audience ?? "public";
  const tiers = tiersFor(audience);

  const rows = await query<{ slug: string; name: string; tagline: string | null }>(
    `SELECT slug, name, tagline
     FROM applications
     WHERE slug = ANY($1) AND visibility_tier = ANY($2)
     ORDER BY name`,
    [app.relatedSlugs, tiers]
  );
  return rows;
}

export async function listSlugs(
  opts: ListOptions = {}
): Promise<string[]> {
  const audience = opts.audience ?? "public";
  const tiers = tiersFor(audience);
  const rows = await query<{ slug: string }>(
    `SELECT slug FROM applications WHERE visibility_tier = ANY($1) AND slug IS NOT NULL`,
    [tiers]
  );
  return rows.map((r) => r.slug);
}
