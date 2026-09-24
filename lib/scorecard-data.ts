// lib/scorecard-data.ts
//
// Postgres read module for the UTR Build Evaluation Scorecard
// (Migration 030; rubric in lib/build-scorecard.ts). Mirrors the
// lib/requests.ts pattern: typed rows out, SQL in one place, callers
// never touch the pool directly.
//
// Scores are evaluator-attributed and never combined across evaluators:
// every evaluation carries its run (who scored it, when, how). Subject
// display facts come from lib/portfolio.ts for projects (static, owner-
// named) and from tech_requests for requests.

import { query } from "./db";
import {
  SCORECARD_FIELDS,
  isEvaluatorKind,
  isNumericKind,
  isScorecardFieldKey,
  netFiveYear,
  type EvaluatorKind,
  type GateStatus,
  type DataConfidence,
  type NetFiveYear,
  type ScorecardValues,
} from "./build-scorecard";
import { getProjectBySlug, type ProjectStatus } from "./portfolio";
import { isRequestDisposition, type RequestDisposition, type RequestOrigin } from "./utr";

export interface ScorecardRun {
  id: string;
  rubricVersion: string;
  evaluatorKind: EvaluatorKind;
  evaluator: string;
  evaluatorLabel: string;
  runLabel: string;
  method: string;
  sourceFile: string | null;
  /** ISO timestamp. */
  scoredAt: string;
  evaluationCount: number;
}

export type ScorecardSubject =
  | {
      kind: "project";
      slug: string;
      title: string;
      unit: string | null;
      status: ProjectStatus | null;
    }
  | {
      kind: "request";
      id: string;
      title: string;
      unit: string | null;
      requestor: string | null;
      origin: RequestOrigin;
      disposition: RequestDisposition;
    };

export interface ScorecardEvaluation {
  id: string;
  run: ScorecardRun;
  subject: ScorecardSubject;
  summary: string;
  sources: string[];
  values: ScorecardValues;
  net: NetFiveYear;
  gate: GateStatus | null;
  confidence: DataConfidence | null;
}

/** URL segment pair for a subject's detail page. */
export function subjectHref(subject: ScorecardSubject): string {
  return subject.kind === "project"
    ? `/portfolio/scorecard/project/${subject.slug}`
    : `/portfolio/scorecard/request/${subject.id}`;
}

export function subjectKey(subject: ScorecardSubject): string {
  return subject.kind === "project" ? `project:${subject.slug}` : `request:${subject.id}`;
}

interface RunRow {
  id: string;
  rubric_version: string;
  evaluator_kind: string;
  evaluator: string;
  evaluator_label: string | null;
  run_label: string;
  method: string;
  source_file: string | null;
  scored_at: Date;
  evaluation_count: string;
}

function toRun(row: RunRow): ScorecardRun {
  return {
    id: row.id,
    rubricVersion: row.rubric_version,
    evaluatorKind: isEvaluatorKind(row.evaluator_kind) ? row.evaluator_kind : "model",
    evaluator: row.evaluator,
    evaluatorLabel: row.evaluator_label ?? row.evaluator,
    runLabel: row.run_label,
    method: row.method,
    sourceFile: row.source_file,
    scoredAt: row.scored_at.toISOString(),
    evaluationCount: Number(row.evaluation_count),
  };
}

/** Every run, newest first. */
export async function listScorecardRuns(): Promise<ScorecardRun[]> {
  const rows = await query<RunRow>(
    `SELECT r.*, (SELECT COUNT(*) FROM scorecard_evaluations e WHERE e.run_id = r.id) AS evaluation_count
     FROM scorecard_runs r
     ORDER BY r.scored_at DESC, r.created_at DESC`
  );
  return rows.map(toRun);
}

interface EvaluationRow {
  id: string;
  run_id: string;
  application_slug: string | null;
  request_id: string | null;
  summary: string;
  sources: string[];
  req_title: string | null;
  req_unit: string | null;
  req_requestor: string | null;
  req_origin: RequestOrigin | null;
  req_disposition: string | null;
}

