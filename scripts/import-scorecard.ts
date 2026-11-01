// scripts/import-scorecard.ts
//
// Imports one evaluator's scoring run on the UTR Build Evaluation
// Scorecard (lib/build-scorecard.ts) from an interchange file
// (data/scorecards/*.json) into the Migration 030 tables.
//
// The interchange file is how a new evaluator — another model, or a
// person working from the workbook — contributes a run: produce a file
// in this shape, validate it with --dry-run, import it. Surfaces show
// runs side by side; nothing here merges or averages evaluators.
//
//   {
//     "rubricVersion": "utr-four-bucket-draft-2026-09-21",
//     "evaluator": { "kind": "model" | "human", "id": "...", "label": "..." },
//     "runLabel": "2026-09-24 second-draft pass",
//     "scoredAt": "2026-09-24",
//     "method": "How the run was produced — instructions, conventions.",
//     "evaluations": [
//       {
//         "subject": { "kind": "project", "slug": "openera" }
//                  | { "kind": "request", "id": "<uuid>", "origin": "clickup",
//                      "originKey": "<clickup task id | oit idea key | submission id>",
//                      "title": "..." },
//         "summary": "...",
//         "sources": ["..."],
//         "fields": { "<field key>": { "value": ..., "justification": "...", "evidence": "..." | null } }
//       }
//     ]
//   }
//
// Every SCORECARD_FIELDS key must be present on every evaluation; a null
// value is an honest "unknown" but still needs its justification.
//
// Request subjects resolve portably: registry UUIDs differ between
// databases (dev vs. prod rows were inserted independently), so the
// importer tries the id, then the origin reference (ClickUp task id,
// OIT IDEA key, submission id), then origin + exact title. A subject
// that resolves nowhere fails the import unless --skip-unresolved.
//
// Idempotent: a run is keyed by (evaluator id, runLabel). Re-importing
// replaces that run's evaluations wholesale in one transaction.
//
// Usage:
//   npm run import:scorecard -- data/scorecards/<file>.json
//   npm run import:scorecard -- <file> --dry-run          # validate only, no DB
//   npm run import:scorecard -- <file> --skip-unresolved  # warn instead of fail

import { readFileSync } from "node:fs";
import { Pool, type PoolClient } from "pg";
import {
  SCORECARD_FIELDS,
  SCORECARD_RUBRIC_VERSION,
  isEvaluatorKind,
  isNumericKind,
  isScorecardFieldKey,
  validateFieldValue,
  type EvaluatorKind,
} from "../lib/build-scorecard.js";
import { projects } from "../lib/portfolio.js";

interface FieldEntry {
  value: number | string | null;
  justification: string;
  evidence?: string | null;
}

type Subject =
  | { kind: "project"; slug: string }
  | {
      kind: "request";
      id: string;
      origin?: string;
      originKey?: string | null;
      title?: string;
    };

interface EvaluationEntry {
  subject: Subject;
  summary: string;
  sources: string[];
  fields: Record<string, FieldEntry>;
}

interface ScorecardFile {
  rubricVersion: string;
  evaluator: { kind: EvaluatorKind; id: string; label?: string };
  runLabel: string;
  scoredAt: string;
  method: string;
  evaluations: EvaluationEntry[];
}

function subjectName(s: Subject): string {
  return s.kind === "project" ? `project ${s.slug}` : `request ${s.title ?? s.id}`;
}

function validate(data: ScorecardFile): string[] {
  const errors: string[] = [];
  if (data.rubricVersion !== SCORECARD_RUBRIC_VERSION) {
    errors.push(
      `rubricVersion "${data.rubricVersion}" does not match this codebase's ${SCORECARD_RUBRIC_VERSION}.`
    );
  }
  if (!isEvaluatorKind(data.evaluator?.kind)) errors.push("evaluator.kind must be 'model' or 'human'.");
  if (!data.evaluator?.id) errors.push("evaluator.id is required.");
  if (!data.runLabel) errors.push("runLabel is required.");
  if (!data.method?.trim()) errors.push("method is required — say how the run was produced.");
  if (!/^\d{4}-\d{2}-\d{2}/.test(data.scoredAt ?? "")) errors.push("scoredAt must be an ISO date.");
  if (!Array.isArray(data.evaluations) || data.evaluations.length === 0) {
    errors.push("evaluations must be a non-empty array.");
    return errors;
  }

  const slugs = new Set(projects.map((p) => p.slug));
  const seen = new Set<string>();
  for (const ev of data.evaluations) {
    const who = subjectName(ev.subject);
    const subjectKey =
      ev.subject.kind === "project" ? `p:${ev.subject.slug}` : `r:${ev.subject.id}`;
    if (seen.has(subjectKey)) errors.push(`${who}: scored twice in one run.`);
    seen.add(subjectKey);
    if (ev.subject.kind === "project" && !slugs.has(ev.subject.slug)) {
      errors.push(`${who}: slug not in lib/portfolio.ts.`);
    }
    if (!ev.summary?.trim()) errors.push(`${who}: summary is required.`);
    for (const key of Object.keys(ev.fields ?? {})) {
      if (!isScorecardFieldKey(key)) errors.push(`${who}: unknown field "${key}".`);
    }
    for (const field of SCORECARD_FIELDS) {
      const entry = ev.fields?.[field.key];
      if (!entry) {
        errors.push(`${who}: missing field ${field.key} (use value null for unknown).`);
        continue;
      }
      const err = validateFieldValue(field, entry.value);
      if (err) errors.push(`${who}: ${err}.`);
      if (!entry.justification?.trim()) errors.push(`${who}: ${field.key} needs a justification.`);
    }
  }
  return errors;
}

