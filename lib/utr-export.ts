// ============================================================
// UTR export — portfolio projects shaped for the TDX intake form
// ============================================================
// Maps each project in lib/portfolio.ts onto the fields of OIT's
// Unified Technology Request form in TeamDynamix
// (support.uidaho.edu → Services → Technology Request Center →
// Unified Technology Request), so the inventory can be loaded into TDX
// rather than re-keyed.
//
// The form is still being built in the TDX Sandbox (as of 2026-11-16)
// and its choice lists have already changed once. Everything that
// mirrors the form — labels, choice strings, required flags — lives in
// the UTR_FORM_* constants below, so a form revision is a one-place edit
// that tsc carries to every consumer.
//
// Each exported field records where its value came from:
//   derived  — computed from the portfolio entry / governance profile
//   override — set by hand in `utrExportOverrides` below
//   missing  — nothing to send yet; the completeness report lists it
//
// Output only. This module writes nothing to TDX (ADR 0004/0005: no
// write-back). scripts/export-utr.ts turns records into files.
// ============================================================

import {
  type Project,
  type ProjectStatus,
  projects,
} from "./portfolio";
import { resolveGovernanceProfile } from "./governance-profile";
import { isOitManagedEnvironment } from "./project-governance";
import { formatAnnualUsd } from "./roi-rubric";

// ---- Form vocabulary (mirror of the TDX form) ------------------------

/** "What do you need?" — the form's routing question. Strings verbatim. */
export const UTR_REQUEST_TYPES = [
  "Enhancement or change to current application",
  "Deploy a built or developed application",
  "Request to purchase new department or enterprise application",
  "Request to build/develop new department or enterprise application",
  "Request a report or data access",
  "Request for software license",
  "Other",
] as const;
export type UtrRequestType = (typeof UTR_REQUEST_TYPES)[number];

/** "Strategic Plan tie in" — one choice per pillar, keyed by catalog code. */
export const UTR_PILLAR_CHOICES = {
  A: "Ignite student success",
  B: "Drive experiential learning",
  C: "Adapt the educational model",
  D: "Harness research innovation and partnership",
  E: "Optimize operational excellence",
} as const;
type PillarCode = keyof typeof UTR_PILLAR_CHOICES;

/** "Intended Use" — required, multi-select. */
export const UTR_INTENDED_USES = [
  "Myself only",
  "My group/department",
  "For a class",
  "For research",
  "Whole University",
] as const;
export type UtrIntendedUse = (typeof UTR_INTENDED_USES)[number];

// ---- Record shape -----------------------------------------------------

export interface UtrPerson {
  name: string;
  /** TDX resolves people by email; null means it can't yet. */
  email: string | null;
}

export type UtrFieldSource = "derived" | "override" | "missing";

export interface UtrField<T> {
  value: T | null;
  source: UtrFieldSource;
  /** How the value was derived, or why it is missing. */
  note?: string;
}

export interface UtrRecord {
  /** Portfolio slug — the external key the future TDX sync matches on. */
  slug: string;
  requestType: UtrField<UtrRequestType>;
  requestor: UtrField<UtrPerson>;
  contacts: UtrField<UtrPerson[]>;
  acctDept: UtrField<string>;
  requestName: UtrField<string>;
  shortDescription: UtrField<string>;
  justification: UtrField<string>;
  strategicPillars: UtrField<string[]>;
  intendedUse: UtrField<UtrIntendedUse[]>;
}

export type UtrFieldKey = Exclude<keyof UtrRecord, "slug">;

/** Form order, form labels, and which fields the form requires. */
export const UTR_FORM_FIELDS: { key: UtrFieldKey; label: string; required: boolean }[] = [
  { key: "contacts", label: "Contact", required: false },
  { key: "requestType", label: "What do you need?", required: true },
  { key: "requestor", label: "Requestor", required: true },
  { key: "acctDept", label: "Acct/Dept", required: false },
  { key: "requestName", label: "Request Name", required: true },
  { key: "shortDescription", label: "Short Description", required: false },
  { key: "justification", label: "Justification or Business Need", required: false },
  { key: "strategicPillars", label: "Strategic Plan tie in", required: false },
  { key: "intendedUse", label: "Intended Use", required: true },
];

