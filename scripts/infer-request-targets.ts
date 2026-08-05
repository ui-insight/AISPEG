// scripts/infer-request-targets.ts
//
// The MindRouter deployment-target pass over the request registry
// (ADR 0008, PR 2): reads each open request from `tech_requests` and
// proposes which deployment target it would land on (Migration 025),
// so the UTR Landscape can show demand against the five-target supply
// model.
//
// Posture (mirrors scripts/infer-idea-requests.ts): machine claims
// with provenance (target_inference_model, target_inferred_at, a
// one-line rationale for the triage reviewer), rendered only as
// "inferred" on any surface. The pass NEVER touches a row a human has
// confirmed (target_confidence = 'confirmed'), and never writes
// track/stage — target assignment stays triage's call; the machine
// only proposes.
//
// The prompt is built from the same typed vocabulary the site renders
// (lib/project-governance.ts descriptions; the two-step selection
// model from lib/deployment-targets.ts), so the model classifies
// against exactly the targets triage confirms. The model may return
// null when the text genuinely cannot support a classification — the
// row stays NULL and the Landscape shows it in the unclassified pool
// rather than carrying a junk guess.
//
// Every response is validated against the typed guards; an invalid
// response gets one corrective retry with the validation errors
// appended, then the row is skipped with a warning — junk is never
// written.
//
// Usage (needs DATABASE_URL + MINDROUTER_API_KEY; MINDROUTER_MODEL
// optional):
//   npm run infer:request-targets                # open rows not yet inferred
//   npm run infer:request-targets -- --limit 3   # smoke test
//   npm run infer:request-targets -- --force     # re-infer (inferred rows only)
//   npm run infer:request-targets -- --dry-run   # list target rows, no calls

import { Pool } from "pg";
import {
  ask,
  parseJsonLoose,
  currentMindRouterModel,
  MindRouterError,
} from "../lib/mindrouter.js";
import {
  isRequestDeploymentTarget,
  INTAKE_TRACK_TITLE,
  isIntakeTrack,
  type RequestDeploymentTarget,
} from "../lib/utr.js";
import { DEPLOYMENT_ENVIRONMENT_DESCRIPTIONS } from "../lib/project-governance.js";

const CONCURRENCY = 3;
const MAX_TOKENS = 4096;
const RETRY_MAX_TOKENS = 8192;

interface TargetRow {
  id: string;
  title: string;
  need_statement: string | null;
  requestor_unit: string | null;
  origin: string;
  track: string | null;
  inferred_track: string | null;
  idea_description: string | null;
}

interface TargetInference {
  target: RequestDeploymentTarget | null;
  rationale: string;
}

// ── Prompt ───────────────────────────────────────────────────────────

const TARGET_DEFS = (
  [
    "databricks-dashboard",
    "nexus-module",
    "standalone-oci",
    "standalone-oit-k8s",
    "rcds-vm",
    "oit-managed-tbd",
    "external-hosted",
    "not-applicable",
  ] as const
)
  .map((slug) => `- "${slug}": ${DEPLOYMENT_ENVIRONMENT_DESCRIPTIONS[slug]}`)
  .join("\n");

