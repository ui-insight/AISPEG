// lib/clickup-data.ts
//
// Server-only read layer over the ClickUp-synced tables (migration 010,
// ADR 0004). Deliberately separate from lib/work.ts: that module reads
// the applications registry (seeded, canonical identity); this one reads
// a projection of ClickUp with its own freshness model. Rows are keyed
// by ClickUp ids and joined to portfolio slugs here, at read time, via
// lib/clickup-map.ts.

import "server-only";

import { query, queryOne } from "./db";
import { CLICKUP_PROJECT_LISTS, listIdForSlug, slugForListId } from "./clickup-map";
import type { ClickUpPerson } from "./clickup";

export interface StatusUpdate {
  commentId: string;
  author: string | null;
  postedAt: string; // ISO 8601
  body: string;
}

export interface ClickUpProjectStatus {
  listId: string;
  slug: string;
  roiFte: number | null;
  roiExplanation: string | null;
  leads: ClickUpPerson[];
  pocs: ClickUpPerson[];
  stakeholders: ClickUpPerson[];
  repoUrl: string | null;
  projectedCompletion: string | null; // ISO date
  scope: string | null;
  businessUnit: string | null;
  // Public-safe generated summary of the status narrative (ADR 0004,
  // amended July 2026). Null until the first summarization succeeds.
  statusSummary: string | null;
  statusSummaryAt: string | null; // ISO 8601
  // Verbatim comment timeline — internal-only rendering.
  updates: StatusUpdate[];
  syncedAt: string; // ISO 8601
}

export type RequestStatus = "pending" | "active" | "rejected" | "complete";

export interface RequestRubric {
  a1: number | null;
  a2: number | null;
  a3: number | null;
  a4: number | null;
  b1: number | null;
  b2: number | null;
  b3: number | null;
  b4: number | null;
  c1: number | null;
  c2: number | null;
  c3: number | null;
}

export interface ScoredRequest {
  taskId: string;
  name: string;
  status: RequestStatus;
  rawStatus: string;
  description: string | null;
  unit: string | null;
  submitter: string | null;
  category: string | null;
  feasibility: string | null;
  rubric: RequestRubric;
  weightedScore: number | null;
  scoreSource: "clickup" | "computed";
  dateCreated: string | null;
}

export interface SyncInfo {
  finishedAt: string; // ISO 8601
  ok: boolean;
}

// ---------------------------------------------------------------------------
// Row shapes + mappers
// ---------------------------------------------------------------------------

interface ProjectRow {
  clickup_list_id: string;
  roi_fte: string | null;
  roi_explanation: string | null;
  leads: ClickUpPerson[];
  pocs: ClickUpPerson[];
  stakeholders: ClickUpPerson[];
  repo_url: string | null;
  projected_completion: Date | string | null;
  scope: string | null;
  business_unit: string | null;
  status_summary: string | null;
  status_summary_at: Date | null;
  synced_at: Date;
}

interface UpdateRow {
  comment_id: string;
  clickup_list_id: string;
  author: string | null;
  posted_at: Date;
  body_text: string;
}

interface RequestRow {
  clickup_task_id: string;
  name: string;
  status: string;
  description: string | null;
  unit: string | null;
  submitter: string | null;
  category: string | null;
  feasibility: string | null;
  rubric_a1: string | null;
  rubric_a2: string | null;
  rubric_a3: string | null;
  rubric_a4: string | null;
  rubric_b1: string | null;
  rubric_b2: string | null;
  rubric_b3: string | null;
  rubric_b4: string | null;
  rubric_c1: string | null;
  rubric_c2: string | null;
  rubric_c3: string | null;
  weighted_score: string | null;
  score_source: string;
  date_created: Date | null;
}

