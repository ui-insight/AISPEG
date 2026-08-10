// ============================================================
// UTR stress-test — flow-explorer data (point-in-time snapshot)
// ============================================================
// Per-unit classification behind the report's Sankey flow explorer.
// Every unit (a registry request or an inventory project) carries a
// three-step path: origin → routing under the draft → destination.
//
// Registry rows are a hand-classified snapshot of tech_requests taken
// 2026-08-10 (same cut as the report's aggregate numbers; merged
// duplicates excluded). Routing assignments are INFERRED — the registry
// carries no track assignments yet — and each unit gets exactly one
// dominant classification even where the report's prose lets seams
// overlap. Inventory rows are computed from lib/portfolio.ts at build
// time so they can't drift.

import { projects, type Project } from "@/lib/portfolio";
import { resolveGovernanceProfile } from "@/lib/governance-profile";

// ---- Node vocabulary ---------------------------------------------------

export type FlowOrigin =
  | "oit-idea"
  | "clickup"
  | "site-submission"
  | "direct"
  | "inventory";

export type FlowRoute =
  // Clean routes under the draft
  | "fast-lane"
  | "track-a"
  | "track-c"
  | "track-d"
  // The report's fringe seams
  | "seam-estate"
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
  | "not-applicable"
  | "unclassified"
  | "already-operating";

export type RouteClass = "clean" | "seam" | "muted";

export interface FlowUnit {
  name: string;
  origin: FlowOrigin;
  route: FlowRoute;
  destination: FlowDestination;
}

export const ORIGIN_LABEL: Record<FlowOrigin, string> = {
  "oit-idea": "OIT IDEA form",
  clickup: "ClickUp backlog",
  "site-submission": "Site submission",
  direct: "Direct entry",
  inventory: "Project inventory",
};

export const ROUTE_META: Record<
  FlowRoute,
  { label: string; cls: RouteClass }
> = {
  "fast-lane": { label: "Fast lane", cls: "clean" },
  "track-a": { label: "Track A · Standard software", cls: "clean" },
  "track-c": { label: "Track C · Idea / concept", cls: "clean" },
  "track-d": { label: "Track D · Data & report access", cls: "clean" },
  "seam-estate": { label: "Seam · Existing estate", cls: "seam" },
  "seam-platform": { label: "Seam · Platform itself", cls: "seam" },
  "seam-configure": { label: "Seam · Configure what we own", cls: "seam" },
  "seam-research": { label: "Seam · Research boundary", cls: "seam" },
  "seam-data-product": { label: "Seam · Data product", cls: "seam" },
  "seam-no-requestor": { label: "Seam · No requestor", cls: "seam" },
  "external-tracked": { label: "External — tracked", cls: "muted" },
  unclear: { label: "Unclear — needs triage", cls: "muted" },
};

export const DESTINATION_LABEL: Record<FlowDestination, string> = {
  "external-hosted": "External / vendor-hosted",
  "nexus-module": "Nexus module",
  "vandalizer-workflow": "Vandalizer workflow",
  "databricks-dashboard": "Databricks dashboard",
  "standalone-oci": "Standalone (OCI)",
  "standalone-oit-k8s": "Standalone (OIT k8s)",
  "not-applicable": "Not applicable",
  unclassified: "Not yet targeted",
  "already-operating": "Already operating",
};

// ---- Registry snapshot (hand-classified, 2026-08-10) -------------------
// 107 rows = tech_requests minus 2 merged duplicates. `destination`
// mirrors proposed_deployment_target (NULL → "unclassified").