// ---- Hand-set values, keyed by portfolio slug ------------------------
// Sparse. Only what the portfolio entry can't supply:
//   shortDescription — the form wants a user story ("As a …, I need …
//     so that …"); nothing in the portfolio is written that way.
//   intendedUse — `productionScope` covers department vs. university;
//     "For a class" and "For research" need a human.
//   requestType — the derivation can't tell "deploy" from "enhancement"
//     for every project; set it here when it guesses wrong.
//   acctDept — the TDX account name, when it differs from homeUnits[0].

export interface UtrExportOverride {
  requestType?: UtrRequestType;
  shortDescription?: string;
  intendedUse?: UtrIntendedUse[];
  acctDept?: string;
}

// shortDescription and intendedUse values below were drafted 2026-11-16
// from each entry's description and await owner review. "For research"
// means the app is used in research itself, not in research
// administration (owner decision 2026-11-16). Edit freely; each owner submits
// as Requestor, so the story should read as theirs.
export const utrExportOverrides: Record<string, UtrExportOverride> = {
  "stratplan": {
    shortDescription:
      "As a university executive, I need to see how each unit's tactics line up with the 2025–2030 Strategic Plan so that I can spot under-served priorities and make better investment decisions.",
  },
  "water-law-database": {
    shortDescription:
      "As a legislator, water manager, or water-rights holder, I need to search Idaho's water-law decisions, records, and settlements in plain language so that I can get verified answers without reopening disputes that were already settled.",
    intendedUse: ["For research"],
  },
  "audit-dashboard": {
    shortDescription:
      "As an Internal Audit staff member, I need to track every audit observation and corrective action through to closure so that I can see which items are overdue and who is responsible for them.",
    intendedUse: ["My group/department"],
  },
  "historical-contracts": {
    shortDescription:
      "As a Purchasing staff member, I need the required fields pulled from about 1,400 older contracts so that I can submit them to the State Transparency Database without keying each one by hand.",
    intendedUse: ["My group/department"],
  },
  "ongoing-contracts": {
    shortDescription:
      "As a Purchasing staff member, I need the required fields pulled from new contracts as they arrive so that our State Transparency Database uploads stay complete and current.",
    intendedUse: ["My group/department"],
  },
  "out-of-state-tax-tracking": {
    shortDescription:
      "As a Payroll staff member, I need to track tax withholding for employees who work outside Idaho so that I can send the right amounts to the right states without moving data between systems by hand.",
    intendedUse: ["My group/department"],
  },
  "retroactive-payment-requests": {
    shortDescription:
      "As a payroll analyst, I need retroactive pay requests to arrive complete and already checked against Banner so that I can process late or missed hours without chasing corrections.",
  },
  "bid-waiver-document-review": {
    shortDescription:
      "As a purchasing approver, I need purchase quotes and bid-waiver justifications checked against procurement rules so that I can approve sourcing decisions with a clear record that auditors can follow.",
    intendedUse: ["My group/department"],
  },
  "financial-planning-suite": {
    shortDescription:
      "As a Budget Office staff member, I need a tool to take in, score, and budget capital projects so that the university can leave its Axiom contract before it ends in 2027 without losing that work.",
    intendedUse: ["My group/department"],
  },
  "bls-cupa-code-prediction": {
    shortDescription:
      "As an HR classification specialist, I need suggested occupation codes for each job description so that I can confirm a code instead of looking each one up.",
    intendedUse: ["My group/department"],
  },
  "ucm-daily-register": {
    shortDescription:
      "As a member of the UCM newsletter team, I need community submissions edited to AP and university style and assembled into the newsletter so that I can publish The Daily Register and My UI with less manual editing.",
    intendedUse: ["My group/department"],
  },
  "mindrouter-video-storyboard": {
    shortDescription:
      "As a UCM video producer, I need to mock up an advertisement as a rough video storyboard before filming so that I can test and share ideas before committing to a shoot.",
    intendedUse: ["My group/department"],
  },
  "vandalizer": {
    shortDescription:
      "As a research administrator, I need to pull key details from funding announcements, awards, and contracts and ask questions of those documents so that I can review them faster and point to the source of each answer.",
    intendedUse: ["Whole University"],
  },
  "processmapping": {
    shortDescription:
      "As a research administration leader, I need a record of who does each step in our processes and which systems and documents they use so that I can find gaps and define what new tools such as OpenERA must do.",
    intendedUse: ["My group/department"],
  },
  "openera": {
    shortDescription:
      "As a sponsored programs staff member, I need one system to manage proposals, awards, compliance, and reporting so that the university can replace VERAS, its current research administration system.",
    intendedUse: ["Whole University"],
  },
  "execord": {
    shortDescription:
      "As a compliance officer or university counsel, I need new federal and Idaho laws and rules checked against university policy so that I can see which ones create obligations or risk for the university and act on them.",
    intendedUse: ["My group/department"],
  },
  "rag-eval": {
    shortDescription:
      "As a developer of the university's AI search tools, I need to test search changes against published benchmarks so that I can tell whether a change made answers better or worse before it reaches users.",
    intendedUse: ["My group/department"],
  },
  "sem-experiential": {
    shortDescription:
      "As a Strategic Enrollment Management staff member, I need one record of student events, attendance, and organizations so that I can track experiential learning and, later, give students a verified record of their experiences.",
    intendedUse: ["Whole University"],
  },
  "sidearm-pipeline": {
    shortDescription:
      "As a Sports Information Director, I need a verified, searchable archive of game and season statistics so that I can research records and confirm notable achievements with the source for each number.",
    intendedUse: ["My group/department"],
  },
  "rfd-companion": {
    shortDescription:
      "As a Research and Faculty Development staff member, I need one workspace for service requests, proposal deadlines, faculty programs, competitions, and events so that I can see everything our office owes and retire separate tools such as InfoReady.",
    intendedUse: ["Whole University"],
  },
  "universo": {
    shortDescription:
      "As a researcher, student, or outside partner, I need to search University of Idaho research in plain language so that I can find the right people, projects, and publications.",
    intendedUse: ["Whole University"],
  },
  "accessforge": {
    shortDescription:
      "As a faculty or staff member who publishes documents, I need to check my PDFs for accessibility problems and fix them so that what I publish meets WCAG 2.1 AA and ADA Title II requirements.",
    intendedUse: ["Whole University"],
  },
  "campus-services-maintenance": {
    shortDescription:
      "As a Campus Services technician, I need to log maintenance and repairs from my phone and see what service is due so that we keep a service history for every piece of equipment and can decide when to repair or replace it.",
    intendedUse: ["My group/department"],
  },
  "bank-reconciliation": {
    shortDescription:
      "As a Business Operations accountant, I need to match bank statements against Banner general ledger exports so that I can produce the reconciliation statement auditors expect, with a record of every match.",
    intendedUse: ["My group/department"],
  },
  "rcds-invoicing": {
    shortDescription:
      "As an RCDS staff member who handles billing, I need quarterly invoices built from our tracked time and rates and emailed to clients so that I can bill accurately without a manual spreadsheet process.",
    intendedUse: ["My group/department"],
  },
  "governance-registry": {
    shortDescription:
      "As a Data Governance Council co-chair or member, I need one versioned record of the council's documents, meetings, and decisions so that members and the campus can see what the council considered and decided.",
    intendedUse: ["Whole University"],
  },
  "curriculum-atlas": {
    shortDescription:
      "As an academic leader reviewing program health, I need to see which programs depend on courses taught by other departments so that I can plan curriculum changes and explain those connections to the State Board of Education.",
    intendedUse: ["My group/department"],
  },
  "dissertation-formatter": {
    shortDescription:
      "As a graduate student, I need my thesis or dissertation put into the official College of Graduate Studies template without changes to my text so that I can submit a correctly formatted document without formatting it by hand.",
    intendedUse: ["Whole University"],
  },
  "mindrouter": {
    shortDescription:
      "As a developer or staff member using university AI tools, I need one shared, university-hosted way to reach AI models so that every application gets fair access, usage limits, and an audit trail while the data stays on university systems.",
    intendedUse: ["Whole University"],
  },
  "mindrouter-365": {
    shortDescription:
      "As a staff member, I need an AI assistant inside Word, Excel, PowerPoint, Outlook, and Teams that runs on university systems so that I can get help with my documents without leaving the apps I already use.",
    intendedUse: ["Whole University"],
  },
  "dgx-stack": {
    shortDescription:
      "As the team that runs the university's AI services, I need on-campus servers that run AI models and read scanned documents so that tools such as Vandalizer, OpenERA, and the Audit Dashboard can process documents without sending them off campus.",
    intendedUse: ["Whole University"],
  },
  "data-infrastructure-pilot": {
    shortDescription:
      "As a developer of university AI applications, I need governed, documented access to institutional data such as Banner so that our applications all draw on the same well-defined data.",
    intendedUse: ["My group/department"],
  },
};

