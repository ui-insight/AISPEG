// ============================================================
// Deployment targets — per-environment definitions
// ============================================================
// The five deployment targets from the 2026-08-05 definitional session,
// restructured 2026-08-06 into typed environment definitions: facts are
// fields, prose is reserved for what is genuinely narrative, and
// `"unknown"` is a first-class value everywhere. The vocabulary (typed
// values, labels, the OIT-managed flag) lives in
// lib/project-governance.ts; this module carries the reference facts a
// surface renders and the harmonization work classifies against.
//
// Definition discipline: environments are being defined one at a time
// in working sessions with their operators — nobody at the university
// had defined them before. `definition.status` says whether a profile
// carries a named human's verified answers ("defined", with the raw
// interview record under docs/environments/) or this repo's inference
// from documents ("repo-inferred"). Surfaces must render the
// difference. Unknown fields stay unknown until a session fills them —
// do not invent values.
//
// The selection model the five targets encode is a two-step decision:
// form factor first (report-shaped → Databricks dashboard; transactional
// module fitting the template → Nexus; otherwise a standalone app),
// then hosting by operator and risk. This maps onto the UTR tracks
// (lib/utr.ts): Track D requests are Databricks-shaped, Tracks B/C
// land on Nexus or a standalone target.
//
// Honesty rule: `maturity` states what the target IS today, not what
// it should become.

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

// ---- Definition provenance -------------------------------------------

/**
 * Whether this profile carries a named operator's verified answers or
 * this repo's inference from documents. Surfaces render the difference;
 * the raw interview records live under docs/environments/.
 */
export type EnvironmentDefinitionMeta =
  | {
      status: "defined";
      definedBy: { name: string; role: string; date: string };
    }
  | { status: "repo-inferred" };

// ---- Structured facts -------------------------------------------------

/** Whether the environment exists today or is an intention. */
export type EnvironmentExistence =
  | "operating"
  | "partial"
  | "intended"
  | "unknown";

export const ENVIRONMENT_EXISTENCE_LABEL: Record<
  EnvironmentExistence,
  string
> = {
  operating: "Operating today",
  partial: "Partially stood up",
  intended: "Intended — not yet stood up",
  unknown: "Unknown",
};

/** The operational concerns whose ownership discriminates environments. */
export type Responsibility =
  | "os-and-patching"
  | "backups"
  | "monitoring"
  | "network-and-firewall"
  | "dns-and-certificates"
  | "reverse-proxy"
  | "app-deployment"
  | "app-maintenance"
  | "data-compliance";

export const RESPONSIBILITY_LABEL: Record<Responsibility, string> = {
  "os-and-patching": "OS & patching",
  backups: "Backups",
  monitoring: "Monitoring",
  "network-and-firewall": "Network & firewall",
  "dns-and-certificates": "DNS & certificates",
  "reverse-proxy": "Reverse proxy",
  "app-deployment": "App deployment",
  "app-maintenance": "App maintenance",
  "data-compliance": "Data compliance",
};

export type ResponsibilityHolder = "provider" | "tenant" | "shared" | "unknown";

export const RESPONSIBILITY_HOLDER_LABEL: Record<ResponsibilityHolder, string> =
  {
    provider: "Provider",
    tenant: "Tenant",
    shared: "Shared",
    unknown: "Unknown",
  };

export type RiskCeiling = "low" | "moderate" | "high";

export interface EnvironmentAccess {
  /** Who says yes — a named human or office, or "Unknown". */
  approvalAuthority: string;
  formality: "informal" | "formal-process" | "unknown";
  cost: "none" | "chargeback" | "unknown";
  /** Provisioning turnaround, as the operator states it. */
  turnaround: string;
}

export interface EnvironmentDataRule {
  /** Ceiling for anything reachable from the public internet. */
  externalFacing: RiskCeiling | "prohibited" | "unknown";
  /** Ceiling for internal-only exposure. */
  internalOnly: RiskCeiling | "unknown";
  /** How the rule is actually enforced, as stated — not as hoped. */
  enforcement: string;
}

export interface EnvironmentNetwork {
  exposureOptions: string;
  firewall: string;
  sso: string;
}

export interface EnvironmentResilience {
  backups: string;
  offsiteDr: boolean | "unknown";
}

export type EnvironmentStack =
  | "any-container"
  | "template-stack"
  | "platform-artifact"
  | "unknown";

