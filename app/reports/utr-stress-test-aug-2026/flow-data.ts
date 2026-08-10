// ============================================================
// UTR stress-test — flow-explorer data (point-in-time snapshot)
// ============================================================
// Per-unit classification behind the report's Sankey flow explorer.
// Every unit (a registry request or an inventory project) carries a
// three-step path: source → routing under the draft → deployment target.
//
// Registry rows are a hand-classified snapshot of tech_requests taken
// 2026-08-10 (same cut as the report's aggregate numbers; merged
// duplicates excluded). Routing assignments are INFERRED — the registry
// carries no track assignments yet — and each unit gets exactly one
// dominant classification even where the report's prose lets seams
// overlap. Inventory rows are computed from lib/portfolio.ts at build
// time; each project is its own source node (its tagline is the hover
// summary), built/building work routes to Track B (the draft's track
// for fully realized in-house apps), and its deployment target is the
// environment it actually runs on today (inferred from hosting;
// "Not yet targeted" only for work that genuinely has no target).

import { projects, type Project } from "@/lib/portfolio";
import { resolveGovernanceProfile } from "@/lib/governance-profile";

// ---- Node vocabulary ---------------------------------------------------

export type RegistryOrigin = "oit-idea" | "clickup" | "site-submission" | "direct";

/** Ingestion source — the channel a demand line arrived through. */
export type FlowSource =
  | RegistryOrigin
  | "ored"
  | "unit-partnership"
  | "iids-internal"
  | "oit-portfolio";

export const SOURCE_LABEL: Record<FlowSource, string> = {
  "oit-idea": "OIT IDEA form",
  clickup: "IIDS ClickUp backlog",
  direct: "Direct entry",
  "site-submission": "Site submission",
  ored: "ORED requests",
  "unit-partnership": "Unit partnership",
  "iids-internal": "IIDS internal",
  "oit-portfolio": "OIT portfolio",
};

export const SOURCE_ORDER: FlowSource[] = [
  "oit-idea",
  "clickup",
  "ored",
  "unit-partnership",
  "iids-internal",
  "oit-portfolio",
  "direct",
  "site-submission",
];

export type FlowRoute =
  // Clean routes under the draft
  | "fast-lane"
  | "track-a"
  | "track-b"
  | "track-c"
  | "track-d"
  // The report's fringe seams
  | "seam-platform"
  | "seam-configure"
  | "seam-research"
  | "seam-data-product"
  | "seam-no-requestor"
  // De-emphasized pools
  | "external-tracked"
  | "unclear";

export type FlowDestination =
  | "external-hosted"
  | "nexus-module"
  | "vandalizer-workflow"
  | "databricks-dashboard"
  | "standalone-oci"
  | "standalone-oit-k8s"
  | "rcds-vm"
  | "oit-managed-tbd"
  | "not-applicable"
  | "unclassified";

export type RouteClass = "clean" | "seam" | "muted";

/** Where a demand line stands today — the status color mode. */
export type FlowStatus =
  | "deployed"
  | "piloting"
  | "building"
  | "queued"
  | "requested"
  | "halted"
  | "retired"
  | "tracked";

/** Legend order + label + mark color (CSS token) per status. */
export const STATUS_META: Record<
  FlowStatus,
  { label: string; color: string }
> = {
  deployed: { label: "Deployed", color: "var(--color-chart-clean)" },
  piloting: { label: "Piloting", color: "var(--color-brand-lupine)" },
  building: { label: "Building", color: "var(--color-chart-seam)" },
  queued: { label: "Approved / queued", color: "var(--color-chart-queued)" },
  requested: { label: "Requested (open)", color: "var(--color-chart-requested)" },
  halted: { label: "Paused / not pursued", color: "var(--color-chart-halted)" },
  retired: { label: "Retired", color: "var(--color-chart-retired)" },
  tracked: { label: "Tracked (external)", color: "var(--color-chart-tracked)" },
};

export const STATUS_ORDER: FlowStatus[] = [
  "deployed",
  "piloting",
  "building",
  "queued",
  "requested",
  "halted",
  "retired",
  "tracked",
];

/** Normalized demand line consumed by the explorer (one unit of value). */
export interface FlowUnit {
  /** Unique id — the layer-0 node key (one node per demand line). */
  id: string;
  name: string;
  source: FlowSource;
  route: FlowRoute;
  destination: FlowDestination;
  status: FlowStatus;
  /** True when the line is an inventory project (vs a registry request). */
  isProject: boolean;
  /** Hover summary (project tagline). */
  summary?: string;
}

