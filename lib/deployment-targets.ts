// ============================================================
// Deployment targets — per-target characteristics
// ============================================================
// The five deployment targets settled in the 2026-08-05 definitional
// session, characterized along the dimensions that drive target
// selection. The vocabulary (typed values, labels, the OIT-managed
// flag) lives in lib/project-governance.ts; this module carries the
// reference facts a surface renders and the harmonization work
// classifies against.
//
// The selection model the five targets encode is a two-step decision:
// form factor first (report-shaped → Databricks dashboard; transactional
// module fitting the template → Nexus; otherwise a standalone app),
// then hosting by operator and risk (OIT-managed for institutional-data
// production; RCDS VM as transitional staging). This maps onto the UTR
// tracks (lib/utr.ts): Track D requests are Databricks-shaped, Tracks
// B/C land on Nexus or a standalone target.
//
// Honesty rule: `maturity` states what the target IS today, not what
// it should become. Only Nexus and the RCDS VM have running workloads;
// nothing has landed on OCI or OIT Kubernetes, and OIT's Databricks
// service is aspirational until their implementation completes.

import type { DeploymentEnvironment } from "./project-governance";

/** The five concrete targets — the subset of the vocabulary that names
 * a real place work can land (excludes rollup + meta values). */
export type DeploymentTarget = Extract<
  DeploymentEnvironment,
  | "databricks-dashboard"
  | "nexus-module"
  | "standalone-oci"
  | "standalone-oit-k8s"
  | "rcds-vm"
>;

export type TargetMaturity =
  /** Running workloads exist; the path in is defined. */
  | "available"
  /** Sanctioned on paper; no workload has landed yet. */
  | "unproven"
  /** The offering itself is not yet stood up or defined. */
  | "aspirational"
  /** Available but explicitly not a destination — staging until a
   * project enters the OIT pathway. */
  | "transitional";

export const TARGET_MATURITY_LABEL: Record<TargetMaturity, string> = {
  available: "Available",
  unproven: "Sanctioned — unproven",
  aspirational: "Aspirational",
  transitional: "Transitional",
};

// Tailwind class strings for the maturity chip on Landscape surfaces —
// colocated with the vocabulary per the PUBLIC_STAGE_CHIP pattern
// (lib/portfolio.ts). Restraint: the label always carries the meaning;
// color is reinforcement. Available borrows the "alive" clearwater,
// transitional the caution amber (the codebase's existing hold signal),
// aspirational the "future motion" huckleberry, unproven stays neutral.
export const TARGET_MATURITY_CHIP: Record<TargetMaturity, string> = {
  available:
    "border-brand-clearwater/40 bg-brand-clearwater/10 text-brand-clearwater",
  unproven: "border-brand-silver/40 bg-brand-silver/10 text-brand-silver",
  aspirational:
    "border-brand-huckleberry/30 bg-brand-huckleberry/10 text-brand-huckleberry",
  transitional: "border-amber-300 bg-amber-50 text-amber-700",
};

export interface DeploymentTargetProfile {
  value: DeploymentTarget;
  name: string;
  /** Platform-hosted artifact vs. self-contained application. */
  formFactor: "platform-artifact" | "standalone-app";
  /** What actually ships to this target. */
  shipUnit: string;
  /** The workload shapes that belong here. */
  fits: string[];
  /** Who runs the runtime the workload lands on. */
  operator: string;
  /** Who performs the deployment. */
  deployer: string;
  /** The governance path a workload travels to get here. */
  governancePath: string;
  /** Standards and obligations that bind once here. */
  standardsBinding: string;
  /** Stack limits the target imposes. */
  techConstraint: string;
  /** Data classification / access posture. */
  dataPosture: string;
  /** Realistic time-to-production, with the gating factor named. */
  timeToDeploy: string;
  maturity: TargetMaturity;
  /** The evidence behind the maturity claim. */
  maturityNote: string;
  /** What must be answered before this characterization firms up.
   * Every entry names a real unknown — do not pad. */
  openQuestions?: string[];
  /** lib/portfolio.ts slugs currently on (or headed to) this target. */
  exampleSlugs: string[];
}