export const ENVIRONMENT_STACK_LABEL: Record<EnvironmentStack, string> = {
  "any-container": "Any containerized stack",
  "template-stack": "Template stack only",
  "platform-artifact": "Platform-native artifacts",
  unknown: "Unknown",
};

/**
 * The environment's role in the institutional hosting story — typed so
 * the mismatch ledger can compute from it rather than restate it.
 */
export type StrategicRole = "destination" | "stopgap" | "aspiration" | "unknown";

export interface EnvironmentValue {
  /** The positive reason work should land here — the operator's own
   * claim where defined. */
  headline: string;
  /** The class of work for which this is the permanent right home;
   * null when the environment claims none. */
  permanentNiche: string | null;
  strategicRole: StrategicRole;
  /** What should never land here. */
  antiFit: string[];
}

// ---- Profile ----------------------------------------------------------

export interface DeploymentTargetProfile {
  value: DeploymentTarget;
  name: string;
  /** Platform-hosted artifact vs. self-contained application. */
  formFactor: "platform-artifact" | "standalone-app";
  /** What actually ships to this target. */
  shipUnit: string;

  definition: EnvironmentDefinitionMeta;
  existence: EnvironmentExistence;
  responsibilities: Record<Responsibility, ResponsibilityHolder>;
  access: EnvironmentAccess;
  dataRule: EnvironmentDataRule;
  network: EnvironmentNetwork;
  capacity?: { typicalSpecs?: string; hardware?: string };
  resilience: EnvironmentResilience;
  stack: EnvironmentStack;
  valueProposition: EnvironmentValue;

