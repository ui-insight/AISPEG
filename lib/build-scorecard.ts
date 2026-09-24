// lib/build-scorecard.ts
//
// The UTR Build Evaluation Scorecard — the Four-Bucket Model (discussion
// draft, workbook "UTR - Build Evaluation Scorecard (Four-Bucket,
// DRAFT).xlsx", 2026-09-13). It replaces the weighted Prioritization
// Rubric v2 (lib/rubric.ts) once Steering/DGC ratify it (OD21); until
// then both are published.
//
// The model deliberately has no composite score and no weights. Each
// candidate build gets one row of real numbers and named facts across
// four buckets, plus a gate that pulls locked-constrained items out of
// comparison entirely. The only calculation is Bucket 1's Net 5-Year $,
// a plain sum (netFiveYear below — the workbook's column L formula).
//
// This module is the typed source of truth for the field vocabulary the
// scorecard tables (Migration 030) deliberately leave un-CHECKed:
// field keys, value kinds, and enum options. Every consumer — the
// importer (scripts/import-scorecard.ts), the read module
// (lib/scorecard-data.ts), and /portfolio/scorecard — reads from here,
// so a rubric revision is an edit to this file and tsc finds the rest.
//
// Scores are evaluator-attributed. A model or a person scores subjects
// in a run; each field value carries its own justification. Several
// evaluators can score the same subject, and the surfaces show them
// side by side rather than averaging them.

export const SCORECARD_RUBRIC_VERSION = "utr-four-bucket-draft-2026-09-13";
export const SCORECARD_SOURCE =
  "UTR - Build Evaluation Scorecard (Four-Bucket, DRAFT).xlsx";
export const SCORECARD_STATUS_NOTE =
  "Discussion draft. Needs the same Steering/DGC ratification the v2 rubric was pending (OD21) before it replaces v2 as the standing W01 model.";

// ---- Buckets ----------------------------------------------------------

export type ScorecardBucket = "gate" | "financial" | "risk" | "impact" | "feasibility";

export interface ScorecardBucketDef {
  key: ScorecardBucket;
  label: string;
  /** Short heading for dense tables. */
  short: string;
  /** What the bucket asks, from the workbook's Read Me. */
  description: string;
}

export const SCORECARD_BUCKETS: readonly ScorecardBucketDef[] = [
  {
    key: "gate",
    label: "Gate",
    short: "Gate",
    description:
      "Checked first. Anything Locked-Constrained is pulled out of comparison entirely, no matter how good its numbers look — a committed multi-year contract, a payment-class or life-safety system, a consortium agreement, or a statutory requirement isn't a live choice to rank.",
  },
  {
    key: "financial",
    label: "Bucket 1 — Financial Case (5-Year)",
    short: "Financial",
    description:
      "Subscription dollars avoided and the actual contract exit date, personnel dollars avoided, the priced cost of the status-quo workaround being eliminated, build cost, ongoing maintenance cost, and a plain Net 5-Year $ total. Includes whether the cost-avoidance moves are reversible if the build stalls, and by when.",
  },
  {
    key: "risk",
    label: "Bucket 2 — Risk",
    short: "Risk",
    description:
      "Data sensitivity and how many people a breach would affect; what breaks and who's affected if the system goes offline and whether a reviewed fallback exists; key-person risk (how many people could maintain it, is it documented); and how hard it would be to exit this build later.",
  },
  {
    key: "impact",
    label: "Bucket 3 — Impact",
    short: "Impact",
    description:
      "How many people would use it, how central it is to their work, which specific strategic priority it ties to, any named compliance mandate it satisfies (with citation, not a vague claim), and whether another unit is already building or buying the same thing.",
  },
  {
    key: "feasibility",
    label: "Bucket 4 — Feasibility",
    short: "Feasibility",
    description:
      "Whether this is a proven pattern or something novel, whether the team has the skills and the bandwidth right now, what else that team's time is spoken for, and a realistic time to a usable version — checked against Bucket 1's savings-start assumption.",
  },
] as const;