export const DEPLOYMENT_TARGETS: DeploymentTargetProfile[] = [
  {
    value: "databricks-dashboard",
    name: "Databricks dashboard",
    formFactor: "platform-artifact",
    shipUnit:
      "A dashboard or governed data product inside OIT's Databricks lakehouse workspace — no application to host.",
    fits: [
      "Report-shaped requests and recurring metrics",
      "BI over governed institutional data",
      "Cross-system reconciliation views (the survey's numbers-don't-agree theme)",
    ],
    operator:
      "OIT — the workspace is OIT-controlled in its entirety (Application Administration; Randy Wood TPM per the FY2027 EA portfolio). Distinct from the IIDS lakehouse pilot, which serves AI4RA.",
    deployer: "Undefined until OIT defines the service.",
    governancePath:
      "UTR Track D (data & report access): classification and entitlement screen, data steward review. The Governance Decision Worksheets already treat a new governed data product as a governance trigger.",
    standardsBinding:
      "Data classification enforced at the platform level; no application code, so no application security gate.",
    techConstraint:
      "Medallion architecture with data marts. Dashboard tooling undecided — PowerBI, Tableau, or custom is an open question.",
    dataPosture:
      "Potentially the highest-leverage target: governed lakehouse with per-user entitlements. Contents unconfirmed — Banner assumed but not verified.",
    timeToDeploy:
      "Fast for report-shaped needs once the platform is live and the data is in the lake; currently blocked on OIT's implementation finishing.",
    maturity: "aspirational",
    maturityNote:
      "OIT's Databricks implementation is not finished; the dashboard service is undefined beyond an aspiration (Barrie Robison, 2026-08-05).",
    openQuestions: [
      "Who builds dashboards, with what approved tooling (PowerBI, Tableau, custom)?",
      "What sources are attached to the lakehouse today (Banner assumed, unverified)?",
      "What does the offered service look like — self-service with entitlements, or central build on request?",
      "Which lakehouse/API routes are allowed; are direct source-system connections prohibited outright or case-by-case? (Outstanding Decisions Worksheet — confirm with Ben.)",
    ],
    exampleSlugs: [],
  },
  {
    value: "nexus-module",
    name: "Nexus module",
    formFactor: "platform-artifact",
    shipUnit:
      "A module inside the shared React + FastAPI Nexus application at nexus.uidaho.edu.",
    fits: [
      "Transactional staff workflows: validated intake, review queues, dashboards",
      "Banner-adjacent business processes (read and verify)",
      "SSO-gated internal enterprise apps",
    ],
    operator:
      "OIT-managed secure infrastructure; the platform was built collaboratively by OIT and IIDS (Kali Armitage, Colin Addington).",
    deployer:
      "Builders write module code; OIT gates pull requests and operates production.",
    governancePath:
      "The full six-stage Builder Guide pathway with the Stage 3 security gate and OIT acceptance; UTR Tracks B/C.",
    standardsBinding:
      "OIT Enterprise AI Development Framework stack; the draft OIT SDLC standard once adopted. OIT-managed production satisfies the ADR 0001 accessibility rule.",
    techConstraint: "The Nexus template stack only — React + FastAPI.",
    dataPosture:
      "Moderate-risk institutional data proven in production: Retroactive Payment Requests verifies submissions against Banner.",
    timeToDeploy:
      "The slowest gate today — recurring security-review tickets and PR approval steps are the reported friction — but the one sanctioned enterprise path with a completed traversal.",
    maturity: "available",
    maturityNote:
      "Retroactive Payment Requests in production for Payroll since July 2026; OpenERA and UCM Daily Register entering Stage 1.",
    exampleSlugs: [
      "retroactive-payment-requests",
      "openera",
      "ucm-daily-register",
      "out-of-state-tax-tracking",
    ],
  },
  {
    value: "standalone-oci",
    name: "Standalone app on OCI",
    formFactor: "standalone-app",
    shipUnit:
      "A containerized standalone application on Oracle Cloud Infrastructure, in OIT-provisioned capacity.",
    fits: [
      "Apps that don't fit the Nexus template (different stack, own database, public-facing)",
      "AI-heavy applications needing OIT-managed production",
    ],
    operator: "OIT.",
    deployer:
      "OIT DevOps deploys to production; builders do not deploy directly. Named owner, runbook, and documented decommission path required before go-live.",
    governancePath:
      "The six-stage Builder Guide pathway and OIT acceptance gate; UTR Tracks B/C.",
    standardsBinding:
      "Draft OIT SDLC standard once adopted (managed hosts, pipeline scanning, central scan reporting). OIT-managed production satisfies the ADR 0001 accessibility rule.",
    techConstraint: "Any containerized stack.",
    dataPosture: "Institutional data per classification, OIT-managed.",
    timeToDeploy:
      "Unknown — no project has traversed this path; expect pathway-gate timelines comparable to Nexus.",
    maturity: "unproven",
    maturityNote:
      "Named in the OIT drafts as an approved platform; no workload has landed there.",
    exampleSlugs: [],
  },
  {
    value: "standalone-oit-k8s",
    name: "Standalone app on OIT on-prem Kubernetes",
    formFactor: "standalone-app",
    shipUnit:
      "A containerized standalone application in an OIT-provisioned namespace on the on-premises Kubernetes platform.",
    fits: [
      "Standalone apps where on-prem residency matters",
      "Workloads wanting adjacency to on-prem AI compute (MindRouter, DGX Stack)",
    ],
    operator: "OIT.",
    deployer:
      "OIT DevOps deploys to production; builders do not deploy directly. Named owner, runbook, and documented decommission path required before go-live.",
    governancePath:
      "The six-stage Builder Guide pathway and OIT acceptance gate; UTR Tracks B/C.",
    standardsBinding:
      "Draft OIT SDLC standard once adopted. OIT-managed production satisfies the ADR 0001 accessibility rule.",
    techConstraint: "Any containerized stack.",
    dataPosture: "Institutional data per classification, OIT-managed.",
    timeToDeploy: "Unknown — no project has traversed this path.",
    maturity: "unproven",
    maturityNote:
      "Named in the OIT drafts as an approved platform; no workload has landed there.",
    exampleSlugs: [],
  },
  {
    value: "rcds-vm",
    name: "Standalone app on an RCDS VM",
    formFactor: "standalone-app",
    shipUnit:
      "A Docker-composed stack on an IIDS/RCDS self-managed VM — the insight.uidaho.edu class.",
    fits: [
      "Pilots and staged applications iterating with their unit before entering the pathway",
      "Research-adjacent work outside enterprise governance",
      "AI-enabled apps needing MindRouter/DGX adjacency during development",
    ],
    operator: "IIDS/RCDS self-managed.",
    deployer: "Builders deploy directly — same-day deploys.",
    governancePath:
      "Outside the OIT pathway. The Builder Guide's term for apps here is 'staged on IIDS infrastructure' — pre-Stage-1.",
    standardsBinding:
      "No OIT acceptance gate. The ADR 0001 accessibility rule is NOT satisfied by the environment — accessibility falls on the project.",
    techConstraint: "Any Docker-composed stack (10.x address space, not 172.x).",
    dataPosture:
      "The lowest ceiling — not a home for high-risk institutional data per the draft SDLC standard's managed-hosts posture.",
    timeToDeploy: "Fastest — hours, not stages.",
    maturity: "transitional",
    maturityNote:
      "Nine portfolio projects run here today, but the target is staging by decision (2026-08-05): projects are expected to move through the pathway to an OIT-managed target or Databricks, not to stay.",
    exampleSlugs: [
      "stratplan",
      "openera",
      "ucm-daily-register",
      "processmapping",
      "audit-dashboard",
      "mindrouter-video-storyboard",
      "execord",
      "rfd-career",
      "universo",
      "vandalizer",
    ],
  },
];

export function getDeploymentTarget(
  value: DeploymentTarget
): DeploymentTargetProfile {
  const profile = DEPLOYMENT_TARGETS.find((t) => t.value === value);
  if (!profile) throw new Error(`Unknown deployment target: ${value}`);
  return profile;
}