export const ROUTE_META: Record<
  FlowRoute,
  { label: string; cls: RouteClass }
> = {
  "fast-lane": { label: "Fast lane", cls: "clean" },
  "track-a": { label: "Track A · Standard software", cls: "clean" },
  "track-b": { label: "Track B · Built in-house", cls: "clean" },
  "track-c": { label: "Track C · Idea / concept", cls: "clean" },
  "track-d": { label: "Track D · Data & report access", cls: "clean" },
  "seam-platform": { label: "Seam · Platform itself", cls: "seam" },
  "seam-configure": { label: "Seam · Configure what we own", cls: "seam" },
  "seam-research": { label: "Seam · Research boundary", cls: "seam" },
  "seam-data-product": { label: "Seam · Data product", cls: "seam" },
  "seam-no-requestor": { label: "Seam · No requestor", cls: "seam" },
  "external-tracked": { label: "External — tracked", cls: "muted" },
  unclear: { label: "Unclear — needs triage", cls: "muted" },
};

export const ROUTE_ORDER: FlowRoute[] = [
  "fast-lane",
  "track-a",
  "track-b",
  "track-c",
  "track-d",
  "seam-platform",
  "seam-configure",
  "seam-research",
  "seam-data-product",
  "seam-no-requestor",
  "external-tracked",
  "unclear",
];

export const DESTINATION_LABEL: Record<FlowDestination, string> = {
  "external-hosted": "External / vendor-hosted",
  "nexus-module": "Nexus module",
  "vandalizer-workflow": "Vandalizer workflow",
  "databricks-dashboard": "Databricks dashboard",
  "standalone-oci": "Standalone (OCI)",
  "standalone-oit-k8s": "Standalone (OIT k8s)",
  "rcds-vm": "RCDS-managed VM",
  "oit-managed-tbd": "OIT-managed (TBD)",
  "not-applicable": "Not applicable",
  unclassified: "Not yet targeted",
};

// ---- Registry snapshot (hand-classified, 2026-08-10) -------------------
// 98 rows = tech_requests minus 2 merged duplicates, minus the 9
// ClickUp requests that converted into inventory projects and appear
// as their project line instead (RPR → retroactive-payment-requests,
// CAREER Club meter → rfd-career, ExecOrd review → execord, Water Law
// → water-law-database, Out-of-state tax → out-of-state-tax-tracking,
// Contract extraction → historical-contracts, Bid-waiver →
// bid-waiver-document-review, Vendor Invoices → invoice-processing,
// Daily Register → ucm-daily-register). `destination` mirrors
// proposed_deployment_target (NULL → "unclassified").

interface RequestRow {
  name: string;
  origin: RegistryOrigin;
  route: FlowRoute;
  destination: FlowDestination;
}