// ---- Scope ------------------------------------------------------------

/**
 * Statuses that don't go to TDX: work that is ending or over, and work
 * owned outside IIDS (`tracked`) that its owners would file themselves.
 */
export const UTR_EXCLUDED_STATUSES: readonly ProjectStatus[] = [
  "archived",
  "sunsetting",
  "tracked",
];

export function utrExportableProjects(): Project[] {
  return projects.filter(
    (p) =>
      p.visibility !== "Internal-only" && !UTR_EXCLUDED_STATUSES.includes(p.status),
  );
}

// ---- Derivation -------------------------------------------------------

const PRE_BUILD_STATUSES: readonly ProjectStatus[] = [
  "idea",
  "scoping",
  "approved",
  "building",
];

function deriveRequestType(project: Project): UtrField<UtrRequestType> {
  const { intakeTrack } = resolveGovernanceProfile(project);
  switch (intakeTrack) {
    case "fast-lane":
      return { value: "Request for software license", source: "derived", note: "Fast Lane track" };
    case "track-a":
      return {
        value: "Request to purchase new department or enterprise application",
        source: "derived",
        note: "Track A (bought)",
      };
    case "track-d":
      return { value: "Request a report or data access", source: "derived", note: "Track D" };
    case "external":
      return { value: null, source: "missing", note: "Externally owned; not routed through intake" };
    case "track-c":
    case "track-b":
      break;
  }
  if (PRE_BUILD_STATUSES.includes(project.status)) {
    return {
      value: "Request to build/develop new department or enterprise application",
      source: "derived",
      note: `status ${project.status}: no working build yet`,
    };
  }
  const current = project.currentDeploymentEnvironment;
  if (current && isOitManagedEnvironment(current)) {
    return {
      value: "Enhancement or change to current application",
      source: "derived",
      note: `already on OIT-managed hosting (${current})`,
    };
  }
  return {
    value: "Deploy a built or developed application",
    source: "derived",
    note: `status ${project.status}, not yet on OIT-managed hosting`,
  };
}