// ---- Enum vocabularies ------------------------------------------------
// Slugs are stored; labels are the workbook's dropdown text verbatim.

export const GATE_STATUS_LABEL = {
  "open-candidate": "Open Candidate",
  "locked-constrained": "Locked-Constrained",
  "status-unconfirmed": "Status Unconfirmed",
} as const;
export type GateStatus = keyof typeof GATE_STATUS_LABEL;

export const YES_NO_PARTIAL_LABEL = {
  yes: "Yes",
  no: "No",
  partial: "Partial",
} as const;

export const YES_NO_LABEL = {
  yes: "Yes",
  no: "No",
} as const;

export const DATA_CONFIDENCE_LABEL = {
  observed: "Observed",
  estimated: "Estimated",
  assumed: "Assumed",
  missing: "Missing",
} as const;
export type DataConfidence = keyof typeof DATA_CONFIDENCE_LABEL;

export const EXIT_DIFFICULTY_LABEL = {
  low: "Low",
  medium: "Medium",
  high: "High",
} as const;

export const USAGE_FREQUENCY_LABEL = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  rare: "Rare",
} as const;

export const TECHNICAL_READINESS_LABEL = {
  "proven-pattern": "Proven Pattern",
  "some-unknowns": "Some Unknowns",
  novel: "Novel",
} as const;

// ---- Fields -----------------------------------------------------------

/**
 * Value kinds. `usd`, `count`, `months`, and `year` store in
 * value_numeric; `date` (ISO yyyy-mm-dd), `text`, and `enum` (a slug
 * from `options`) store in value_text.
 */
export type ScorecardFieldKind =
  | "usd"
  | "count"
  | "months"
  | "year"
  | "date"
  | "text"
  | "enum";

export interface ScorecardFieldDef {
  key: string;
  bucket: ScorecardBucket;
  /** Workbook column header, verbatim. */
  label: string;
  /** Workbook column letter on the Build Scorecard tab. */
  column: string;
  kind: ScorecardFieldKind;
  /** slug → label, for `enum` fields. */
  options?: Readonly<Record<string, string>>;
  /** Scoring guidance: what a good answer names. */
  help: string;
}