export const REQUEST_FLOWS: FlowUnit[] = [
  // ClickUp backlog (40)
  { name: "AI Chatbot for Training/Manuals", origin: "clickup", route: "track-c", destination: "vandalizer-workflow" },
  { name: "AI-Assisted SAC Pre-Review Tool", origin: "clickup", route: "track-c", destination: "unclassified" },
  { name: "CAREER Club PI Progress Meter", origin: "clickup", route: "track-c", destination: "unclassified" },
  { name: "Check Cancellations & ACH Returns", origin: "clickup", route: "track-c", destination: "nexus-module" },
  { name: "Clery Act Annual Security Report", origin: "clickup", route: "track-c", destination: "vandalizer-workflow" },
  { name: "Contract data extraction (State Transparency)", origin: "clickup", route: "track-c", destination: "unclassified" },
  { name: "Drafting RFP/RFQ documents", origin: "clickup", route: "track-c", destination: "vandalizer-workflow" },
  { name: "Employment Verifications", origin: "clickup", route: "track-c", destination: "nexus-module" },
  { name: "Executive Order Compliance Review & Triage", origin: "clickup", route: "track-c", destination: "unclassified" },
  { name: "Facilities Condition Assessment", origin: "clickup", route: "track-c", destination: "vandalizer-workflow" },
  { name: "Finalizing Payroll (stage)", origin: "clickup", route: "track-c", destination: "not-applicable" },
  { name: "Fund Balance Projections", origin: "clickup", route: "seam-data-product", destination: "databricks-dashboard" },
  { name: "HR Target Pay System", origin: "clickup", route: "track-c", destination: "unclassified" },
  { name: "Hazardous-Waste Tracking (EHS)", origin: "clickup", route: "track-c", destination: "nexus-module" },
  { name: "Idaho Water Law Repository", origin: "clickup", route: "track-c", destination: "unclassified" },
  { name: "International Employee Payroll", origin: "clickup", route: "track-c", destination: "nexus-module" },
  { name: "Key Control / Building Access", origin: "clickup", route: "track-c", destination: "nexus-module" },
  { name: "Leave Payout", origin: "clickup", route: "track-c", destination: "nexus-module" },
  { name: "Leave Transfers", origin: "clickup", route: "track-c", destination: "nexus-module" },
  { name: "Manual Timesheets", origin: "clickup", route: "track-c", destination: "not-applicable" },
  { name: "Material Safety Data Sheets", origin: "clickup", route: "track-c", destination: "vandalizer-workflow" },
  { name: "My UI (Student Newsletter)", origin: "clickup", route: "track-c", destination: "unclassified" },
  { name: "Out of State Employee Tax Tracking", origin: "clickup", route: "track-c", destination: "unclassified" },
  { name: "Parking: AI Chatbot", origin: "clickup", route: "track-c", destination: "standalone-oci" },
  { name: "Parking: License-Plate Recognition", origin: "clickup", route: "track-c", destination: "standalone-oci" },
  { name: "Post-Payroll Reconciliation", origin: "clickup", route: "seam-data-product", destination: "databricks-dashboard" },
  { name: "Power-Plant P3 Contract Q&A", origin: "clickup", route: "track-c", destination: "vandalizer-workflow" },
  { name: "Program Inventory Clean-up", origin: "clickup", route: "track-c", destination: "not-applicable" },
  { name: "Public-Safety Threat Assessment (denied)", origin: "clickup", route: "track-c", destination: "unclassified" },
  { name: "Quote / bid-waiver evaluation", origin: "clickup", route: "track-c", destination: "unclassified" },
  { name: "Retroactive Pay Request (RPR)", origin: "clickup", route: "track-c", destination: "unclassified" },
  { name: "Staff Fee Waiver System", origin: "clickup", route: "track-c", destination: "nexus-module" },
  { name: "Staff ePAF / HR Reporting", origin: "clickup", route: "seam-data-product", destination: "databricks-dashboard" },
  { name: "The Daily Register (Employee Newsletter)", origin: "clickup", route: "track-c", destination: "unclassified" },
  { name: "Ticketing & routing — purchasing inbox", origin: "clickup", route: "track-c", destination: "nexus-module" },
  { name: "AI for LaTeX formatting (theses)", origin: "clickup", route: "track-c", destination: "unclassified" },
  { name: "Utility Demand & Billing", origin: "clickup", route: "seam-data-product", destination: "databricks-dashboard" },
  { name: "Vendor Invoices", origin: "clickup", route: "track-c", destination: "unclassified" },
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
  { name: "VandalChat — campus AI chat on MindRouter", origin: "direct", route: "seam-estate", destination: "standalone-oit-k8s" },
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
// Routing rules mirror the report's seams: platforms are their own seam;
// externally-owned work stays out of the pipeline; not-yet-built ideas
// could enter Track C cleanly; everything already built or building is
// the existing-estate seam. Destinations: built things are already
// operating; ideas have no target yet.

const PLATFORM_SLUGS = new Set(["mindrouter", "dgx-stack"]);

function inventoryRoute(project: Project): FlowRoute {
  const track = resolveGovernanceProfile(project).intakeTrack;
  if (track === "external") return "external-tracked";
  if (PLATFORM_SLUGS.has(project.slug)) return "seam-platform";
  if (track === "track-c") return "track-c";
  return "seam-estate";
}

export function inventoryFlows(): FlowUnit[] {
  return projects.map((p) => {
    const route = inventoryRoute(p);
    return {
      name: p.name,
      origin: "inventory" as const,
      route,
      destination:
        route === "track-c"
          ? ("unclassified" as const)
          : ("already-operating" as const),
    };
  });
}

export function allFlows(): FlowUnit[] {
  return [...REQUEST_FLOWS, ...inventoryFlows()];
}