function toPerson(owner: { name: string; email?: string }): UtrPerson {
  return { name: owner.name, email: owner.email ?? null };
}

function deriveJustification(project: Project): string {
  const { bottomLineRoi } = resolveGovernanceProfile(project);
  const parts = [project.tagline, project.operationalExcellenceOutcome]
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (/[.!?]$/.test(s) ? s : `${s}.`));
  if (bottomLineRoi) {
    parts.push(
      `Replacing ${bottomLineRoi.systemName} retires a ${formatAnnualUsd(bottomLineRoi.annualUsd)} contract.`,
    );
  }
  return parts.join(" ");
}

function derivePillars(project: Project): UtrField<string[]> {
  const codes = new Set(
    (project.strategicPlanAlignment ?? [])
      .map((c) => c.split(".")[0])
      .filter((c): c is PillarCode => c in UTR_PILLAR_CHOICES),
  );
  const value = (Object.keys(UTR_PILLAR_CHOICES) as PillarCode[])
    .filter((c) => codes.has(c))
    .map((c) => UTR_PILLAR_CHOICES[c]);
  return value.length > 0
    ? { value, source: "derived", note: "pillar letters of strategicPlanAlignment" }
    : { value: null, source: "missing", note: "no strategicPlanAlignment declared" };
}

function deriveIntendedUse(project: Project): UtrField<UtrIntendedUse[]> {
  switch (project.productionScope) {
    case "institution-wide":
      return { value: ["Whole University"], source: "derived", note: "productionScope institution-wide" };
    case "home-unit":
      return { value: ["My group/department"], source: "derived", note: "productionScope home-unit" };
    case "external":
      return { value: null, source: "missing", note: "productionScope external has no form equivalent" };
    default:
      return { value: null, source: "missing", note: "productionScope unset" };
  }
}