interface FieldRow {
  evaluation_id: string;
  field_key: string;
  // node-postgres returns NUMERIC as string to preserve precision.
  value_numeric: string | null;
  value_text: string | null;
  justification: string;
  evidence: string | null;
}

const FIELD_KIND = new Map(SCORECARD_FIELDS.map((f) => [f.key as string, f.kind]));

function toSubject(row: EvaluationRow): ScorecardSubject {
  if (row.application_slug) {
    const project = getProjectBySlug(row.application_slug);
    return {
      kind: "project",
      slug: row.application_slug,
      // A slug retired from lib/portfolio.ts still renders, by slug.
      title: project?.name ?? row.application_slug,
      unit: project?.homeUnits.join(", ") ?? null,
      status: project?.status ?? null,
    };
  }
  return {
    kind: "request",
    id: row.request_id!,
    title: row.req_title ?? "(request no longer in the registry)",
    unit: row.req_unit,
    requestor: row.req_requestor,
    origin: row.req_origin ?? "direct",
    disposition:
      row.req_disposition && isRequestDisposition(row.req_disposition)
        ? row.req_disposition
        : "open",
  };
}

async function loadEvaluations(where: string, params: unknown[]): Promise<ScorecardEvaluation[]> {
  const runs = new Map((await listScorecardRuns()).map((r) => [r.id, r]));
  const rows = await query<EvaluationRow>(
    `SELECT e.id, e.run_id, e.application_slug, e.request_id, e.summary, e.sources,
            tr.title AS req_title, tr.requestor_unit AS req_unit,
            tr.requestor_name AS req_requestor, tr.origin AS req_origin,
            tr.disposition AS req_disposition
     FROM scorecard_evaluations e
     LEFT JOIN tech_requests tr ON tr.id = e.request_id
     ${where}`,
    params
  );
  if (rows.length === 0) return [];

  const fields = await query<FieldRow>(
    `SELECT evaluation_id, field_key, value_numeric, value_text, justification, evidence
     FROM scorecard_field_scores
     WHERE evaluation_id = ANY($1::uuid[])`,
    [rows.map((r) => r.id)]
  );
  const valuesById = new Map<string, ScorecardValues>();
  for (const f of fields) {
    // A key retired from the rubric drops rather than corrupting the
    // typed record (lib/requests.ts posture on vocabulary drift).
    if (!isScorecardFieldKey(f.field_key)) continue;
    const kind = FIELD_KIND.get(f.field_key)!;
    const values = valuesById.get(f.evaluation_id) ?? {};
    values[f.field_key] = {
      value: isNumericKind(kind)
        ? f.value_numeric === null
          ? null
          : Number(f.value_numeric)
        : f.value_text,
      justification: f.justification,
      evidence: f.evidence,
    };
    valuesById.set(f.evaluation_id, values);
  }

  return rows.flatMap((row) => {
    const run = runs.get(row.run_id);
    if (!run) return [];
    const values = valuesById.get(row.id) ?? {};
    return [
      {
        id: row.id,
        run,
        subject: toSubject(row),
        summary: row.summary,
        sources: row.sources ?? [],
        values,
        net: netFiveYear(values),
        gate: (values.gate_status?.value as GateStatus | null) ?? null,
        confidence: (values.financial_data_confidence?.value as DataConfidence | null) ?? null,
      },
    ];
  });
}

/** Every evaluation in one run. */
export async function listRunEvaluations(runId: string): Promise<ScorecardEvaluation[]> {
  return loadEvaluations(`WHERE e.run_id = $1`, [runId]);
}

/** Every evaluator's evaluation of one subject, newest run first. */
export async function listSubjectEvaluations(
  kind: "project" | "request",
  id: string
): Promise<ScorecardEvaluation[]> {
  const evaluations =
    kind === "project"
      ? await loadEvaluations(`WHERE e.application_slug = $1`, [id])
      : await loadEvaluations(`WHERE e.request_id::text = $1`, [id]);
  return evaluations.sort((a, b) => b.run.scoredAt.localeCompare(a.run.scoredAt));
}