export const SCORECARD_FIELDS = [
  // Gate
  {
    key: "gate_status",
    bucket: "gate",
    label: "Tier/Gate Status",
    column: "C",
    kind: "enum",
    options: GATE_STATUS_LABEL,
    help: "Locked-Constrained if a committed contract, payment-class or life-safety system, consortium agreement, or statute makes this not a live choice. Status Unconfirmed if nobody has checked.",
  },
  {
    key: "gate_notes",
    bucket: "gate",
    label: "Gate Notes",
    column: "D",
    kind: "text",
    help: "The specific contract, agreement, or condition behind the gate status — or that none was identified.",
  },
  // Bucket 1 — Financial
  {
    key: "subscription_avoided_annual",
    bucket: "financial",
    label: "Subscription $ Avoided (Annual)",
    column: "E",
    kind: "usd",
    help: "Annual license or contract dollars that stop being paid once the build replaces them. Zero when nothing is retired.",
  },
  {
    key: "contract_exit_date",
    bucket: "financial",
    label: "Contract Exit / Sunset Date",
    column: "F",
    kind: "date",
    help: "The actual date the incumbent contract can end, not a hoped-for one.",
  },
  {
    key: "personnel_avoided_annual",
    bucket: "financial",
    label: "Personnel $ Avoided (Annual, loaded)",
    column: "G",
    kind: "usd",
    help: "Loaded salary dollars of a position not filled or not backfilled. Time returned to existing staff is not this — that belongs in status-quo cost.",
  },
  {
    key: "status_quo_cost_eliminated_annual",
    bucket: "financial",
    label: "Status-Quo Cost Eliminated (Annual)",
    column: "H",
    kind: "usd",
    help: "The priced annual cost of the current workaround — staff hours at a loaded rate, outsourced work, error correction.",
  },
  {
    key: "build_cost_one_time",
    bucket: "financial",
    label: "Build Cost (One-Time)",
    column: "I",
    kind: "usd",
    help: "Developer time and any one-time purchases to reach a usable version.",
  },
  {
    key: "maintenance_cost_annual",
    bucket: "financial",
    label: "Annual Maintenance Cost",
    column: "J",
    kind: "usd",
    help: "Ongoing support, hosting, and upkeep per year.",
  },
  {
    key: "savings_start_year",
    bucket: "financial",
    label: "Year Savings Start (1-5)",
    column: "K",
    kind: "year",
    help: "Which year of the five the savings begin. Year 1 means savings the first year.",
  },
  {
    key: "cost_avoidance_reversible",
    bucket: "financial",
    label: "Cost-Avoidance Reversible?",
    column: "M",
    kind: "enum",
    options: YES_NO_PARTIAL_LABEL,
    help: "If the build stalls, can the contract be renewed or the position refilled?",
  },
  {
    key: "point_of_no_return_date",
    bucket: "financial",
    label: "Point-of-No-Return Date",
    column: "N",
    kind: "date",
    help: "The date after which the cost-avoidance move can no longer be undone (a notice-of-non-renewal deadline, a position posting closing).",
  },
  {
    key: "financial_data_confidence",
    bucket: "financial",
    label: "Financial Data Confidence",
    column: "O",
    kind: "enum",
    options: DATA_CONFIDENCE_LABEL,
    help: "Observed = from an invoice, contract, or payroll record. Estimated = derived from stated inputs. Assumed = a placeholder. Missing = no basis.",
  },
  // Bucket 2 — Risk
  {
    key: "data_sensitivity",
    bucket: "risk",
    label: "Data Sensitivity / Classification",
    column: "P",
    kind: "text",
    help: "Classification and the regulated data involved (FERPA, HIPAA, PCI, CUI), or public.",
  },
  {
    key: "people_affected_if_breached",
    bucket: "risk",
    label: "People Affected if Breached (#)",
    column: "Q",
    kind: "count",
    help: "How many people's records a breach would expose.",
  },
  {
    key: "what_breaks_if_offline",
    bucket: "risk",
    label: "What Breaks if Offline",
    column: "R",
    kind: "text",
    help: "Who loses what if the system goes down, and what the fallback is.",
  },
  {
    key: "reviewed_fallback_exists",
    bucket: "risk",
    label: "Reviewed Fallback Exists?",
    column: "S",
    kind: "enum",
    options: YES_NO_LABEL,
    help: "Is there a fallback procedure someone has actually reviewed?",
  },
  {
    key: "maintainer_count",
    bucket: "risk",
    label: "# People Who Could Maintain It",
    column: "T",
    kind: "count",
    help: "Named people who could keep it running today.",
  },
  {
    key: "documented",
    bucket: "risk",
    label: "Documented?",
    column: "U",
    kind: "enum",
    options: YES_NO_PARTIAL_LABEL,
    help: "README, runbook, architecture — enough for someone else to take over.",
  },
  {
    key: "exit_difficulty",
    bucket: "risk",
    label: "Exit Difficulty",
    column: "V",
    kind: "enum",
    options: EXIT_DIFFICULTY_LABEL,
    help: "How hard it would be to leave this build later — data lock-in, integrations, retraining.",
  },
  // Bucket 3 — Impact
  {
    key: "user_count",
    bucket: "impact",
    label: "# Users",
    column: "W",
    kind: "count",
    help: "People who would use it directly.",
  },
  {
    key: "usage_frequency",
    bucket: "impact",
    label: "Usage Frequency",
    column: "X",
    kind: "enum",
    options: USAGE_FREQUENCY_LABEL,
    help: "How often a typical user touches it — a proxy for how central it is to their work.",
  },
  {
    key: "strategic_tie",
    bucket: "impact",
    label: "Strategic Tie",
    column: "Y",
    kind: "text",
    help: "The specific strategic-plan priority (with code, e.g. D.3) it advances, or none.",
  },
  {
    key: "compliance_mandate",
    bucket: "impact",
    label: "Compliance Mandate (named)",
    column: "Z",
    kind: "text",
    help: "A named mandate with citation (e.g. ADA Title II, 28 CFR 35.200), or 'None identified'.",
  },
  {
    key: "known_duplication",
    bucket: "impact",
    label: "Known Duplication?",
    column: "AA",
    kind: "text",
    help: "Another unit already building or buying the same thing, or 'None known'.",
  },
  // Bucket 4 — Feasibility
  {
    key: "technical_readiness",
    bucket: "feasibility",
    label: "Technical Readiness",
    column: "AB",
    kind: "enum",
    options: TECHNICAL_READINESS_LABEL,
    help: "Proven Pattern = the team has shipped this shape before. Novel = nobody has.",
  },
  {
    key: "team_skill_fit",
    bucket: "feasibility",
    label: "Team Assigned & Skill Fit",
    column: "AC",
    kind: "text",
    help: "Who would build it and whether they have shipped comparable work.",
  },
  {
    key: "capacity_available_now",
    bucket: "feasibility",
    label: "Capacity Available Now?",
    column: "AD",
    kind: "enum",
    options: YES_NO_PARTIAL_LABEL,
    help: "Does that team have the time now, not in principle.",
  },
  {
    key: "competing_priorities",
    bucket: "feasibility",
    label: "Competing Priorities",
    column: "AE",
    kind: "text",
    help: "What else the same team's time is spoken for.",
  },
  {
    key: "months_to_usable",
    bucket: "feasibility",
    label: "Est. Time to Usable Version (months)",
    column: "AF",
    kind: "months",
    help: "Realistic months to a version people can use. Zero if already in use.",
  },
  {
    key: "timing_consistent_with_financial_case",
    bucket: "feasibility",
    label: "Timing Consistent w/ Financial Case?",
    column: "AG",
    kind: "enum",
    options: YES_NO_LABEL,
    help: "Does the time to usable version land before Bucket 1's savings-start year?",
  },
] as const satisfies readonly ScorecardFieldDef[];

