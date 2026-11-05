// lib/code-health.ts
//
// Code health for portfolio projects, from the monthly summaries the
// distributed-debt-ledger publishes into data/code-health/ (ADR 0010).
//
// The summaries are machine-written interchange files, one per snapshot
// date, added by a PR the ledger opens. They are never hand-edited. This
// module is the typed seam: it parses every file, rejects anything outside
// the published allowlist, and is the only thing the site reads them through.
// `npm run verify:portfolio` runs the same parser, so a malformed file or an
// unknown project slug fails CI on the ledger's PR, not in production.
//
// Publishing rules (Barrie Robison, 2026-11-04 and 2026-11-05):
//   - summary numbers only: no file paths, function names, hotspots,
//     repository names, error text, or vulnerability counts;
//   - complexity is lizard's score, labeled as the collector's measure;
//   - dependency counts describe the capture date, not the commit;
//   - projects are listed, never ranked against each other.

import fs from "node:fs";
import path from "node:path";

export const CODE_HEALTH_DIR = path.join(process.cwd(), "data", "code-health");
const FILE_PATTERN = /^summary-(\d{4}-\d{2}-\d{2})\.json$/;
const SUPPORTED_SCHEMA = 1;

// ── Types ────────────────────────────────────────────────────────────

export type CodeHealthBasis = "manifest" | "heuristic" | "invalid manifest" | "error";
const BASES: readonly CodeHealthBasis[] = ["manifest", "heuristic", "invalid manifest", "error"];

export interface CodeHealthComponent {
  name: string;
  language: string;
  supported: boolean;
  sourceNloc: number | null;
  testNloc: number | null;
  testToSource: number | null;
  functions: number | null;
  ccnMean: number | null;
  ccnP95: number | null;
  ccnMax: number | null;
  functionsOver10: number | null;
  functionsOver20: number | null;
  /** Radon maintainability index; Python components only. */
  miMean: number | null;
  filesMiBelow20: number | null;
  duplicatedPercent: number | null;
  clones: number | null;
  coverageLinePercent: number | null;
  coverageStatus: string;
}

export interface CodeHealthDependencies {
  status: string;
  lockfiles: number | null;
  manifestsWithoutLock: number | null;
  packages: number | null;
  direct: number | null;
  directBehindMajor: number | null;
  directLatestUnknown: number | null;
  directUnmeasuredLockfiles: number | null;
}

export interface CodeHealthDelivery {
  status: string;
  mergedPrs: number | null;
  botMergedPrs: number | null;
  leadTimeMedianHours: number | null;
  leadTimeP90Hours: number | null;
  changeFailureShare: number | null;
  openIssuesAtEnd: number | null;
  openIssueMedianAgeDays: number | null;
  openIssuesOver90Days: number | null;
  issuesClosed: number | null;
  bugRatio: number | null;
  truncated: boolean;
  incomplete: boolean;
}

export interface CodeHealthProject {
  slug: string;
  commit: string | null;
  commitDate: string | null;
  basis: CodeHealthBasis;
  commitsInWindow: number | null;
  manifestErrors: number;
  gates: Record<string, boolean>;
  components: CodeHealthComponent[];
  dependencies: CodeHealthDependencies;
  delivery: CodeHealthDelivery;
}

export interface CodeHealthSnapshot {
  /** Capture date (YYYY-MM-DD); also the date dependency counts describe. */
  asOf: string;
  tools: Record<string, string>;
  thresholds: Record<string, number>;
  projects: CodeHealthProject[];
}

// ── Portfolio seams ──────────────────────────────────────────────────

/**
 * Measured repositories that are not portfolio entries. They stay in the
 * summary (the ledger measures them for its own purposes) but the site
 * never shows them. A slug in a summary that is neither a portfolio slug
 * nor listed here fails `npm run verify:portfolio`.
 */