async function resolveRequest(
  client: PoolClient,
  s: Extract<Subject, { kind: "request" }>
): Promise<string | null> {
  const byId = await client.query<{ id: string }>(
    `SELECT id FROM tech_requests WHERE id::text = $1`,
    [s.id]
  );
  if (byId.rows[0]) return byId.rows[0].id;

  if (s.originKey) {
    const byKey = await client.query<{ id: string }>(
      `SELECT id FROM tech_requests
       WHERE clickup_task_id = $1 OR oit_idea_key = $1 OR submission_id::text = $1`,
      [s.originKey]
    );
    if (byKey.rows.length === 1) return byKey.rows[0]!.id;
  }
  if (s.origin && s.title) {
    const byTitle = await client.query<{ id: string }>(
      `SELECT id FROM tech_requests WHERE origin = $1 AND title = $2`,
      [s.origin, s.title]
    );
    if (byTitle.rows.length === 1) return byTitle.rows[0]!.id;
  }
  return null;
}

async function importRun(
  client: PoolClient,
  data: ScorecardFile,
  sourceFile: string,
  skipUnresolved: boolean
): Promise<void> {
  const run = await client.query<{ id: string }>(
    `INSERT INTO scorecard_runs (
       rubric_version, evaluator_kind, evaluator, evaluator_label,
       run_label, method, source_file, scored_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
     ON CONFLICT (evaluator, run_label) DO UPDATE SET
       rubric_version = EXCLUDED.rubric_version,
       evaluator_kind = EXCLUDED.evaluator_kind,
       evaluator_label = EXCLUDED.evaluator_label,
       method = EXCLUDED.method,
       source_file = EXCLUDED.source_file,
       scored_at = EXCLUDED.scored_at
     RETURNING id`,
    [
      data.rubricVersion,
      data.evaluator.kind,
      data.evaluator.id,
      data.evaluator.label ?? null,
      data.runLabel,
      data.method,
      sourceFile,
      data.scoredAt,
    ]
  );
  const runId = run.rows[0]!.id;
  // Replace wholesale; field scores cascade.
  await client.query(`DELETE FROM scorecard_evaluations WHERE run_id = $1`, [runId]);

  let imported = 0;
  const unresolved: string[] = [];
  for (const ev of data.evaluations) {
    let applicationSlug: string | null = null;
    let requestId: string | null = null;
    if (ev.subject.kind === "project") {
      applicationSlug = ev.subject.slug;
    } else {
      requestId = await resolveRequest(client, ev.subject);
      if (!requestId) {
        unresolved.push(subjectName(ev.subject));
        continue;
      }
    }

    const evaluation = await client.query<{ id: string }>(
      `INSERT INTO scorecard_evaluations (run_id, application_slug, request_id, summary, sources)
       VALUES ($1,$2,$3,$4,$5) RETURNING id`,
      [runId, applicationSlug, requestId, ev.summary, ev.sources ?? []]
    );
    const evaluationId = evaluation.rows[0]!.id;

    for (const field of SCORECARD_FIELDS) {
      const entry = ev.fields[field.key]!;
      const numeric = isNumericKind(field.kind);
      await client.query(
        `INSERT INTO scorecard_field_scores (
           evaluation_id, field_key, value_numeric, value_text, justification, evidence
         ) VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          evaluationId,
          field.key,
          numeric ? entry.value : null,
          numeric ? null : entry.value,
          entry.justification.trim(),
          entry.evidence?.trim() || null,
        ]
      );
    }
    imported++;
  }

  if (unresolved.length > 0) {
    const list = unresolved.map((u) => `  - ${u}`).join("\n");
    if (!skipUnresolved) {
      throw new Error(
        `${unresolved.length} request subject(s) not found in tech_requests:\n${list}\nRe-run with --skip-unresolved to import the rest.`
      );
    }
    console.warn(`⚠ Skipped ${unresolved.length} unresolved request subject(s):\n${list}`);
  }
  console.log(`Run "${data.runLabel}" by ${data.evaluator.id}: ${imported} evaluation(s) imported.`);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const skipUnresolved = args.includes("--skip-unresolved");
  const path = args.find((a) => !a.startsWith("--"));
  if (!path) {
    console.error("Usage: npm run import:scorecard -- <data/scorecards/file.json> [--dry-run] [--skip-unresolved]");
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(path, "utf8")) as ScorecardFile;
  const errors = validate(data);
  if (errors.length > 0) {
    console.error(errors.join("\n"));
    console.error(`\n${errors.length} validation error(s); nothing imported.`);
    process.exit(1);
  }
  const projectCount = data.evaluations.filter((e) => e.subject.kind === "project").length;
  console.log(
    `${path}: ${data.evaluations.length} evaluations (${projectCount} projects, ${data.evaluations.length - projectCount} requests) by ${data.evaluator.id} — valid.`
  );
  if (dryRun) {
    console.log("--dry-run: no database writes.");
    return;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set. Set it in .env.local or the environment.");
    process.exit(1);
  }
  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    await importRun(client, data, path, skipUnresolved);
    await client.query("COMMIT");
    console.log("Import committed.");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Import failed:", err instanceof Error ? err.message : err);
  process.exit(1);
});
