// Agent eval runner — see Epic #107, Slice #112.
//
// Runs each case in evals/agent/golden.json through the live agent loop
// (which talks to MindRouter), scores per metrics.ts, prints a summary
// + per-case detail, exits 0 on threshold met / 1 on missed.
//
// Required env: MINDROUTER_API_KEY, DATABASE_URL (the search_portfolio
// tool reads the live applications table). For local runs, an SSH tunnel
// to the dev DB on :5433 is the easy path — see CLAUDE.md.
//
// Usage:
//   npm run eval:agent                  # full set, default thresholds
//   npm run eval:agent -- --tags refusal     # filter by tag
//   npm run eval:agent -- --case openera-detail  # single case by id

import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runAgent } from "../../lib/agent/loop";
import {
  aggregate,
  scoreCase,
  type AggregateMetrics,
  type CaseScore,
  type GoldenCase,
  type GoldenSet,
} from "./metrics";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Default thresholds (per Slice #112 acceptance: ≥80% on the seed set).
// Bumped per-axis once more tools land and the model has more to do.
const THRESHOLDS = {
  citationRate: 0.8,
  toolSelectionRate: 0.8,
  refusalRate: 0.8,
  overallRate: 0.7,
};

interface CliArgs {
  tags?: string[];
  caseId?: string;
  json?: boolean;
}

function parseArgs(argv: string[]): CliArgs {
  const out: CliArgs = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--tags" && argv[i + 1]) {
      out.tags = argv[++i]!.split(",").map((s) => s.trim()).filter(Boolean);
    } else if (a === "--case" && argv[i + 1]) {
      out.caseId = argv[++i];
    } else if (a === "--json") {
      out.json = true;
    }
  }
  return out;
}

function loadGoldenSet(): GoldenSet {
  const path = resolve(__dirname, "golden.json");
  const raw = readFileSync(path, "utf8");
  return JSON.parse(raw) as GoldenSet;
}

function filterCases(cases: GoldenCase[], args: CliArgs): GoldenCase[] {
  let out = cases;
  if (args.caseId) {
    out = out.filter((c) => c.id === args.caseId);
  }
  if (args.tags && args.tags.length > 0) {
    out = out.filter((c) =>
      (c.tags ?? []).some((t) => args.tags!.includes(t))
    );
  }
  return out;
}

async function runOne(c: GoldenCase): Promise<CaseScore> {
  try {
    const result = await runAgent({ message: c.question, audience: "public" });
    return scoreCase(c, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return scoreCase(c, null, message);
  }
}

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

function printCaseSummary(s: CaseScore): void {
  const status = s.error
    ? "ERROR"
    : s.overallPass
      ? "PASS "
      : "FAIL ";
  process.stdout.write(`  [${status}] ${s.id.padEnd(28)} ${s.question.slice(0, 70)}\n`);
  if (s.error) {
    process.stdout.write(`           error: ${s.error}\n`);
    return;
  }
  if (s.toolSelection.applicable && !s.toolSelection.pass) {
    process.stdout.write(
      `           tool-selection: missing ${s.toolSelection.missing.join(", ")}\n`
    );
  }
  if (s.citation.applicable && !s.citation.pass) {
    process.stdout.write(
      `           citation: missing ${s.citation.missing.join(", ")}\n`
    );
  }
  if (s.refusal.applicable && !s.refusal.pass) {
    process.stdout.write(`           refusal: ${s.refusal.reason}\n`);
  }
}

function printAggregate(m: AggregateMetrics): void {
  process.stdout.write("\n── Aggregate metrics ────────────────────────────────\n");
  process.stdout.write(`  Total cases:          ${m.total}\n`);
  if (m.errors > 0) {
    process.stdout.write(`  Errors (network/etc): ${m.errors}\n`);
  }
  process.stdout.write(
    `  Tool-selection:       ${pct(m.toolSelection.rate)}  (${m.toolSelection.passed}/${m.toolSelection.applicable})\n`
  );
  process.stdout.write(
    `  Citation accuracy:    ${pct(m.citation.rate)}  (${m.citation.passed}/${m.citation.applicable})\n`
  );
  process.stdout.write(
    `  Refusal correctness:  ${pct(m.refusal.rate)}  (${m.refusal.passed}/${m.refusal.applicable})\n`
  );
  process.stdout.write(
    `  Overall pass:         ${pct(m.overall.rate)}  (${m.overall.passed}/${m.total})\n`
  );
}

function meetsThresholds(m: AggregateMetrics): boolean {
  return (
    m.citation.rate >= THRESHOLDS.citationRate &&
    m.toolSelection.rate >= THRESHOLDS.toolSelectionRate &&
    m.refusal.rate >= THRESHOLDS.refusalRate &&
    m.overall.rate >= THRESHOLDS.overallRate
  );
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const set = loadGoldenSet();
  const cases = filterCases(set.cases, args);

  if (cases.length === 0) {
    process.stderr.write("No cases matched the filter.\n");
    process.exit(1);
  }

  if (!process.env.MINDROUTER_API_KEY) {
    process.stderr.write(
      "MINDROUTER_API_KEY is not set. The eval needs a live MindRouter session.\n"
    );
    process.exit(2);
  }

  process.stdout.write(`Running ${cases.length} case(s) against the live agent loop…\n\n`);

  const scores: CaseScore[] = [];
  for (const c of cases) {
    const score = await runOne(c);
    scores.push(score);
    printCaseSummary(score);
  }

  const metrics = aggregate(scores);

  if (args.json) {
    process.stdout.write(`\n${JSON.stringify({ metrics, scores }, null, 2)}\n`);
  } else {
    printAggregate(metrics);
    process.stdout.write("\nThresholds:\n");
    process.stdout.write(`  citation ≥ ${pct(THRESHOLDS.citationRate)}, `);
    process.stdout.write(`tool-selection ≥ ${pct(THRESHOLDS.toolSelectionRate)}, `);
    process.stdout.write(`refusal ≥ ${pct(THRESHOLDS.refusalRate)}, `);
    process.stdout.write(`overall ≥ ${pct(THRESHOLDS.overallRate)}\n`);
  }

  const ok = meetsThresholds(metrics);
  process.stdout.write(`\n${ok ? "✓ thresholds met" : "✗ thresholds NOT met"}\n`);
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${err instanceof Error ? err.stack : String(err)}\n`);
  process.exit(2);
});