export function buildUtrRecord(project: Project): UtrRecord {
  const o = utrExportOverrides[project.slug] ?? {};
  const profile = resolveGovernanceProfile(project);
  const [first, ...rest] = project.operationalOwners;

  const contacts: UtrPerson[] = rest.map(toPerson);
  if (profile.technicalLead && profile.technicalLead !== first?.name) {
    if (!contacts.some((c) => c.name === profile.technicalLead)) {
      contacts.push({ name: profile.technicalLead, email: null });
    }
  }

  return {
    slug: project.slug,
    requestType: o.requestType
      ? { value: o.requestType, source: "override" }
      : deriveRequestType(project),
    requestor: first
      ? { value: toPerson(first), source: "derived", note: "functional owner (operationalOwners[0])" }
      : { value: null, source: "missing", note: "no operationalOwners" },
    contacts:
      contacts.length > 0
        ? { value: contacts, source: "derived", note: "other functional owners + technical lead" }
        : { value: null, source: "missing" },
    acctDept: o.acctDept
      ? { value: o.acctDept, source: "override" }
      : project.homeUnits[0]
        ? {
            value: project.homeUnits[0],
            source: "derived",
            note: "homeUnits[0]; not yet checked against TDX account names",
          }
        : { value: null, source: "missing", note: "no homeUnits" },
    requestName: { value: project.name, source: "derived" },
    shortDescription: o.shortDescription
      ? { value: o.shortDescription, source: "override" }
      : { value: null, source: "missing", note: "user story not yet written" },
    justification: { value: deriveJustification(project), source: "derived" },
    strategicPillars: derivePillars(project),
    intendedUse: o.intendedUse?.length
      ? { value: o.intendedUse, source: "override" }
      : deriveIntendedUse(project),
  };
}

export function buildUtrRecords(): UtrRecord[] {
  return utrExportableProjects().map(buildUtrRecord);
}

// ---- Completeness -----------------------------------------------------

export interface UtrGap {
  slug: string;
  field: UtrFieldKey;
  /** `blocking`: TDX won't accept the record without it. */
  severity: "blocking" | "recommended";
  message: string;
}

export function utrGaps(record: UtrRecord): UtrGap[] {
  const gaps: UtrGap[] = [];
  for (const { key, label, required } of UTR_FORM_FIELDS) {
    const field = record[key];
    if (field.source === "missing") {
      gaps.push({
        slug: record.slug,
        field: key,
        severity: required ? "blocking" : "recommended",
        message: `${label}: ${field.note ?? "no value"}`,
      });
    }
  }
  const requestor = record.requestor.value;
  if (requestor && !requestor.email) {
    gaps.push({
      slug: record.slug,
      field: "requestor",
      severity: "blocking",
      message: `Requestor: no email for ${requestor.name}`,
    });
  }
  const noEmail = (record.contacts.value ?? []).filter((c) => !c.email);
  if (noEmail.length > 0) {
    gaps.push({
      slug: record.slug,
      field: "contacts",
      severity: "recommended",
      message: `Contact: no email for ${noEmail.map((c) => c.name).join(", ")}`,
    });
  }
  return gaps;
}

/** Override keys that don't match a project — a typo would silently drop data. */
export function unknownUtrOverrideSlugs(): string[] {
  const slugs = new Set(projects.map((p) => p.slug));
  return Object.keys(utrExportOverrides).filter((s) => !slugs.has(s));
}

// ---- Flat rendering (CSV / spreadsheet) ------------------------------

function flatten(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.map(flatten).join("; ");
  if (typeof value === "object") {
    const p = value as UtrPerson;
    return p.email ? `${p.name} <${p.email}>` : p.name;
  }
  return String(value);
}

/** One row per record; headers are the form's own labels in form order. */
export function utrRecordToRow(record: UtrRecord): Record<string, string> {
  const row: Record<string, string> = { "Portfolio Slug": record.slug };
  for (const { key, label } of UTR_FORM_FIELDS) {
    row[label] = flatten(record[key].value);
  }
  return row;
}
