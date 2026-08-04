// scripts/infer-idea-requests.ts
//
// The MindRouter inference pass over the OIT IDEA form backlog: reads
// each request's prose description from `oit_idea_requests` and fills
// the `inferred_*` columns (Migration 023) with structured, advisory
// suggestions — suggested UTR track, AI involvement, the named
// commercial tool, a normalized need summary, audience scope, and
// data-sensitivity signals.
//
// Posture (see lib/oit-idea.ts): these are machine claims with
// provenance (inference_model, inferred_at), rendered only as
// "inferred" on any surface, and they NEVER write
// tech_requests.track/stage — track assignment stays triage's call.
//
// The prompt's track/vocabulary definitions are built from the same
// typed modules the site renders (lib/utr.ts, lib/oit-idea.ts), so the
// model classifies against exactly the vocabulary triage uses.
//
// Every response is validated against the typed guards; an invalid
// response gets one corrective retry with the validation errors
// appended, then the row is skipped with a warning — junk is never
// written.
//
// Usage (needs DATABASE_URL + MINDROUTER_API_KEY; MINDROUTER_MODEL
// optional):
//   npm run infer:idea-requests                # rows not yet inferred
//   npm run infer:idea-requests -- --limit 3   # smoke test
//   npm run infer:idea-requests -- --force     # re-infer everything
//   npm run infer:idea-requests -- --dry-run   # list target rows, no calls

import { Pool } from "pg";
import {
  ask,
  parseJsonLoose,
  currentMindRouterModel,
  MindRouterError,
} from "../lib/mindrouter.js";
import { INTAKE_TRACK_TITLE } from "../lib/utr.js";
import {
  isIdeaSuggestedTrack,
  isIdeaAiInvolvement,
  isIdeaAudienceScope,
  isIdeaDataSignal,
  IDEA_DATA_SIGNAL_LABEL,
  type IdeaInference,
  type IdeaDataSignal,
} from "../lib/oit-idea.js";

const CONCURRENCY = 3;
const MAX_TOKENS = 4096;
const RETRY_MAX_TOKENS = 8192;

interface TargetRow {
  source_key: string;
  title: string;
  dept: string;
  description: string;
}

// ── Prompt ───────────────────────────────────────────────────────────

const DATA_SIGNAL_DEFS = (
  Object.entries(IDEA_DATA_SIGNAL_LABEL) as [IdeaDataSignal, string][]
)
  .map(([slug, label]) => `"${slug}" (${label})`)
  .join(", ");

const SYSTEM_PROMPT = `You classify technology requests submitted to the University of Idaho's OIT IDEA form. Given a request's title, requesting department, and prose description, return ONLY a JSON object with exactly these fields:

{
  "track": "fast-lane" | "track-a" | "track-b" | "track-c",
  "ai_involvement": "none" | "ai-feature" | "ai-core",
  "tool": string | null,
  "need_summary": string,
  "audience_scope": "individual" | "course" | "department" | "college" | "campus",
  "data_signals": string[]
}

Field definitions:

- track — which intake track the request belongs on:
  - "fast-lane": ${INTAKE_TRACK_TITLE["fast-lane"]}
  - "track-a": ${INTAKE_TRACK_TITLE["track-a"]}
  - "track-b": ${INTAKE_TRACK_TITLE["track-b"]}
  - "track-c": ${INTAKE_TRACK_TITLE["track-c"]}
  Requests to buy, license, subscribe to, or integrate an existing commercial product are track-a (or fast-lane when it is a low-risk single-user purchase). Requests where something new would have to be designed or built are track-c. track-b applies only when the requestor has already built a working application.

- ai_involvement: "ai-core" when AI/LLM functionality is the point of the request; "ai-feature" when the requested product happens to include AI capabilities but the need itself is not AI; "none" when no AI involvement is apparent. Classify from what the text says, not what a product might offer.

- tool: the specific commercial product or vendor named in the request (e.g. "Articulate 360", "Boodlebox"). null when no specific product is named.

- need_summary: 1–2 plain factual sentences stating who needs what and why. No hype, no recommendation, no editorializing.

- audience_scope: who would use it — "individual" (one person or a small team), "course" (students in specific courses), "department", "college", or "campus" (institution-wide).

- data_signals: every category the request plausibly touches, from: ${DATA_SIGNAL_DEFS}. Empty array when none are apparent. Be conservative — flag what the text supports, not every theoretical possibility.

Return ONLY the JSON object, no markdown fences, no commentary.`;

