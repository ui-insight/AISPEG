// lib/requests.ts
//
// Postgres read module for the Unified Technology Request registry
// (tech_requests, Migration 018 / ADR 0005). Mirrors the lib/work.ts
// pattern: typed rows out, SQL in one place, callers never touch the
// pool directly.
//
// The registry unifies request-shaped rows from every origin. Where a
// projection table carries richer per-origin detail (the ClickUp
// rubric score, the site submission tier), the queries join it in at
// read time — same read-time-join posture as ADR 0004.

import { query } from "./db";
import {
  isRequestDisposition,
  type RequestDisposition,
  type RequestOrigin,
} from "./utr";
import {
  isIdeaAiInvolvement,
  isIdeaDataSignal,
  isIdeaSuggestedTrack,
  type IdeaAiInvolvement,
  type IdeaDataSignal,
  type IdeaSuggestedTrack,
} from "./oit-idea";

export interface TechRequest {
  id: string;
  origin: RequestOrigin;
  /** ClickUp task id when the request originated in the intake backlog —
   *  the join key for rubric enrichment (lib/clickup-data.ts). */
  clickupTaskId: string | null;
  title: string;
  needStatement: string | null;
  requestorName: string | null;
  requestorUnit: string | null;
  track: string | null;
  stage: string | null;
  disposition: RequestDisposition;
  decidedAt: string | null;
  decidedBy: string | null;
  decisionSummary: string | null;
  receivedAt: string;
  /** ClickUp weighted rubric score, when the request came from ClickUp. */
  weightedScore: number | null;
  /** Site-assessment tier (1–4), when the request came from the site quiz. */
  submissionTier: number | null;
  /** Token for the submitter-visible status page, for site submissions. */
  submissionId: string | null;
  /** OIT's own workflow status, verbatim, for IDEA-form requests. */
  oitStatus: string | null;
  /**
   * Machine-inferred classification for IDEA-form requests
   * (lib/oit-idea.ts posture: advisory claims with provenance, never
   * triage decisions — surfaces must label them as inferred). Unknown
   * stored values degrade to null/dropped rather than corrupting the
   * typed unions.
   */
  inferredTrack: IdeaSuggestedTrack | null;
  inferredAiInvolvement: IdeaAiInvolvement | null;
  inferredTool: string | null;
  inferredDataSignals: IdeaDataSignal[];
  inferenceModel: string | null;
}

interface TechRequestRow {
  id: string;
  origin: RequestOrigin;
  clickup_task_id: string | null;
  title: string;
  need_statement: string | null;
  requestor_name: string | null;
  requestor_unit: string | null;
  track: string | null;
  stage: string | null;
  disposition: string;
  // node-postgres returns TIMESTAMPTZ columns as JS Date objects.
  decided_at: Date | null;
  decided_by: string | null;
  decision_summary: string | null;
  received_at: Date;
  weighted_score: string | null;
  submission_tier: number | null;
  submission_id: string | null;
  oit_status: string | null;
  inferred_track: string | null;
  inferred_ai_involvement: string | null;
  inferred_tool: string | null;
  inferred_data_signals: string[] | null;
  inference_model: string | null;
}

function toTechRequest(row: TechRequestRow): TechRequest {
  return {
    id: row.id,
    origin: row.origin,
    clickupTaskId: row.clickup_task_id,
    title: row.title,
    needStatement: row.need_statement,
    requestorName: row.requestor_name,
    requestorUnit: row.requestor_unit,
    track: row.track,
    stage: row.stage,
    // Unknown disposition text degrades loudly to 'open' rather than
    // corrupting the typed union (same posture as ClickUp status
    // normalization in lib/clickup-data.ts).
    disposition: isRequestDisposition(row.disposition)
      ? row.disposition
      : "open",
    decidedAt: row.decided_at ? row.decided_at.toISOString() : null,
    decidedBy: row.decided_by,
    decisionSummary: row.decision_summary,
    receivedAt: row.received_at.toISOString(),
    weightedScore:
      row.weighted_score === null ? null : Number(row.weighted_score),
    submissionTier: row.submission_tier,
    submissionId: row.submission_id,
    oitStatus: row.oit_status,
    inferredTrack: isIdeaSuggestedTrack(row.inferred_track)
      ? row.inferred_track
      : null,
    inferredAiInvolvement: isIdeaAiInvolvement(row.inferred_ai_involvement)
      ? row.inferred_ai_involvement
      : null,
    inferredTool: row.inferred_tool,
    inferredDataSignals: (row.inferred_data_signals ?? []).filter(
      isIdeaDataSignal
    ),
    inferenceModel: row.inference_model,
  };
}

/**
 * Every registry row, newest first, with per-origin detail joined in.
 * Public-audience since 2026-07-24: the portfolio owner's call is that
 * the site tells one story with no public/internal split — requestor
 * names render publicly, consistent with the owner-named ethos of the
 * rest of the inventory. /portfolio/pipeline is the canonical surface.
 */
export async function listTechRequests(): Promise<TechRequest[]> {
  const rows = await query<TechRequestRow>(
    `SELECT
       tr.id, tr.origin, tr.clickup_task_id, tr.title, tr.need_statement,
       tr.requestor_name, tr.requestor_unit,
       tr.track, tr.stage, tr.disposition,
       tr.decided_at, tr.decided_by, tr.decision_summary,
       tr.received_at,
       cr.weighted_score,
       s.tier AS submission_tier,
       tr.submission_id,
       oir.oit_status,
       oir.inferred_track,
       oir.inferred_ai_involvement,
       oir.inferred_tool,
       oir.inferred_data_signals,
       oir.inference_model
     FROM tech_requests tr
     LEFT JOIN clickup_requests cr ON cr.clickup_task_id = tr.clickup_task_id
     LEFT JOIN submissions s ON s.id = tr.submission_id
     LEFT JOIN oit_idea_requests oir ON oir.source_key = tr.oit_idea_key
     ORDER BY tr.received_at DESC`
  );
  return rows.map(toTechRequest);
}

export interface RequestCounts {
  total: number;
  open: number;
  byOrigin: Record<RequestOrigin, number>;
}

export async function requestCounts(): Promise<RequestCounts> {
  const rows = await query<{ origin: RequestOrigin; disposition: string; n: string }>(
    `SELECT origin, disposition, COUNT(*) AS n
     FROM tech_requests
     GROUP BY origin, disposition`
  );
  const byOrigin: Record<RequestOrigin, number> = {
    tdx: 0,
    clickup: 0,
    "site-submission": 0,
    direct: 0,
    "oit-idea": 0,
  };
  let total = 0;
  let open = 0;
  for (const row of rows) {
    const n = Number(row.n);
    total += n;
    byOrigin[row.origin] += n;
    if (row.disposition === "open") open += n;
  }
  return { total, open, byOrigin };
}