  /** The workload shapes that belong here. */
  fits: string[];
  /** The governance path a workload travels to get here. */
  governancePath: string;
  /** Realistic path-to-production time, with the gating factor named.
   * Distinct from access.turnaround (provisioning). */
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
    definition: { status: "repo-inferred" },
    existence: "partial",
    responsibilities: {
      "os-and-patching": "provider",
      backups: "provider",
      monitoring: "provider",
      "network-and-firewall": "provider",
      "dns-and-certificates": "provider",
      "reverse-proxy": "provider",
      "app-deployment": "unknown",
      "app-maintenance": "unknown",
      "data-compliance": "unknown",
    },
    access: {
      approvalAuthority: "Unknown — the service is not yet defined",
      formality: "unknown",
      cost: "unknown",
      turnaround: "Unknown",
    },
    dataRule: {
      externalFacing: "unknown",
      internalOnly: "unknown",
      enforcement:
        "Unknown — platform-level entitlements expected, not yet confirmed",
    },
    network: {
      exposureOptions: "Unknown — internal dashboards expected",
      firewall: "Unknown",
      sso: "Unknown",
    },
    resilience: { backups: "Platform-managed (Databricks)", offsiteDr: "unknown" },
    stack: "platform-artifact",
    valueProposition: {
      headline:
        "Governed institutional data with per-user entitlements — report-shaped delivery without an application to run or host.",
      permanentNiche: "Reports, dashboards, and governed data products",
      strategicRole: "aspiration",
      antiFit: [
        "Transactional workflows",
        "Anything needing a custom application UI",
      ],
    },
    fits: [
      "Report-shaped requests and recurring metrics",
      "BI over governed institutional data",
      "Cross-system reconciliation views (the survey's numbers-don't-agree theme)",
    ],
    governancePath:
      "UTR Track D (data & report access): classification and entitlement screen, data steward review. The Governance Decision Worksheets already treat a new governed data product as a governance trigger.",
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
    definition: { status: "repo-inferred" },
    existence: "operating",
    responsibilities: {
      "os-and-patching": "provider",
      backups: "provider",
      monitoring: "provider",
      "network-and-firewall": "provider",
      "dns-and-certificates": "provider",
      "reverse-proxy": "provider",
      "app-deployment": "shared",
      "app-maintenance": "unknown",
      "data-compliance": "unknown",
    },
    access: {
      approvalAuthority: "OIT, via the Builder Guide pathway",
      formality: "formal-process",
      cost: "unknown",
      turnaround: "Unknown — one traversal completed to date",
    },
    dataRule: {
      externalFacing: "unknown",
      internalOnly: "unknown",
      enforcement:
        "Unknown — Stage 3 security gate at entry; payroll data is carried in practice, formal rating unconfirmed",
    },
    network: {
      exposureOptions: "SSO-gated internal enterprise app",
      firewall: "Unknown",
      sso: "Built in — the platform is SSO-gated",
    },
    resilience: { backups: "Unknown", offsiteDr: "unknown" },
    stack: "template-stack",
    valueProposition: {
      headline:
        "A security-hardened, SSO-gated, OIT-operated runtime — enterprise legitimacy for a staff workflow without standing up an application.",
      permanentNiche: "Transactional staff workflow modules",
      strategicRole: "destination",
      antiFit: ["Applications that don't fit the template stack"],
    },
    fits: [
      "Transactional staff workflows: validated intake, review queues, dashboards",
      "Banner-adjacent business processes (read and verify)",
      "SSO-gated internal enterprise apps",
    ],
    governancePath:
      "The full six-stage Builder Guide pathway with the Stage 3 security gate and OIT acceptance; UTR Tracks B/C.",
    timeToDeploy:
      "The slowest gate today — recurring security-review tickets and PR approval steps are the reported friction — but the one sanctioned enterprise path with a completed traversal.",
    maturity: "available",
    maturityNote:
      "Retroactive Payment Requests in production for Payroll since July 2026; OpenERA and UCM Daily Register entering Stage 1.",
    openQuestions: [
      "Definition session pending — architecture of a module, Banner access mechanics, post-launch maintenance ownership, formal data rating, and onboarding throughput are all unverified.",
    ],
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
    definition: { status: "repo-inferred" },
    existence: "intended",
    responsibilities: {
      "os-and-patching": "provider",
      backups: "unknown",
      monitoring: "unknown",
      "network-and-firewall": "provider",
      "dns-and-certificates": "provider",
      "reverse-proxy": "unknown",
      "app-deployment": "provider",
      "app-maintenance": "unknown",
      "data-compliance": "unknown",
    },
    access: {
      approvalAuthority: "OIT, via the pathway's acceptance gate",
      formality: "formal-process",
      cost: "unknown",
      turnaround: "Unknown — no workload has traversed this path",
    },
    dataRule: {
      externalFacing: "unknown",
      internalOnly: "unknown",
      enforcement: "Draft OIT SDLC standard once adopted; unverified",
    },
    network: {
      exposureOptions: "Unknown",
      firewall: "Unknown",
      sso: "Unknown",
    },
    resilience: { backups: "Unknown", offsiteDr: "unknown" },
    stack: "any-container",
    valueProposition: {
      headline:
        "OIT-operated production for containerized apps that don't fit a platform — the institutional accessibility rule satisfied without the template constraint.",
      permanentNiche: "Standalone institutional applications",
      strategicRole: "destination",
      antiFit: [],
    },
    fits: [
      "Apps that don't fit the Nexus template (different stack, own database, public-facing)",
      "AI-heavy applications needing OIT-managed production",
    ],
    governancePath:
      "The six-stage Builder Guide pathway and OIT acceptance gate; UTR Tracks B/C.",
    timeToDeploy:
      "Unknown — no project has traversed this path; expect pathway-gate timelines comparable to Nexus.",
    maturity: "unproven",
    maturityNote:
      "Named in the OIT drafts as an approved platform; no workload has landed there.",
    openQuestions: [
      "Definition session pending — whether this is OKE (Kubernetes) or other OCI compute, and whether the offering exists beyond the drafts, are unverified.",
    ],
    exampleSlugs: [],
  },
  {
    value: "standalone-oit-k8s",
    name: "Standalone app on OIT on-prem Kubernetes",
    formFactor: "standalone-app",
    shipUnit:
      "A containerized standalone application in an OIT-provisioned namespace on the on-premises Kubernetes platform.",
    definition: { status: "repo-inferred" },
    existence: "unknown",
    responsibilities: {
      "os-and-patching": "provider",
      backups: "unknown",
      monitoring: "unknown",
      "network-and-firewall": "provider",
      "dns-and-certificates": "provider",
      "reverse-proxy": "unknown",
      "app-deployment": "provider",
      "app-maintenance": "unknown",
      "data-compliance": "unknown",
    },
    access: {
      approvalAuthority: "OIT, via the pathway's acceptance gate",
      formality: "formal-process",
      cost: "unknown",
      turnaround: "Unknown — no workload has traversed this path",
    },
    dataRule: {
      externalFacing: "unknown",
      internalOnly: "unknown",
      enforcement: "Draft OIT SDLC standard once adopted; unverified",
    },
    network: {
      exposureOptions: "Unknown",
      firewall: "Unknown",
      sso: "Unknown",
    },
    resilience: { backups: "Unknown", offsiteDr: "unknown" },
    stack: "any-container",
    valueProposition: {
      headline:
        "OIT-operated production with on-premises residency — for workloads that must stay on campus hardware.",
      permanentNiche: "Standalone institutional applications requiring on-prem residency",
      strategicRole: "destination",
      antiFit: [],
    },
    fits: [
      "Standalone apps where on-prem residency matters",
      "Workloads wanting adjacency to on-prem AI compute (MindRouter, DGX Stack)",
    ],
    governancePath:
      "The six-stage Builder Guide pathway and OIT acceptance gate; UTR Tracks B/C.",
    timeToDeploy: "Unknown — no project has traversed this path.",
    maturity: "unproven",
    maturityNote:
      "Named in the OIT drafts as an approved platform; no workload has landed there.",
    openQuestions: [
      "Definition session pending — whether an on-prem cluster exists today, or is a line in the drafts, is unverified.",
    ],
    exampleSlugs: [],
  },
  // Defined with Luke Sheneman (RCDS), 2026-08-06 — the first environment
  // of the definitional pass. Raw interview: docs/environments/rcds-vm.md.
  {
    value: "rcds-vm",
    name: "Standalone app on an RCDS VM",
    formFactor: "standalone-app",
    shipUnit:
      "Containerized apps on an RCDS-provisioned, RCDS-managed VM. One VM per person, multiple apps per VM; hostnames under insight.uidaho.edu, nkn.uidaho.edu, or other RCDS subdomains.",
    definition: {
      status: "defined",
      definedBy: { name: "Luke Sheneman", role: "RCDS", date: "2026-08-06" },
    },
    existence: "operating",
    responsibilities: {
      "os-and-patching": "provider",
      backups: "provider",
      monitoring: "provider",
      "network-and-firewall": "provider",
      "dns-and-certificates": "provider",
      "reverse-proxy": "provider",
      "app-deployment": "tenant",
      "app-maintenance": "tenant",
      "data-compliance": "tenant",
    },
    access: {
      approvalAuthority: "Luke Sheneman (RCDS)",
      formality: "informal",
      cost: "none",
      turnaround: "Hours to days, depending on RCDS backlog",
    },
    dataRule: {
      externalFacing: "low",
      internalOnly: "moderate",
      enforcement:
        "Screened at intake; tenant honor afterward — no ongoing audit. RCDS can disable a VM at any time.",
    },
    network: {
      exposureOptions:
        "Per-VM internal-only or external-facing; per-app exposure via reverse-proxy rules",
      firewall:
        "RCDS-managed Watchguard appliance (stateless filtering), not the campus Palo Alto — relocatable behind it if needed",
      sso: "Azure AD SSO arranged app-by-app with RCDS and OIT",
    },
    capacity: {
      typicalSpecs: "4–8 vCPU · 16 GB RAM · 256 GB disk · 10 Gbps",
      hardware:
        "Dell M640 blades (1 TB RAM, 28 cores each) in an RCDS-managed VRTX chassis, UI Library basement",
    },
    resilience: { backups: "Snapshots + NFS backup", offsiteDr: false },
    stack: "any-container",
    valueProposition: {
      headline:
        "Hosting this week, at no cost, with the OS layer managed for you — the only environment a builder can reach without a formal process.",
      permanentNiche: "Research-mission tools",
      strategicRole: "stopgap",
      antiFit: [
        "High-risk data, ever",
        "Above-Low-risk data on anything external-facing",
      ],
    },
    fits: [
      "Research-mission tools — the service's intended and permanent purpose",
      "Agentically-developed apps needing hosting this week at no cost — the stopgap for OIT's missing simple-hosting service",
      "Pilots iterating with their unit before entering the OIT pathway",
    ],
    governancePath:
      "Outside the OIT pathway. Request-and-discussion with RCDS covers what's allowable and whether the VM is internal-only or external-facing. The Builder Guide's term for apps here is 'staged on IIDS infrastructure' — pre-Stage-1.",
    timeToDeploy:
      "Provisioning in hours to days (RCDS backlog); container deploys same-day thereafter.",
    maturity: "transitional",
    maturityNote:
      "Sheneman (2026-08-06): 'There is nothing special about RCDS VMs for this purpose. It is serving an immediate unmet need' — if OIT provided fast, free app hosting, RCDS would not need to. The service exists partly so institutional data doesn't scatter to external hosts. Research-mission workloads are the intended, permanent use; everything else is transitional by the service's own definition.",
    openQuestions: [
      "Which current external-facing tenants exceed the Low-risk data rule? A per-tenant classification review against the exposure rule has not been done.",
    ],
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