function toNumber(value: string | null): number | null {
  if (value === null) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function toIsoDate(value: Date | string | null): string | null {
  if (value === null) return null;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return value;
}

function toUpdate(row: UpdateRow): StatusUpdate {
  return {
    commentId: row.comment_id,
    author: row.author,
    postedAt: row.posted_at.toISOString(),
    body: row.body_text,
  };
}

/**
 * ClickUp status text → typed union. Unknown statuses bucket as `pending`
 * with a warning so an upstream rename degrades loudly, not silently.
 */
export function normalizeRequestStatus(raw: string): RequestStatus {
  const s = raw.trim().toLowerCase();
  if (s === "to be reviewed") return "pending";
  if (s === "active") return "active";
  if (s === "rejected") return "rejected";
  if (s === "complete") return "complete";
  console.warn(`clickup-data: unknown request status "${raw}" — bucketing as pending`);
  return "pending";
}

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * ClickUp-derived status for one portfolio project, or null when the slug
 * has no mapped ClickUp list or the list hasn't synced yet.
 */
export async function getProjectStatusBySlug(
  slug: string,
  opts: { updateLimit?: number } = {}
): Promise<ClickUpProjectStatus | null> {
  const listId = listIdForSlug(slug);
  if (!listId) return null;

  const row = await queryOne<ProjectRow>(
    `SELECT clickup_list_id, roi_fte, roi_explanation, leads, pocs,
            stakeholders, repo_url, projected_completion, scope,
            business_unit, status_summary, status_summary_at, synced_at
     FROM clickup_projects WHERE clickup_list_id = $1`,
    [listId]
  );
  if (!row) return null;

  const limit = opts.updateLimit ?? 25;
  const updates = await query<UpdateRow>(
    `SELECT comment_id, clickup_list_id, author, posted_at, body_text
     FROM clickup_status_updates
     WHERE clickup_list_id = $1
     ORDER BY posted_at DESC
     LIMIT $2`,
    [listId, limit]
  );

  return {
    listId: row.clickup_list_id,
    slug,
    roiFte: toNumber(row.roi_fte),
    roiExplanation: row.roi_explanation,
    leads: row.leads,
    pocs: row.pocs,
    stakeholders: row.stakeholders,
    repoUrl: row.repo_url,
    projectedCompletion: toIsoDate(row.projected_completion),
    scope: row.scope,
    businessUnit: row.business_unit,
    statusSummary: row.status_summary,
    statusSummaryAt: row.status_summary_at
      ? row.status_summary_at.toISOString()
      : null,
    updates: updates.map(toUpdate),
    syncedAt: row.synced_at.toISOString(),
  };
}

/**
 * Public status line per mapped portfolio slug — one query, for the
 * /portfolio card grid. Body is the generated public summary (never the
 * verbatim comments — ADR 0004 amended); the date is when the newest
 * underlying update was posted.
 */
export interface CardStatusLine {
  postedAt: string; // ISO 8601 — newest underlying update
  body: string; // generated public summary
}

export async function getCardStatusLines(): Promise<Map<string, CardStatusLine>> {
  const rows = await query<{
    clickup_list_id: string;
    status_summary: string;
    latest_posted_at: Date;
  }>(
    `SELECT p.clickup_list_id, p.status_summary, max(u.posted_at) AS latest_posted_at
     FROM clickup_projects p
     JOIN clickup_status_updates u ON u.clickup_list_id = p.clickup_list_id
     WHERE p.status_summary IS NOT NULL
     GROUP BY p.clickup_list_id, p.status_summary`
  );
  const bySlug = new Map<string, CardStatusLine>();
  for (const row of rows) {
    const slug = slugForListId(row.clickup_list_id);
    if (slug) {
      bySlug.set(slug, {
        postedAt: row.latest_posted_at.toISOString(),
        body: row.status_summary,
      });
    }
  }
  return bySlug;
}

/**
 * The scored request backlog, highest weighted score first. All statuses —
 * callers filter by the normalized `status`.
 */
export async function listScoredRequests(): Promise<ScoredRequest[]> {
  const rows = await query<RequestRow>(
    `SELECT clickup_task_id, name, status, description, unit, submitter,
            category, feasibility,
            rubric_a1, rubric_a2, rubric_a3, rubric_a4,
            rubric_b1, rubric_b2, rubric_b3, rubric_b4,
            rubric_c1, rubric_c2, rubric_c3,
            weighted_score, score_source, date_created
     FROM clickup_requests
     ORDER BY weighted_score DESC NULLS LAST, name ASC`
  );
  return rows.map((row) => ({
    taskId: row.clickup_task_id,
    name: row.name,
    status: normalizeRequestStatus(row.status),
    rawStatus: row.status,
    description: row.description,
    unit: row.unit,
    submitter: row.submitter,
    category: row.category,
    feasibility: row.feasibility,
    rubric: {
      a1: toNumber(row.rubric_a1),
      a2: toNumber(row.rubric_a2),
      a3: toNumber(row.rubric_a3),
      a4: toNumber(row.rubric_a4),
      b1: toNumber(row.rubric_b1),
      b2: toNumber(row.rubric_b2),
      b3: toNumber(row.rubric_b3),
      b4: toNumber(row.rubric_b4),
      c1: toNumber(row.rubric_c1),
      c2: toNumber(row.rubric_c2),
      c3: toNumber(row.rubric_c3),
    },
    weightedScore: toNumber(row.weighted_score),
    scoreSource: row.score_source === "computed" ? "computed" : "clickup",
    dateCreated: row.date_created ? row.date_created.toISOString() : null,
  }));
}

/** Most recent completed sync run, for freshness stamps. Null before first sync. */
export async function getLastSync(): Promise<SyncInfo | null> {
  const row = await queryOne<{ finished_at: Date; ok: boolean }>(
    `SELECT finished_at, ok FROM clickup_sync_runs
     WHERE finished_at IS NOT NULL
     ORDER BY finished_at DESC LIMIT 1`
  );
  if (!row) return null;
  return { finishedAt: row.finished_at.toISOString(), ok: row.ok };
}

/** Count of pending ("to be reviewed") requests, for the /portfolio stat strip. */
export async function countPendingRequests(): Promise<number> {
  const row = await queryOne<{ count: string }>(
    `SELECT count(*) AS count FROM clickup_requests WHERE lower(status) = 'to be reviewed'`
  );
  return row ? Number(row.count) : 0;
}

export { CLICKUP_PROJECT_LISTS };