const SYSTEM_PROMPT = `You classify technology requests at the University of Idaho by the deployment target the requested capability would land on if pursued. Given a request's title, origin, requesting unit, intake track (when assigned), and prose description, return ONLY a JSON object with exactly these fields:

{
  "target": "databricks-dashboard" | "nexus-module" | "standalone-oci" | "standalone-oit-k8s" | "rcds-vm" | "oit-managed-tbd" | "external-hosted" | "not-applicable" | null,
  "rationale": string
}

The targets:

${TARGET_DEFS}

Classify with a two-step decision — form factor first, then hosting:

1. Form factor. Is the substance of the request a report, dashboard, metric, or recurring data product over institutional data? → "databricks-dashboard". Is it a transactional staff workflow (validated intake, review queue, approvals, records over Banner-adjacent data) that fits a template web module? → "nexus-module". Is it the purchase, license, or subscription of an existing commercial product? → "external-hosted" (the vendor hosts it). Is it access to existing data, a report that already exists, a policy question, or otherwise nothing that deploys? → "not-applicable".
2. Hosting, only for builds that don't fit the above: a standalone application needing OIT-managed production goes to "standalone-oci" or "standalone-oit-k8s" (prefer "oit-managed-tbd" unless the text itself indicates on-prem residency, AI-compute adjacency, or a specific platform); an early pilot that would iterate on IIDS research infrastructure before entering the OIT pathway is "rcds-vm".

Intake-track correlation (a hint, not a rule — the description wins):
- ${INTAKE_TRACK_TITLE["track-a"]} → usually "external-hosted".
- ${INTAKE_TRACK_TITLE["track-b"]} / ${INTAKE_TRACK_TITLE["track-c"]} → usually "nexus-module", a standalone target, or "rcds-vm" for early pilots.
- ${INTAKE_TRACK_TITLE["track-d"]} → "databricks-dashboard" when a new report or data product would be produced; "not-applicable" when it is access to something that already exists.

Return null for "target" when the text genuinely cannot support a classification — a null is more useful than a guess.

"rationale": one plain factual sentence a triage reviewer can check the classification against. No hype, no recommendation.

Return ONLY the JSON object, no markdown fences, no commentary.`;

function userMessage(row: TargetRow): string {
  const track = row.track ?? row.inferred_track;
  const description = row.need_statement ?? row.idea_description;
  return [
    `Title: ${row.title}`,
    `Origin: ${row.origin}`,
    row.requestor_unit ? `Requesting unit: ${row.requestor_unit}` : null,
    track && isIntakeTrack(track)
      ? `Intake track${row.track ? "" : " (inferred)"}: ${INTAKE_TRACK_TITLE[track]}`
      : null,
    description ? `Description:\n${description}` : "Description: (none provided)",
  ]
    .filter(Boolean)
    .join("\n");
}

// ── Validation ───────────────────────────────────────────────────────

function validate(
  raw: unknown
): { ok: true; value: TargetInference } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const o = (raw ?? {}) as Record<string, unknown>;

  if (o.target !== null && !isRequestDeploymentTarget(o.target)) {
    errors.push(`target: got ${JSON.stringify(o.target)}`);
  }
  if (typeof o.rationale !== "string" || !o.rationale.trim()) {
    errors.push("rationale: missing or empty");
  }
  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: {
      target: o.target as RequestDeploymentTarget | null,
      rationale: (o.rationale as string).trim().slice(0, 500),
    },
  };
}

// ── Inference ────────────────────────────────────────────────────────

async function callModel(row: TargetRow, correction?: string): Promise<unknown> {
  const message = correction
    ? `${userMessage(row)}\n\nYour previous answer was invalid: ${correction}. Return a corrected JSON object.`
    : userMessage(row);
  let raw: string;
  try {
    raw = await ask(message, SYSTEM_PROMPT, true, {
      max_tokens: MAX_TOKENS,
      temperature: 0.1,
      reasoning_effort: "low",
    });
  } catch (error) {
    // Same budget-exhaustion fallback as analyzeIdea (lib/mindrouter.ts).
    if (error instanceof MindRouterError && error.isReasoningBudgetExhausted) {
      raw = await ask(message, SYSTEM_PROMPT, true, {
        max_tokens: RETRY_MAX_TOKENS,
        temperature: 0.1,
        reasoning_effort: "none",
      });
    } else {
      throw error;
    }
  }
  return parseJsonLoose(raw);
}

async function inferRow(row: TargetRow): Promise<TargetInference> {
  let result = validate(await callModel(row));
  if (!result.ok) {
    result = validate(await callModel(row, result.errors.join("; ")));
  }
  if (!result.ok) {
    throw new Error(`invalid after retry: ${result.errors.join("; ")}`);
  }
  return result.value;
}