export const REQUEST_FLOWS: RequestRow[] = [
  // ClickUp backlog (40)
  { name: "AI Chatbot for Training/Manuals", origin: "clickup", route: "track-c", destination: "vandalizer-workflow" },
  { name: "AI-Assisted SAC Pre-Review Tool", origin: "clickup", route: "track-c", destination: "unclassified" },
  { name: "Check Cancellations & ACH Returns", origin: "clickup", route: "track-c", destination: "nexus-module" },
  { name: "Clery Act Annual Security Report", origin: "clickup", route: "track-c", destination: "vandalizer-workflow" },
  { name: "Drafting RFP/RFQ documents", origin: "clickup", route: "track-c", destination: "vandalizer-workflow" },
  { name: "Employment Verifications", origin: "clickup", route: "track-c", destination: "nexus-module" },
  { name: "Facilities Condition Assessment", origin: "clickup", route: "track-c", destination: "vandalizer-workflow" },
  { name: "Finalizing Payroll (stage)", origin: "clickup", route: "track-c", destination: "not-applicable" },
  { name: "Fund Balance Projections", origin: "clickup", route: "seam-data-product", destination: "databricks-dashboard" },
  { name: "HR Target Pay System", origin: "clickup", route: "track-c", destination: "unclassified" },
  { name: "Hazardous-Waste Tracking (EHS)", origin: "clickup", route: "track-c", destination: "nexus-module" },
  { name: "International Employee Payroll", origin: "clickup", route: "track-c", destination: "nexus-module" },
  { name: "Key Control / Building Access", origin: "clickup", route: "track-c", destination: "nexus-module" },
  { name: "Leave Payout", origin: "clickup", route: "track-c", destination: "nexus-module" },
  { name: "Leave Transfers", origin: "clickup", route: "track-c", destination: "nexus-module" },
  { name: "Manual Timesheets", origin: "clickup", route: "track-c", destination: "not-applicable" },
  { name: "Material Safety Data Sheets", origin: "clickup", route: "track-c", destination: "vandalizer-workflow" },
  { name: "My UI (Student Newsletter)", origin: "clickup", route: "track-c", destination: "unclassified" },
  { name: "Parking: AI Chatbot", origin: "clickup", route: "track-c", destination: "standalone-oci" },
  { name: "Parking: License-Plate Recognition", origin: "clickup", route: "track-c", destination: "standalone-oci" },
  { name: "Post-Payroll Reconciliation", origin: "clickup", route: "seam-data-product", destination: "databricks-dashboard" },
  { name: "Power-Plant P3 Contract Q&A", origin: "clickup", route: "track-c", destination: "vandalizer-workflow" },
  { name: "Program Inventory Clean-up", origin: "clickup", route: "track-c", destination: "not-applicable" },
  { name: "Public-Safety Threat Assessment (denied)", origin: "clickup", route: "track-c", destination: "unclassified" },
  { name: "Staff Fee Waiver System", origin: "clickup", route: "track-c", destination: "nexus-module" },
  { name: "Staff ePAF / HR Reporting", origin: "clickup", route: "seam-data-product", destination: "databricks-dashboard" },
  { name: "Ticketing & routing — purchasing inbox", origin: "clickup", route: "track-c", destination: "nexus-module" },
  { name: "AI for LaTeX formatting (theses)", origin: "clickup", route: "track-c", destination: "unclassified" },
  { name: "Utility Demand & Billing", origin: "clickup", route: "seam-data-product", destination: "databricks-dashboard" },
  { name: "Vendor Registration", origin: "clickup", route: "track-c", destination: "nexus-module" },
  { name: "Work-Order Ticket Analytics (FAMIS)", origin: "clickup", route: "track-c", destination: "nexus-module" },
  // Direct entry (9)
  { name: "Grants & research-administration tooling", origin: "direct", route: "seam-no-requestor", destination: "not-applicable" },
  { name: "Institutional knowledge & policy search", origin: "direct", route: "seam-no-requestor", destination: "vandalizer-workflow" },
  { name: "Onboarding & access automation", origin: "direct", route: "seam-no-requestor", destination: "nexus-module" },
  { name: "Reimbursement & payment status tracker", origin: "direct", route: "seam-no-requestor", destination: "nexus-module" },
  { name: "Repetitive-query response assistant", origin: "direct", route: "seam-no-requestor", destination: "standalone-oci" },
  { name: "Sanctioned AI access & literacy", origin: "direct", route: "seam-no-requestor", destination: "not-applicable" },
  { name: "Self-serve unit budget view", origin: "direct", route: "seam-no-requestor", destination: "databricks-dashboard" },
  { name: "Student resource navigator", origin: "direct", route: "seam-no-requestor", destination: "external-hosted" },
  { name: "VandalChat — campus AI chat on MindRouter", origin: "direct", route: "track-b", destination: "standalone-oit-k8s" },
  // OIT IDEA form (56)
  { name: "12Twenty migration", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "AI options for EMAIL", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "AI-Detection Purchase (GPTZero / Winston AI)", origin: "oit-idea", route: "seam-research", destination: "external-hosted" },
  { name: "API setup — ALEKS / AVANT testing", origin: "oit-idea", route: "seam-configure", destination: "standalone-oci" },
  { name: "Accounts Payable in TDX", origin: "oit-idea", route: "seam-configure", destination: "not-applicable" },
  { name: "Re:Members payment option on Campus Director", origin: "oit-idea", route: "seam-configure", destination: "external-hosted" },
  { name: "Admin-Ops / ESS tech work orders", origin: "oit-idea", route: "seam-configure", destination: "external-hosted" },
  { name: "Adobe Acrobat integration", origin: "oit-idea", route: "seam-configure", destination: "external-hosted" },
  { name: "Argos X", origin: "oit-idea", route: "seam-configure", destination: "external-hosted" },
  { name: "Articulate 360 AI Teams", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "Boodle.ai (SBOE partnership)", origin: "oit-idea", route: "seam-research", destination: "external-hosted" },
  { name: "Boodlebox", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "CAFE Research Dairy — feed software", origin: "oit-idea", route: "seam-research", destination: "external-hosted" },
  { name: "CAFE Research Dairy — herd management", origin: "oit-idea", route: "seam-research", destination: "external-hosted" },
  { name: "Campus Community (education abroad)", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "ClickUp and Claude", origin: "oit-idea", route: "seam-configure", destination: "standalone-oci" },
  { name: "Connectors for Claude Enterprise", origin: "oit-idea", route: "seam-configure", destination: "external-hosted" },
  { name: "Elicit.com", origin: "oit-idea", route: "seam-research", destination: "external-hosted" },
  { name: "Employment Outreach", origin: "oit-idea", route: "unclear", destination: "not-applicable" },
  { name: "Streamline software (Dean of Students)", origin: "oit-idea", route: "unclear", destination: "external-hosted" },
  { name: "Facial Recognition", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "Facilities Work Order System", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "Flare — student section app", origin: "oit-idea", route: "track-a", destination: "standalone-oci" },
  { name: "Garmin GPS software install (lab teaching)", origin: "oit-idea", route: "fast-lane", destination: "external-hosted" },
  { name: "H5P interactive learning content", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "Human Resources Chat Bot", origin: "oit-idea", route: "track-c", destination: "nexus-module" },
  { name: "Orthotics scanning software (Athletics)", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "Research Integrity ticketing system", origin: "oit-idea", route: "seam-configure", destination: "nexus-module" },
  { name: "Keep Learning CMS purchase", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "Learning Stream", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "Linux in the ECE CompE labs", origin: "oit-idea", route: "unclear", destination: "external-hosted" },
  { name: "LiveBinders for 4-H", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "MEADOW pre-collections platform", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "Mobile exam scoring", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "Motion Money — NIL third-party payor", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "NACUBO Toolkits", origin: "oit-idea", route: "unclear", destination: "external-hosted" },
  { name: "Surpass Assessment (NextGen Bar)", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "Opentrons Flex static IP", origin: "oit-idea", route: "seam-configure", destination: "external-hosted" },
  { name: "Photo Mechanic", origin: "oit-idea", route: "fast-lane", destination: "external-hosted" },
  { name: "Metabolic cart with bundled software", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "Podium Global Career Accelerator", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "Pressbooks as a Canvas LTI", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "Print operations software", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "Proctoring software", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "RFD TeamUp", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "Applicant Tracking System replacement", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "ProMax production server replacement", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "Required Safety Program", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "SAS JMP enterprise licensing", origin: "oit-idea", route: "seam-research", destination: "external-hosted" },
  { name: "SSB Access for Alumni", origin: "oit-idea", route: "track-d", destination: "not-applicable" },
  { name: "Stella Architect (ESPA research)", origin: "oit-idea", route: "seam-research", destination: "external-hosted" },
  { name: "TDX knowledge base setup", origin: "oit-idea", route: "seam-configure", destination: "external-hosted" },
  { name: "TDX portal development for CNR", origin: "oit-idea", route: "seam-configure", destination: "nexus-module" },
  { name: "TRIO time & effort reporting form", origin: "oit-idea", route: "track-c", destination: "nexus-module" },
  { name: "Visible Body course software", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  { name: "XYZ Homework", origin: "oit-idea", route: "track-a", destination: "external-hosted" },
  // Site submissions (2)
  { name: "AI Search Visibility & GEO Evaluation", origin: "site-submission", route: "unclear", destination: "not-applicable" },
  { name: "Student housing finder app", origin: "site-submission", route: "track-c", destination: "standalone-oci" },
];

// ---- Inventory flows (computed from lib/portfolio.ts) ------------------
// Each project is its own demand line. Routing: built/building in-house
// work is Track B (the draft's own definition — a fully realized app
// needing review and hosting); not-yet-built ideas are Track C; the
// platforms and externally-owned programs keep their seam/pool nodes.

const PLATFORM_SLUGS = new Set(["mindrouter", "dgx-stack"]);

// Ingestion source per project — the channel the work arrived through.
// ORED requests came via research-office channels; "clickup" marks
// projects whose demand line entered as an AI4UI ClickUp request (the
// converted rows merged above); unit partnerships arrived by direct
// relationship with the owning unit; IIDS-internal work is platform and
// scaffold investment; the OIT portfolio is externally tracked.
const INVENTORY_SOURCE: Record<string, FlowSource> = {
  vandalizer: "ored",
  openera: "ored",
  processmapping: "ored",
  execord: "ored",
  "rfd-companion": "ored",
  "rfd-career": "ored",
  "retroactive-payment-requests": "clickup",
  "water-law-database": "clickup",
  "out-of-state-tax-tracking": "clickup",
  "historical-contracts": "clickup",
  "bid-waiver-document-review": "clickup",
  "invoice-processing": "clickup",
  "ucm-daily-register": "clickup",
  mindrouter: "iids-internal",
  "dgx-stack": "iids-internal",
  "template-app": "iids-internal",
  "data-infrastructure-pilot": "iids-internal",
  stratplan: "unit-partnership",
  "audit-dashboard": "unit-partnership",
  "ongoing-contracts": "unit-partnership",
  "mindrouter-video-storyboard": "unit-partnership",
  "sem-experiential": "unit-partnership",
  "sidearm-pipeline": "unit-partnership",
  universo: "unit-partnership",
  "bls-cupa-code-prediction": "unit-partnership",
  "financial-planning-suite": "unit-partnership",
  "oit-data-modernization": "oit-portfolio",
  "ir-reporting-modernization": "oit-portfolio",
  nexus: "oit-portfolio",
};

// Deployment target per project — the environment it runs on today (or
// is targeted at), INFERRED from current hosting. Everything serving
// from the insight.uidaho.edu docker host sits on the RCDS-managed VM.
// Absent from this map → "unclassified" (genuinely not yet targeted).
const INVENTORY_DESTINATION: Record<string, FlowDestination> = {
  stratplan: "rcds-vm",
  "audit-dashboard": "rcds-vm",
  "invoice-processing": "rcds-vm",
  "ongoing-contracts": "rcds-vm",
  "ucm-daily-register": "rcds-vm",
  "mindrouter-video-storyboard": "rcds-vm",
  vandalizer: "rcds-vm",
  processmapping: "rcds-vm",
  openera: "rcds-vm",
  execord: "rcds-vm",
  "sem-experiential": "rcds-vm",
  "sidearm-pipeline": "rcds-vm",
  "rfd-companion": "rcds-vm",
  "rfd-career": "rcds-vm",
  universo: "rcds-vm",
  "retroactive-payment-requests": "nexus-module",
  mindrouter: "not-applicable",
  "dgx-stack": "not-applicable",
  "template-app": "not-applicable",
  nexus: "not-applicable",
  "oit-data-modernization": "oit-managed-tbd",
  "ir-reporting-modernization": "oit-managed-tbd",
};

// Registry status: every remaining row is an open request except these
// (dispositions from the 2026-08-10 snapshot — approved/converted rows
// that kept their own line, plus the one denial).
const REQUEST_STATUS_OVERRIDE: Record<string, FlowStatus> = {
  "My UI (Student Newsletter)": "queued",
  "HR Target Pay System": "queued",
  "AI-Assisted SAC Pre-Review Tool": "queued",
  "AI for LaTeX formatting (theses)": "queued",
  "Public-Safety Threat Assessment (denied)": "halted",
};

function inventoryStatus(project: Project): FlowStatus {
  switch (project.status) {
    case "production":
      return "deployed";
    case "piloting":
      return "piloting";
    case "building":
    case "prototype":
      return "building";
    case "paused":
      return "halted";
    case "archived":
      return "retired";
    case "tracked":
      return "tracked";
    default:
      // idea / scoping / approved — waiting for build capacity.
      return "queued";
  }
}

function inventoryRoute(project: Project): FlowRoute {
  const track = resolveGovernanceProfile(project).intakeTrack;
  if (track === "external") return "external-tracked";
  if (PLATFORM_SLUGS.has(project.slug)) return "seam-platform";
  if (track === "track-c") return "track-c";
  return "track-b";
}

export function inventoryFlows(): FlowUnit[] {
  return projects.map((p) => ({
    id: `p:${p.slug}`,
    name: p.name,
    source: INVENTORY_SOURCE[p.slug] ?? "unit-partnership",
    route: inventoryRoute(p),
    destination: INVENTORY_DESTINATION[p.slug] ?? "unclassified",
    status: inventoryStatus(p),
    isProject: true,
    summary: p.tagline,
  }));
}

export function allFlows(): FlowUnit[] {
  const requests: FlowUnit[] = REQUEST_FLOWS.map((r, i) => ({
    id: `r:${i}`,
    name: r.name,
    source: r.origin,
    route: r.route,
    destination: r.destination,
    status: REQUEST_STATUS_OVERRIDE[r.name] ?? "requested",
    isProject: false,
  }));
  return [...requests, ...inventoryFlows()];
}