export const MEASURED_OUTSIDE_PORTFOLIO = new Set<string>([
  "aispeg",
  "ai4ra-evaluation-explorer",
  "ai4ra-evaluation-harness",
  "ai4ra-mcp-ecfr",
  "ai4ra-prompt-library",
  "eo-compliance",
  "era-migration",
  "expenditures-dashboard",
  "famis",
  "gbrc",
  "i17-program-dashboard",
  "invoice-reconciler",
  "synthetic-personas",
  "vm-dashboard",
  // Superseded repositories measured before 2026-11-05: the standalone
  // ExecOrd repo (execord now lives in RAG_evaluation_tool) and the
  // ui-insight copy of the dissertation formatter (now ui-AI4UI).
  "exec-ord",
  "cogs-formatting",
]);

/**
 * Portfolio projects that share a repository with another project. The
 * repository is measured once, under the project named here.
 */
export const SHARES_REPOSITORY_WITH: Record<string, string> = {
  "rag-eval": "execord",
  "mindrouter-video-storyboard": "mindrouter",
};

// ── Parsing ──────────────────────────────────────────────────────────

type Json = Record<string, unknown>;

class SummaryError extends Error {}

function obj(value: unknown, where: string): Json {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new SummaryError(`${where}: expected an object`);
  }
  return value as Json;
}

function num(o: Json, key: string, where: string): number | null {
  const v = o[key];
  if (v === undefined || v === null) return null;
  if (typeof v !== "number" || !Number.isFinite(v)) {
    throw new SummaryError(`${where}.${key}: expected a number or null`);
  }
  return v;
}

function str(o: Json, key: string, where: string): string | null {
  const v = o[key];
  if (v === undefined || v === null) return null;
  if (typeof v !== "string") throw new SummaryError(`${where}.${key}: expected a string`);
  return v;
}

/** Fails on any key outside the published allowlist, so nothing private rides in. */
function onlyKeys(o: Json, allowed: readonly string[], where: string) {
  const extra = Object.keys(o).filter((k) => !allowed.includes(k));
  if (extra.length > 0) {
    throw new SummaryError(`${where}: fields outside the published allowlist: ${extra.join(", ")}`);
  }
}

const COMPONENT_KEYS = [
  "name", "language", "supported", "source_nloc", "test_nloc", "test_to_source", "functions",
  "ccn_mean", "ccn_p95", "ccn_max", "functions_over_10", "functions_over_20", "mi_mean",
  "files_mi_below_20", "duplicated_percent", "clones", "coverage_line_percent", "coverage_status",
] as const;

const DEPENDENCY_KEYS = [
  "status", "lockfiles", "manifests_without_lock", "packages", "direct", "direct_behind_major",
  "direct_latest_unknown", "direct_unmeasured_lockfiles",
] as const;

const DELIVERY_KEYS = [
  "status", "merged_prs", "bot_merged_prs", "lead_time_hours", "change_failure_share",
  "open_issues_at_end", "open_issue_median_age_days", "open_issues_over_90_days", "issues_closed",
  "bug_ratio", "truncated", "incomplete",
] as const;

const PROJECT_KEYS = [
  "project", "commit", "commit_date", "basis", "commits_in_window", "manifest_errors", "gates",
  "components", "dependencies", "delivery",
] as const;

function parseComponent(raw: unknown, where: string): CodeHealthComponent {
  const c = obj(raw, where);
  onlyKeys(c, COMPONENT_KEYS, where);
  return {
    name: str(c, "name", where) ?? "code",
    language: str(c, "language", where) ?? "unknown",
    supported: c.supported !== false,
    sourceNloc: num(c, "source_nloc", where),
    testNloc: num(c, "test_nloc", where),
    testToSource: num(c, "test_to_source", where),
    functions: num(c, "functions", where),
    ccnMean: num(c, "ccn_mean", where),
    ccnP95: num(c, "ccn_p95", where),
    ccnMax: num(c, "ccn_max", where),
    functionsOver10: num(c, "functions_over_10", where),
    functionsOver20: num(c, "functions_over_20", where),
    miMean: num(c, "mi_mean", where),
    filesMiBelow20: num(c, "files_mi_below_20", where),
    duplicatedPercent: num(c, "duplicated_percent", where),
    clones: num(c, "clones", where),
    coverageLinePercent: num(c, "coverage_line_percent", where),
    coverageStatus: str(c, "coverage_status", where) ?? "not collected",
  };
}