export type ScorecardFieldKey = (typeof SCORECARD_FIELDS)[number]["key"];

export const SCORECARD_FIELD_KEYS: readonly ScorecardFieldKey[] =
  SCORECARD_FIELDS.map((f) => f.key);

const FIELD_BY_KEY: ReadonlyMap<string, ScorecardFieldDef> = new Map(
  SCORECARD_FIELDS.map((f) => [f.key, f as ScorecardFieldDef])
);

export function isScorecardFieldKey(value: unknown): value is ScorecardFieldKey {
  return typeof value === "string" && FIELD_BY_KEY.has(value);
}

export function scorecardField(key: ScorecardFieldKey): ScorecardFieldDef {
  return FIELD_BY_KEY.get(key)!;
}

export function fieldsInBucket(bucket: ScorecardBucket): ScorecardFieldDef[] {
  return SCORECARD_FIELDS.filter((f) => f.bucket === bucket);
}

/** Numeric kinds store in value_numeric; the rest in value_text. */
export function isNumericKind(kind: ScorecardFieldKind): boolean {
  return kind === "usd" || kind === "count" || kind === "months" || kind === "year";
}

// ---- Values -----------------------------------------------------------

/** One evaluator's answer for one field. `value` null = unknown. */
export interface ScorecardFieldValue {
  value: number | string | null;
  /** Why this value — the required justification. */
  justification: string;
  /** Where the fact came from (document, file, record), when citable. */
  evidence: string | null;
}

export type ScorecardValues = Partial<Record<ScorecardFieldKey, ScorecardFieldValue>>;

/**
 * Validate one raw value against its field definition. Returns an error
 * message, or null when valid. Null values are always valid — "unknown"
 * is an honest answer as long as the justification says why.
 */