// ── Main ─────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const force = args.includes("--force");
  const limitIdx = args.indexOf("--limit");
  const limit =
    limitIdx !== -1 && args[limitIdx + 1] ? Number(args[limitIdx + 1]) : null;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL is not set.");
    process.exit(1);
  }
  const pool = new Pool({ connectionString: databaseUrl });

  // Open rows only (the working queue). A confirmed classification is
  // a human decision and is never re-inferred, --force or not.
  const rows = (
    await pool.query<TargetRow>(
      `SELECT tr.id, tr.title, tr.need_statement, tr.requestor_unit,
              tr.origin, tr.track,
              oir.inferred_track,
              oir.description AS idea_description
       FROM tech_requests tr
       LEFT JOIN oit_idea_requests oir ON oir.source_key = tr.oit_idea_key
       WHERE tr.disposition = 'open'
         AND tr.target_confidence IS DISTINCT FROM 'confirmed'
         ${force ? "" : "AND tr.target_inferred_at IS NULL"}
       ORDER BY tr.received_at DESC
       ${limit ? `LIMIT ${limit}` : ""}`
    )
  ).rows;

  console.log(
    `${rows.length} open request(s) to infer${force ? " (--force)" : ""}${limit ? ` (limit ${limit})` : ""}.`
  );
  if (dryRun) {
    for (const row of rows) console.log(`  [${row.origin}] ${row.title}`);
    console.log("--dry-run: no MindRouter calls, no writes.");
    await pool.end();
    return;
  }
  if (rows.length === 0) {
    await pool.end();
    return;
  }

  const model = currentMindRouterModel();
  console.log(`Model: ${model}, concurrency ${CONCURRENCY}.\n`);

  const failures: { title: string; error: string }[] = [];
  let done = 0;
  let unclassified = 0;
  const tally = new Map<string, number>();
  const queue = [...rows];

  async function worker(): Promise<void> {
    for (;;) {
      const row = queue.shift();
      if (!row) return;
      try {
        const inf = await inferRow(row);
        if (inf.target === null) {
          // Provenance still recorded so the row isn't re-queued every
          // run; target/confidence stay NULL (the unclassified pool).
          await pool.query(
            `UPDATE tech_requests SET
               target_inference_rationale = $2,
               target_inference_model = $3,
               target_inferred_at = now()
             WHERE id = $1`,
            [row.id, inf.rationale, model]
          );
          unclassified++;
        } else {
          await pool.query(
            `UPDATE tech_requests SET
               proposed_deployment_target = $2,
               target_confidence = 'inferred',
               target_inference_rationale = $3,
               target_inference_model = $4,
               target_inferred_at = now()
             WHERE id = $1`,
            [row.id, inf.target, inf.rationale, model]
          );
          tally.set(inf.target, (tally.get(inf.target) ?? 0) + 1);
        }
        done++;
        console.log(
          `  ✓ (${done}/${rows.length}) ${row.title.slice(0, 55).padEnd(55)} ${inf.target ?? "(unclassified)"}`
        );
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        failures.push({ title: row.title, error: msg });
        console.warn(`  ✗ ${row.title}: ${msg}`);
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(CONCURRENCY, rows.length) }, worker)
  );
  await pool.end();

  console.log(`\nInferred ${done}/${rows.length}.`);
  for (const [target, n] of [...tally.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${String(n).padStart(3)}  ${target}`);
  }
  if (unclassified > 0) {
    console.log(`  ${String(unclassified).padStart(3)}  (unclassified — null)`);
  }
  if (failures.length > 0) {
    console.warn(
      `${failures.length} failed (re-run to retry just these — they stay NULL):`
    );
    for (const f of failures) console.warn(`  - ${f.title}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Inference pass failed:", err);
  process.exit(1);
});
