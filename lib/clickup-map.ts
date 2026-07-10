// lib/clickup-map.ts
//
// Typed map between the IIDS-AI4UI ClickUp space and the portfolio.
// Each active AI4UI project is a ClickUp *list*; this module pins the
// list ids to portfolio slugs so synced rows (keyed by ClickUp ids —
// see migration 010) join to `applications` rows at read time.
//
// These ids are structured data, not secrets — keeping them here (not
// in env vars) lets tsc check every consumer. Only the API token lives
// in the environment (CLICKUP_API_TOKEN).
//
// Maintenance: when a new project list is created in the IIDS-AI4UI
// space, add a row here AND a matching entry in lib/portfolio.ts with
// the same slug. Unknown lists encountered during sync are logged as
// warnings and skipped, never synced blind.

export const CLICKUP_WORKSPACE_ID = "9017952524";

/** IIDS-AI4UI space. */
export const CLICKUP_SPACE_ID = "90175778958";

/** "AI4UI New Project Requests" — the scored intake backlog. */
export const CLICKUP_BACKLOG_LIST_ID = "901713962270";

export interface ClickUpProjectMapping {
  /** ClickUp list id (each project is a list in the space). */
  listId: string;
  /** List name as it reads in ClickUp — for sync logs only. */
  listName: string;
  /** Matching lib/portfolio.ts slug. */
  slug: string;
}

export const CLICKUP_PROJECT_LISTS: readonly ClickUpProjectMapping[] = [
  { listId: "901713962364", listName: "Invoice Processing", slug: "invoice-processing" },
  { listId: "901713962399", listName: "MindRouter 2.0", slug: "mindrouter" },
  { listId: "901713962269", listName: "OpenERA", slug: "openera" },
  { listId: "901713962298", listName: "Nexus", slug: "nexus" },
  { listId: "901713962384", listName: "Water Law Database", slug: "water-law-database" },
  { listId: "901714480073", listName: "EO Compliance Tool", slug: "execord" },
  { listId: "901713962400", listName: "Daily Register/MyUI", slug: "ucm-daily-register" },
  { listId: "901713962362", listName: "Historical Contracts", slug: "historical-contracts" },
  { listId: "901713962291", listName: "Ongoing Contracts", slug: "ongoing-contracts" },
  { listId: "901713962380", listName: "Out of State Tax Tracking", slug: "out-of-state-tax-tracking" },
  { listId: "901713962365", listName: "BLS & CUPA Code Prediction", slug: "bls-cupa-code-prediction" },
  { listId: "901713962307", listName: "Retroactive Payment Requests", slug: "retroactive-payment-requests" },
  { listId: "901713962350", listName: "Document Review - Bid Waivers", slug: "bid-waiver-document-review" },
  { listId: "901713962295", listName: "Data Infrastructure Pilot", slug: "data-infrastructure-pilot" },
] as const;

export function slugForListId(listId: string): string | null {
  return CLICKUP_PROJECT_LISTS.find((m) => m.listId === listId)?.slug ?? null;
}

export function listIdForSlug(slug: string): string | null {
  return CLICKUP_PROJECT_LISTS.find((m) => m.slug === slug)?.listId ?? null;
}