function userMessage(row: TargetRow): string {
  return `Title: ${row.title}\nDepartment: ${row.dept}\nDescription:\n${row.description}`;
}

// ── Validation ───────────────────────────────────────────────────────

function validate(
  raw: unknown
): { ok: true; value: IdeaInference } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const o = (raw ?? {}) as Record<string, unknown>;

  if (!isIdeaSuggestedTrack(o.track)) {
    errors.push(`track: got ${JSON.stringify(o.track)}`);
  }
  if (!isIdeaAiInvolvement(o.ai_involvement)) {
    errors.push(`ai_involvement: got ${JSON.stringify(o.ai_involvement)}`);
  }
  if (typeof o.need_summary !== "string" || !o.need_summary.trim()) {
    errors.push("need_summary: missing or empty");
  }
  if (!isIdeaAudienceScope(o.audience_scope)) {
    errors.push(`audience_scope: got ${JSON.stringify(o.audience_scope)}`);
  }
  if (!Array.isArray(o.data_signals)) {
    errors.push("data_signals: not an array");
  }
  if (errors.length > 0) return { ok: false, errors };

  // Unknown data signals are dropped with a warning rather than failing
  // the row — the flag list is advisory and the model may over-reach.
  const signals = [...new Set(o.data_signals as unknown[])].filter((s) => {
    if (isIdeaDataSignal(s)) return true;
    console.warn(`    ⚠ dropping unknown data signal ${JSON.stringify(s)}`);
    return false;
  }) as IdeaDataSignal[];

  const toolRaw = typeof o.tool === "string" ? o.tool.trim() : null;
  const tool =
    toolRaw && !/^(null|none|n\/a)$/i.test(toolRaw) ? toolRaw : null;

  return {
    ok: true,
    value: {
      track: o.track as IdeaInference["track"],
      aiInvolvement: o.ai_involvement as IdeaInference["aiInvolvement"],
      tool,
      needSummary: (o.need_summary as string).trim().slice(0, 600),
      audienceScope: o.audience_scope as IdeaInference["audienceScope"],
      dataSignals: signals,
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

async function inferRow(row: TargetRow): Promise<IdeaInference> {
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

  const rows = (
    await pool.query<TargetRow>(
      `SELECT source_key, title, dept, description
       FROM oit_idea_requests
       ${force ? "" : "WHERE inferred_at IS NULL"}
       ORDER BY created_at DESC
       ${limit ? `LIMIT ${limit}` : ""}`
    )
  ).rows;

  console.log(
    `${rows.length} row(s) to infer${force ? " (--force)" : ""}${limit ? ` (limit ${limit})` : ""}.`
  );
  if (dryRun) {
    for (const row of rows) console.log(`  ${row.title}`);
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
  const queue = [...rows];

  async function worker(): Promise<void> {
    for (;;) {
      const row = queue.shift();
      if (!row) return;
      try {
        const inf = await inferRow(row);
        await pool.query(
          `UPDATE oit_idea_requests SET
             inferred_track = $2,
             inferred_ai_involvement = $3,
             inferred_tool = $4,
             inferred_need_summary = $5,
             inferred_audience_scope = $6,
             inferred_data_signals = $7,
             inference_model = $8,
             inferred_at = now()
           WHERE source_key = $1`,
          [
            row.source_key,
            inf.track,
            inf.aiInvolvement,
            inf.tool,
            inf.needSummary,
            inf.audienceScope,
            inf.dataSignals,
            model,
          ]
        );
        done++;
        const signals = inf.dataSignals.length
          ? ` [${inf.dataSignals.join(",")}]`
          : "";
        console.log(
          `  ✓ (${done}/${rows.length}) ${row.title.slice(0, 55).padEnd(55)} ${inf.track} · ${inf.aiInvolvement} · ${inf.audienceScope}${signals}${inf.tool ? ` · ${inf.tool}` : ""}`
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
  if (failures.length > 0) {
    console.warn(`${failures.length} failed (re-run to retry just these — they stay NULL):`);
    for (const f of failures) console.warn(`  - ${f.title}`);
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error("Inference pass failed:", err);
  process.exit(1);
});