function parseDependencies(raw: unknown, where: string): CodeHealthDependencies {
  const d = obj(raw ?? { status: "not collected" }, where);
  onlyKeys(d, DEPENDENCY_KEYS, where);
  return {
    status: str(d, "status", where) ?? "not collected",
    lockfiles: num(d, "lockfiles", where),
    manifestsWithoutLock: num(d, "manifests_without_lock", where),
    packages: num(d, "packages", where),
    direct: num(d, "direct", where),
    directBehindMajor: num(d, "direct_behind_major", where),
    directLatestUnknown: num(d, "direct_latest_unknown", where),
    directUnmeasuredLockfiles: num(d, "direct_unmeasured_lockfiles", where),
  };
}

function parseDelivery(raw: unknown, where: string): CodeHealthDelivery {
  const d = obj(raw ?? { status: "not collected" }, where);
  onlyKeys(d, DELIVERY_KEYS, where);
  const lead = d.lead_time_hours == null ? {} : obj(d.lead_time_hours, `${where}.lead_time_hours`);
  onlyKeys(lead, ["median", "p90"], `${where}.lead_time_hours`);
  return {
    status: str(d, "status", where) ?? "not collected",
    mergedPrs: num(d, "merged_prs", where),
    botMergedPrs: num(d, "bot_merged_prs", where),
    leadTimeMedianHours: num(lead, "median", `${where}.lead_time_hours`),
    leadTimeP90Hours: num(lead, "p90", `${where}.lead_time_hours`),
    changeFailureShare: num(d, "change_failure_share", where),
    openIssuesAtEnd: num(d, "open_issues_at_end", where),
    openIssueMedianAgeDays: num(d, "open_issue_median_age_days", where),
    openIssuesOver90Days: num(d, "open_issues_over_90_days", where),
    issuesClosed: num(d, "issues_closed", where),
    bugRatio: num(d, "bug_ratio", where),
    truncated: d.truncated === true,
    incomplete: d.incomplete === true,
  };
}

function parseProject(raw: unknown, where: string): CodeHealthProject {
  const p = obj(raw, where);
  onlyKeys(p, PROJECT_KEYS, where);
  const slug = str(p, "project", where);
  if (!slug) throw new SummaryError(`${where}.project: missing`);
  const basis = p.basis;
  if (!BASES.includes(basis as CodeHealthBasis)) {
    throw new SummaryError(`${where}.basis: unknown basis ${JSON.stringify(basis)}`);
  }
  const gatesRaw = obj(p.gates ?? {}, `${where}.gates`);
  const gates: Record<string, boolean> = {};
  for (const [k, v] of Object.entries(gatesRaw)) {
    if (typeof v !== "boolean") throw new SummaryError(`${where}.gates.${k}: expected a boolean`);
    gates[k] = v;
  }
  const components = p.components ?? [];
  if (!Array.isArray(components)) throw new SummaryError(`${where}.components: expected an array`);
  return {
    slug,
    commit: str(p, "commit", where),
    commitDate: str(p, "commit_date", where),
    basis: basis as CodeHealthBasis,
    commitsInWindow: num(p, "commits_in_window", where),
    manifestErrors: num(p, "manifest_errors", where) ?? 0,
    gates,
    components: components.map((c, i) => parseComponent(c, `${where}.components[${i}]`)),
    dependencies: parseDependencies(p.dependencies, `${where}.dependencies`),
    delivery: parseDelivery(p.delivery, `${where}.delivery`),
  };
}