export function validateFieldValue(
  field: ScorecardFieldDef,
  value: unknown
): string | null {
  if (value === null) return null;
  switch (field.kind) {
    case "usd":
    case "count":
    case "months":
      return typeof value === "number" && Number.isFinite(value) && value >= 0
        ? null
        : `${field.key}: expected a non-negative number`;
    case "year":
      return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5
        ? null
        : `${field.key}: expected an integer 1–5`;
    case "date":
      return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? null
        : `${field.key}: expected an ISO date (yyyy-mm-dd)`;
    case "text":
      return typeof value === "string" && value.trim() !== ""
        ? null
        : `${field.key}: expected non-empty text`;
    case "enum":
      return typeof value === "string" &&
        Object.prototype.hasOwnProperty.call(field.options ?? {}, value)
        ? null
        : `${field.key}: expected one of ${Object.keys(field.options ?? {}).join(", ")}`;
  }
}

// ---- Net 5-Year $ ---------------------------------------------------------

export interface NetFiveYear {
  /** Null when there is nothing to compute from. */
  total: number | null;
  /** Financial inputs that were unknown and counted as $0. */
  missingInputs: ScorecardFieldKey[];
}

const NET_INPUTS = [
  "subscription_avoided_annual",
  "personnel_avoided_annual",
  "status_quo_cost_eliminated_annual",
  "build_cost_one_time",
  "maintenance_cost_annual",
] as const satisfies readonly ScorecardFieldKey[];

/**
 * The workbook's column L, verbatim:
 *   (Subscription + Personnel + Status-Quo) × (6 − Year Savings Start)
 *   − Build Cost − (Maintenance × 5)
 *
 * The spreadsheet treats a blank cell as 0. So does this, but it reports
 * which inputs were blank so the surface can say the total is partial.
 * A blank savings-start year with non-zero savings has no honest
 * reading (the sheet would silently count six years), so the total is
 * null in that case. All five dollar inputs blank → null, not $0.
 */
export function netFiveYear(values: ScorecardValues): NetFiveYear {
  const num = (key: ScorecardFieldKey): number | null => {
    const v = values[key]?.value;
    return typeof v === "number" ? v : null;
  };
  const missingInputs: ScorecardFieldKey[] = NET_INPUTS.filter(
    (k) => num(k) === null
  );
  if (missingInputs.length === NET_INPUTS.length) {
    return { total: null, missingInputs };
  }
  const annualSavings =
    (num("subscription_avoided_annual") ?? 0) +
    (num("personnel_avoided_annual") ?? 0) +
    (num("status_quo_cost_eliminated_annual") ?? 0);
  const start = num("savings_start_year");
  if (start === null && annualSavings > 0) {
    return { total: null, missingInputs: [...missingInputs, "savings_start_year"] };
  }
  const years = start === null ? 0 : 6 - start;
  const total =
    annualSavings * years -
    (num("build_cost_one_time") ?? 0) -
    (num("maintenance_cost_annual") ?? 0) * 5;
  return { total, missingInputs };
}

// ---- Evaluators ---------------------------------------------------------

/** Structural (CHECKed in Migration 030): who produced a run. */
export type EvaluatorKind = "model" | "human";

export const EVALUATOR_KIND_LABEL: Record<EvaluatorKind, string> = {
  model: "Model",
  human: "Person",
};

export function isEvaluatorKind(value: unknown): value is EvaluatorKind {
  return value === "model" || value === "human";
}

// ---- Display helpers --------------------------------------------------

export function formatUsd(amount: number): string {
  const sign = amount < 0 ? "−" : "";
  return `${sign}$${Math.abs(Math.round(amount)).toLocaleString("en-US")}`;
}

/** Render a stored value in its field's vocabulary. */
export function formatFieldValue(
  field: ScorecardFieldDef,
  value: number | string | null
): string {
  if (value === null) return "Unknown";
  switch (field.kind) {
    case "usd":
      return formatUsd(value as number);
    case "count":
      return (value as number).toLocaleString("en-US");
    case "months":
      return `${value} mo`;
    case "year":
      return `Year ${value}`;
    case "enum":
      return field.options?.[value as string] ?? String(value);
    default:
      return String(value);
  }
}