export function parseSummary(raw: unknown, fileDate: string): CodeHealthSnapshot {
  const where = `summary-${fileDate}.json`;
  const s = obj(raw, where);
  onlyKeys(s, ["schema", "as_of", "tools", "thresholds", "projects"], where);
  if (s.schema !== SUPPORTED_SCHEMA) {
    throw new SummaryError(`${where}: schema ${JSON.stringify(s.schema)}, expected ${SUPPORTED_SCHEMA}`);
  }
  const asOf = str(s, "as_of", where);
  if (asOf !== fileDate) throw new SummaryError(`${where}: as_of ${asOf} does not match the file name`);
  if (!Array.isArray(s.projects)) throw new SummaryError(`${where}.projects: expected an array`);
  const projects = s.projects.map((p, i) => parseProject(p, `${where}.projects[${i}]`));
  const seen = new Set<string>();
  for (const p of projects) {
    if (seen.has(p.slug)) throw new SummaryError(`${where}: project ${p.slug} appears twice`);
    seen.add(p.slug);
  }
  return {
    asOf,
    tools: Object.fromEntries(Object.entries(obj(s.tools ?? {}, `${where}.tools`)).map(([k, v]) => [k, String(v)])),
    thresholds: Object.fromEntries(
      Object.entries(obj(s.thresholds ?? {}, `${where}.thresholds`)).map(([k, v]) => [k, Number(v)])
    ),
    projects,
  };
}

let cache: CodeHealthSnapshot[] | null = null;

/** Every published snapshot, oldest first. Throws on a malformed file. */
export function listCodeHealthSnapshots(): CodeHealthSnapshot[] {
  if (cache) return cache;
  const files = fs.existsSync(CODE_HEALTH_DIR) ? fs.readdirSync(CODE_HEALTH_DIR) : [];
  cache = files
    .map((f) => FILE_PATTERN.exec(f))
    .filter((m): m is RegExpExecArray => m !== null)
    .sort((a, b) => a[1].localeCompare(b[1]))
    .map((m) =>
      parseSummary(JSON.parse(fs.readFileSync(path.join(CODE_HEALTH_DIR, m[0]), "utf8")), m[1])
    );
  return cache;
}

export function latestCodeHealthSnapshot(): CodeHealthSnapshot | null {
  const all = listCodeHealthSnapshots();
  return all.length > 0 ? all[all.length - 1] : null;
}

// ── Per-project view ─────────────────────────────────────────────────

export interface CodeHealthPoint {
  asOf: string;
  project: CodeHealthProject;
}

export type ProjectCodeHealth =
  | {
      state: "measured";
      asOf: string;
      project: CodeHealthProject;
      /** Every snapshot in which the project has numbers, oldest first. */
      history: CodeHealthPoint[];
      /** Set when the numbers belong to another project's shared repository. */
      measuredAs: string | null;
    }
  | { state: "not measured"; reason: string; asOf: string | null };

const hasNumbers = (p: CodeHealthProject) =>
  p.basis === "manifest" || p.basis === "heuristic";

/** Fixed, user-facing reasons. Never the collector's error text. */
export const NOT_MEASURED_REASON = {
  noRepository: "No code repository listed, so there is nothing to measure.",
  notListed: "Repository not yet in the collector's list.",
  error: "The collector could not read the repository on the last capture date.",
  invalidManifest:
    "The code-health manifest does not meet the kit's contract, so the collector published no numbers rather than wrong ones.",
  noSnapshot: "No code-health snapshot has been published yet.",
} as const;

export function codeHealthForProject(slug: string, repoUrl: string | undefined): ProjectCodeHealth {
  const snapshots = listCodeHealthSnapshots();
  const latest = snapshots.at(-1);
  if (!latest) return { state: "not measured", reason: NOT_MEASURED_REASON.noSnapshot, asOf: null };

  const measuredAs = SHARES_REPOSITORY_WITH[slug] ?? null;
  const key = measuredAs ?? slug;
  const current = latest.projects.find((p) => p.slug === key);

  if (!current) {
    return {
      state: "not measured",
      reason: repoUrl ? NOT_MEASURED_REASON.notListed : NOT_MEASURED_REASON.noRepository,
      asOf: latest.asOf,
    };
  }
  if (current.basis === "error") {
    return { state: "not measured", reason: NOT_MEASURED_REASON.error, asOf: latest.asOf };
  }
  if (current.basis === "invalid manifest") {
    return { state: "not measured", reason: NOT_MEASURED_REASON.invalidManifest, asOf: latest.asOf };
  }

  const history: CodeHealthPoint[] = [];
  for (const s of snapshots) {
    const p = s.projects.find((x) => x.slug === key);
    if (p && hasNumbers(p)) history.push({ asOf: s.asOf, project: p });
  }
  return { state: "measured", asOf: latest.asOf, project: current, history, measuredAs };
}

// ── Derived figures ──────────────────────────────────────────────────

/** Measured components only; unsupported languages carry no numbers. */
export function measuredComponents(p: CodeHealthProject): CodeHealthComponent[] {
  return p.components.filter((c) => c.supported);
}

function sumOf(values: (number | null)[]): number | null {
  const present = values.filter((v): v is number => v !== null);
  return present.length > 0 ? present.reduce((a, b) => a + b, 0) : null;
}

export function totalSourceNloc(p: CodeHealthProject): number | null {
  return sumOf(measuredComponents(p).map((c) => c.sourceNloc));
}

export function totalTestNloc(p: CodeHealthProject): number | null {
  return sumOf(measuredComponents(p).map((c) => c.testNloc));
}

export function projectTestToSource(p: CodeHealthProject): number | null {
  const src = totalSourceNloc(p);
  const tst = totalTestNloc(p);
  return src && tst !== null ? Math.round((tst / src) * 100) / 100 : null;
}

export function totalFunctionsOver20(p: CodeHealthProject): number | null {
  return sumOf(measuredComponents(p).map((c) => c.functionsOver20));
}

/** Source-NLOC-weighted duplication across components. */
export function projectDuplicatedPercent(p: CodeHealthProject): number | null {
  const rows = measuredComponents(p).filter(
    (c) => c.duplicatedPercent !== null && c.sourceNloc
  );
  const weight = sumOf(rows.map((c) => c.sourceNloc));
  if (!weight) return null;
  const v = rows.reduce((acc, c) => acc + c.duplicatedPercent! * c.sourceNloc!, 0) / weight;
  return Math.round(v * 10) / 10;
}

/** Line coverage only where the summary says the tests ran on the measured commit. */
export function projectCoveragePercent(p: CodeHealthProject): number | null {
  const rows = measuredComponents(p).filter(
    (c) => c.coverageStatus === "measured" && c.coverageLinePercent !== null && c.sourceNloc
  );
  const weight = sumOf(rows.map((c) => c.sourceNloc));
  if (!weight || rows.length !== measuredComponents(p).length) return null;
  const v = rows.reduce((acc, c) => acc + c.coverageLinePercent! * c.sourceNloc!, 0) / weight;
  return Math.round(v * 10) / 10;
}

// ── Labels ───────────────────────────────────────────────────────────

/** Gates are read from configuration: configured is not proof CI enforces them. */
export const GATE_LABEL: Record<string, string> = {
  manifest: "Code-health manifest",
  ci: "Continuous integration",
  python_complexity_limit: "Python complexity limit",
  eslint_complexity_limit: "TypeScript/JavaScript complexity limit",
  coverage_published: "Coverage published from CI",
  secret_scan: "Secret scanning",
};

export const GATE_ORDER = Object.keys(GATE_LABEL);

export const COVERAGE_STATUS_LABEL: Record<string, string> = {
  measured: "Measured on this commit",
  "other commit": "From another commit",
  "not published": "Not published",
  unavailable: "Not available",
  expired: "Report expired",
  unreadable: "Report unreadable",
  "not collected": "Not collected",
};

export const LANGUAGE_LABEL: Record<string, string> = {
  python: "Python",
  typescript: "TypeScript",
  javascript: "JavaScript",
};

export const BASIS_LABEL: Record<CodeHealthBasis, string> = {
  manifest: "Declared by the project",
  heuristic: "Estimated: no manifest",
  "invalid manifest": "Manifest invalid",
  error: "Not measured",
};

export const BASIS_NOTE: Record<"manifest" | "heuristic", string> = {
  manifest:
    "The project's .code-health.toml declares which files are authored source, tests, generated, and vendored, so these numbers count exactly that.",
  heuristic:
    "The project has no code-health manifest, so the collector guessed which files are source, tests, generated, or vendored. Size, test ratio, complexity, and duplication can shift once the project declares them with code-health-kit.",
};

export const COLLECTOR_REPO_URL = "https://github.com/ui-insight/code-health-kit";
