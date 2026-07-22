// ============================================================
// UI AI Project Inventory
// ============================================================
// The authoritative list of AI projects across University of Idaho units
// that IIDS coordinates, builds, or tracks. An "project" is a UI
// deployment / UI-owned effort — not a GitHub repo. Repos are artifacts;
// projects have home units, operational owners, and status-at-UI.
//
// AI4RA reference projects (prompt-library, evaluation-harness, AI4RA-UDM,
// mcp-ecfr, etc.) live on /ai4ra-ecosystem, not here.
// ============================================================

import type { WorkCategory } from "./work-categories";
import type {
  DeploymentEnvironment,
  EnterpriseSystemReplacement,
} from "./project-governance";

export type Visibility =
  | "Public"       // Everything about this entry can be shown publicly
  | "Partial"      // Entry acknowledged; UI deployment details embargoed
  | "Internal-only"; // Not shown on the public site at all

// Operational ladder — see docs/adr/0001-product-lifecycle-taxonomy.md.
// 9 lifecycle states + 1 meta state (`tracked`). Verification rules for
// each are spec'd in the ADR; the verifier itself lands in a follow-up PR.
export type ProjectStatus =
  | "idea"
  | "approved"
  | "building"
  | "prototype"
  | "piloting"
  | "production"
  | "maintained"
  | "paused"
  | "sunsetting"
  | "archived"
  | "tracked";

// Public-stage rollup — what stakeholders see on /portfolio and the
// landing stat strip. Computed from `status` via `computePublicStage`.
export type PublicStage =
  | "exploring"
  | "building"
  | "live"
  | "paused"
  | "retired"
  | "tracked";

export type ProductionScope = "home-unit" | "institution-wide" | "external";

export interface PilotCohort {
  size: number;
  scope: string;
  namedUsers?: string[];
}

export type AI4RARelationship =
  | "Core"         // Dual-destiny: AI4RA OSS project + UI deployment
  | "Adjacent"     // Related but not AI4RA proper
  | "Reference"    // UI deployment consumes an AI4RA spec or tool
  | "UI-parallel"  // UI work running alongside AI4RA work
  | "None";

export type InstitutionalReviewStatus =
  | "OIT-endorsed"
  | "Under OIT review"
  | "N/A";

export interface OperationalOwner {
  name: string;
  title?: string;
}

export interface Project {
  slug: string;
  name: string;
  tagline: string;
  description: string;

  // Ownership
  homeUnits: string[];
  operationalOwners: OperationalOwner[];
  buildParticipants: string[];

  // Status
  status: ProjectStatus;
  visibility: Visibility;
  institutionalReviewStatus?: InstitutionalReviewStatus;

  // Governance intake — deployment target and incumbent-system economics.
  // Every project records an explicit value; use `to-be-determined` rather
  // than omitting facts that still need confirmation.
  proposedDeploymentEnvironment: DeploymentEnvironment;
  enterpriseSystemReplacement: EnterpriseSystemReplacement;

  // Lifecycle taxonomy — see docs/adr/0001-product-lifecycle-taxonomy.md.
  // Required transitively by the verification rules for certain statuses
  // (e.g. `production` requires `productionScope` + `supportContact`,
  // `piloting` requires `pilotCohort`). Optional on the type so the audit
  // PR can land before the verifier; the verifier polices the transitives.
  iidsSponsor: string;
  featureComplete?: boolean;
  liveUrlIsStaging?: boolean;
  pilotCohort?: PilotCohort;
  productionScope?: ProductionScope;
  supportContact?: string;
  sunsetDate?: string;   // ISO date
  replacedBy?: string;   // successor slug or "manual-process"

  // AI4RA
  ai4raRelationship: AI4RARelationship;
  dualDestinyPlanned?: boolean;
  externalDeployments?: string[];

  // Artifacts
  repoUrl?: string;
  docsUrl?: string;
  liveUrl?: string;
  isPrivateRepo?: boolean;
  funding?: string;

  // Content
  operationalFunction: string;
  operationalExcellenceOutcome: string;
  features?: string[];
  tech?: string[];

  // Meta
  tags?: string[];
  trackingOnly?: boolean;
  relatedSlugs?: string[];

  // "By problem" exploration axis — see lib/work-categories.ts.
  // One project can sit in 2-3 categories.
  workCategories?: WorkCategory[];

  // Strategic-plan priority codes this project advances (e.g.
  // ["A.1", "D.2"]). Codes must match a Priority in
  // lib/strategic-plan/catalog.ts; scripts/verify-portfolio.ts fails the
  // build on unknown codes. Ship empty; IIDS fills in over time.
  strategicPlanAlignment?: string[];

  // Optional adoption proxy surfaced on the landing's Use lane. Use only
  // where defensibly true — e.g. "Used in 3 SLC meetings since March 2026"
  // or "Tracking 47 active observations." Omit if no honest signal exists.
  // Renders italic, small, below the owner line.
  usageNote?: string;
}

export const projects: Project[] = [
  // ============================================================
  // Office of the President
  // ============================================================
  {
    slug: "stratplan",
    name: "Strategic Plan Dashboard",
    tagline:
      "Executive visibility into 337 tactics aligned to the UI 2025–2030 Strategic Plan.",
    description:
      "Data-driven dashboard visualizing and analyzing how 25 academic and administrative units align their tactics with the University's 2025–2030 Strategic Plan. Evolving toward an execution and investment portfolio tool. Currently used for executive review; could expand to unit self-service.",
    homeUnits: ["Office of the President"],
    operationalOwners: [{ name: "Michele Bartlett" }],
    buildParticipants: ["IIDS"],
    status: "production",
    visibility: "Public",
    proposedDeploymentEnvironment: "to-be-determined",
    enterpriseSystemReplacement: { status: "to-be-determined" },
    ai4raRelationship: "None",
    iidsSponsor: "Barrie Robison",
    productionScope: "institution-wide",
    supportContact: "Barrie Robison",
    repoUrl: "https://github.com/ui-insight/StratPlanTacticsMB",
    liveUrl: "https://strategicplan.insight.uidaho.edu",
    operationalFunction:
      "Executive tracking of strategic plan execution across 25 units and 337 tactics. Alignment matrix, synergy finder, coverage analysis, investment portfolio analytics, redundancy detection, pillar deep-dive, unit portfolios, tactic explorer.",
    operationalExcellenceOutcome:
      "Makes strategic execution visible. Surfaces under-served priorities, cross-unit synergies, and misalignment. Supports investment prioritization conversations.",
    tech: ["React 19", "TypeScript", "Tailwind v4", "FastAPI", "PostgreSQL"],
    workCategories: ["executive-analytics"],
    strategicPlanAlignment: ["E.4"],
  },
  {
    slug: "water-law-database",
    name: "Water Law Database",
    tagline:
      "AI-enabled Idaho water law repository — SRBA decisions, records, and settlements.",
    description:
      "Tiered repository of Idaho water law centered on the Snake River Basin Adjudication (SRBA): judicial decisions, historical records, and key settlements, ingested from the existing system and from paper documents via large-scale OCR on IIDS's on-prem GPU cluster. A web interface supports natural-language queries and visualizations such as diversion maps, giving legislators, water managers, and rights holders fast, verified answers instead of relitigating past disputes.",
    homeUnits: ["Office of the President"],
    operationalOwners: [{ name: "Luke Sheneman" }],
    buildParticipants: ["IIDS"],
    status: "building",
    visibility: "Public",
    proposedDeploymentEnvironment: "to-be-determined",
    enterpriseSystemReplacement: { status: "to-be-determined" },
    ai4raRelationship: "None",
    iidsSponsor: "Luke Sheneman",
    repoUrl: "https://github.com/northwest-knowledge-network/water-rights",
    isPrivateRepo: true,
    operationalFunction:
      "Ingests SRBA decisions, historical paper records (OCR), and settlements into a unified database; answers natural-language questions and renders visualizations (e.g. diversion maps) over the corpus.",
    operationalExcellenceOutcome:
      "Reduces water-law inquiry and search time from archival research to a verified lookup. Preserves institutional memory of settled disputes for the state's water stakeholders.",
    relatedSlugs: ["mindrouter", "dgx-stack"],
    workCategories: ["knowledge-retrieval", "documents"],
    strategicPlanAlignment: ["D.4", "E.2"],
  },

  // ============================================================
  // Division of Financial Affairs
  // ============================================================
  {
    slug: "audit-dashboard",
    name: "Audit Dashboard",
    tagline:
      "AI-assisted audit observation lifecycle tracking for Internal Audit.",
    description:
      "Full-stack dashboard for tracking internal audit observations, corrective action items, and responsible-party assignments. Ingests audit report PDFs via OCR + LLM extraction (MindRouter dots.OCR + Qwen3), with human review before persistence.",
    homeUnits: ["Division of Financial Affairs"],
    operationalOwners: [{ name: "Kim Salisbury" }],
    buildParticipants: ["IIDS"],
    status: "paused",
    visibility: "Public",
    proposedDeploymentEnvironment: "to-be-determined",
    enterpriseSystemReplacement: { status: "to-be-determined" },
    ai4raRelationship: "None",
    iidsSponsor: "Barrie Robison",
    liveUrlIsStaging: true,
    repoUrl: "https://github.com/ui-insight/AuditDashboard",
    liveUrl: "https://auditdashboard.insight.uidaho.edu",
    operationalFunction:
      "Audit observation lifecycle: ingest report PDF → extract observations and action items → assign responsible parties → monitor closure with overdue alerts. Replaces spreadsheet tracking.",
    operationalExcellenceOutcome:
      "Closes the audit follow-through loop. Reduces risk of observations lingering past target dates. Gives leadership a living compliance-posture view.",
    tech: ["React 19", "FastAPI", "PostgreSQL 16", "MindRouter", "Qwen3"],
    relatedSlugs: ["mindrouter", "dgx-stack", "template-app"],
    workCategories: ["documents", "reconciliation"],
    strategicPlanAlignment: ["E.2", "E.4"],
  },
  {
    slug: "invoice-processing",
    name: "Invoice Processing",
    tagline:
      "AI extraction and validation for Accounts Payable vendor invoices.",
    description:
      "Automates the front of the AP invoice pipeline: emailed invoices are captured, invoices without a PO number are auto-rejected back to the submitter, and the rest have key fields extracted (PO number, dates, invoice number, amount, remit-to address) and compared against PO data in Banner. AP staff work a review queue in a dashboard — correcting low-confidence extractions, requesting fixes from submitters, and marking invoices processed.",
    homeUnits: ["Division of Financial Affairs"],
    operationalOwners: [
      { name: "Daniele Ramona Bodden", title: "AP team lead" },
      { name: "Jake Milleson", title: "Purchasing lead" },
    ],
    buildParticipants: ["IIDS"],
    status: "building",
    visibility: "Public",
    proposedDeploymentEnvironment: "to-be-determined",
    enterpriseSystemReplacement: { status: "to-be-determined" },
    ai4raRelationship: "None",
    iidsSponsor: "Colin Addington",
    repoUrl: "https://github.com/ui-iids/ai4ui-integrated-dashboard",
    isPrivateRepo: true,
    operationalFunction:
      "Invoice intake for AP processors and departmental requesters: automated rejection of non-PO invoices, field extraction from PDFs and images, Banner PO matching, and a human-review queue with edit / request-correction / mark-processed actions.",
    operationalExcellenceOutcome:
      "Cuts manual capture and re-keying on a daily, continuous workload (20,000+ invoice entries since 2022). Estimated 0.7 FTE of AP capacity returned by automating rejections and extraction.",
    relatedSlugs: ["mindrouter", "retroactive-payment-requests"],
    workCategories: ["documents", "process"],
    strategicPlanAlignment: ["E.2"],
  },
  {
    slug: "historical-contracts",
    name: "Historical Contracts",
    tagline:
      "Bulk extraction of ~1,400 legacy contracts for the State Transparency Database.",
    description:
      "Extraction effort over the university's legacy contract pool (~1,400 documents): pull the fields the State of Idaho's Transparency Database requires and produce a clean upload for the state portal. The SIGGY contracts database serves as ground truth for validating extracted data. Approved and scoped; extraction begins once the same tooling proves itself on the smaller ongoing-contracts stream.",
    homeUnits: ["Division of Financial Affairs"],
    operationalOwners: [{ name: "Jake Milleson", title: "Purchasing lead" }],
    buildParticipants: ["IIDS"],
    status: "approved",
    visibility: "Public",
    proposedDeploymentEnvironment: "to-be-determined",
    enterpriseSystemReplacement: { status: "to-be-determined" },
    ai4raRelationship: "None",
    iidsSponsor: "Colin Addington",
    operationalFunction:
      "Batch field extraction from legacy contract documents, validated against the SIGGY contracts database, producing compliant State Transparency Database uploads and searchable contract records.",
    operationalExcellenceOutcome:
      "Turns days per contract into minutes per contract across a 1,400-document backlog — an estimated 5.2 FTE of one-time effort avoided, while bringing UI into compliance with state transparency requirements.",
    relatedSlugs: ["ongoing-contracts"],
    workCategories: ["documents", "reconciliation"],
    strategicPlanAlignment: ["D.4", "E.2"],
  },
  {
    slug: "ongoing-contracts",
    name: "Ongoing Contracts",
    tagline:
      "Field extraction from current contracts for the State Transparency Database.",
    description:
      "Companion to the Historical Contracts effort, covering the stream of new and active contracts: extract the required fields and build clean uploads for the State of Idaho's Transparency Database. Runs on the ArchAI contract-extraction tooling; currently paused while requested improvements to that application are prioritized and implemented.",
    homeUnits: ["Division of Financial Affairs"],
    operationalOwners: [{ name: "Jake Milleson", title: "Purchasing lead" }],
    buildParticipants: ["IIDS"],
    status: "paused",
    visibility: "Public",
    proposedDeploymentEnvironment: "to-be-determined",
    enterpriseSystemReplacement: { status: "to-be-determined" },
    ai4raRelationship: "None",
    iidsSponsor: "Colin Addington",
    operationalFunction:
      "Extracts State-Transparency-Database fields from current contracts as they arrive, keeping the state portal upload clean and contract records searchable.",
    operationalExcellenceOutcome:
      "Turns days per contract into minutes per contract on the ongoing stream — an estimated 0.6 FTE returned — and keeps state-portal compliance current instead of batch-remediated.",
    relatedSlugs: ["historical-contracts"],
    workCategories: ["documents", "reconciliation"],
    strategicPlanAlignment: ["D.4", "E.2"],
  },
  {
    slug: "out-of-state-tax-tracking",
    name: "Out-of-State Tax Tracking",
    tagline:
      "Multi-state payroll withholding tracking for out-of-state employees.",
    description:
      "Tracks state tax withholdings for UI employees working outside Idaho — including international W-4 cases routed through Payroll — and gets them remitted to the right state authorities. Automates the data transfer across systems that Payroll previously reconciled by hand.",
    homeUnits: ["Division of Financial Affairs"],
    operationalOwners: [
      { name: "Cretia Bunney" },
      { name: "Lisa Davis" },
    ],
    buildParticipants: ["IIDS"],
    status: "prototype",
    visibility: "Public",
    proposedDeploymentEnvironment: "to-be-determined",
    enterpriseSystemReplacement: { status: "to-be-determined" },
    ai4raRelationship: "None",
    iidsSponsor: "Colin Addington",
    featureComplete: true,
    operationalFunction:
      "Tracks multi-state withholding obligations per employee and prepares correct remittances for state tax authorities, replacing manual cross-system data transfer.",
    operationalExcellenceOutcome:
      "Compliance with multi-state withholding requirements with less manual risk — an estimated 0.2 FTE of Payroll capacity returned.",
    workCategories: ["reconciliation", "process"],
    strategicPlanAlignment: ["E.2"],
  },
  {
    slug: "retroactive-payment-requests",
    name: "Retroactive Payment Requests",
    tagline:
      "Electronic retro-pay intake and payroll analyst dashboard.",
    description:
      "Replaces the paper/email retroactive payment request process with a validated electronic submission flow plus a dashboard for payroll analysts. Submissions are checked for completeness and verified against Banner data before they reach an analyst, so corrections happen at intake instead of mid-process.",
    homeUnits: ["Division of Financial Affairs"],
    operationalOwners: [
      { name: "Lisa Davis" },
      { name: "Cretia Bunney" },
    ],
    buildParticipants: ["IIDS"],
    status: "building",
    visibility: "Public",
    proposedDeploymentEnvironment: "to-be-determined",
    enterpriseSystemReplacement: { status: "to-be-determined" },
    ai4raRelationship: "None",
    iidsSponsor: "Colin Addington",
    repoUrl: "https://github.com/ui-insight/reactfast",
    isPrivateRepo: true,
    operationalFunction:
      "Validated intake for retroactive pay requests (completeness checks, Banner verification) feeding a payroll-analyst dashboard for processing late or missed hours.",
    operationalExcellenceOutcome:
      "Employees are paid correctly with less back-and-forth: an estimated 0.3 FTE returned by shortening the process and catching incomplete submissions at intake.",
    relatedSlugs: ["invoice-processing"],
    workCategories: ["process", "reconciliation"],
    strategicPlanAlignment: ["E.2"],
  },
  {
    slug: "bid-waiver-document-review",
    name: "Bid Waiver Document Review",
    tagline:
      "AI review of quotes and bid-waiver justifications for procurement compliance.",
    description:
      "A Vandalizer module that verifies three-quote compliance on purchases and reviews bid-waiver justifications against procurement rules, giving purchasing approvers and auditors a transparent rationale trail for sourcing decisions.",
    homeUnits: ["Division of Financial Affairs"],
    operationalOwners: [{ name: "Jake Milleson", title: "Purchasing lead" }],
    buildParticipants: ["IIDS"],
    status: "approved",
    visibility: "Public",
    proposedDeploymentEnvironment: "to-be-determined",
    enterpriseSystemReplacement: { status: "to-be-determined" },
    ai4raRelationship: "Reference",
    iidsSponsor: "Colin Addington",
    operationalFunction:
      "Checks purchase documentation for three-quote compliance and evaluates bid-waiver justifications, surfacing the rationale for approvers and auditors.",
    operationalExcellenceOutcome:
      "Faster waiver approvals with a transparent, auditable rationale — lawful sourcing with less manual document review.",
    relatedSlugs: ["vandalizer"],
    workCategories: ["documents", "process"],
    strategicPlanAlignment: ["E.2"],
  },

  // ============================================================
  // Human Resources
  // ============================================================
  {
    slug: "bls-cupa-code-prediction",
    name: "BLS Code Prediction",
    tagline:
      "Automated BLS occupation-code suggestions from job descriptions.",
    description:
      "A Vandalizer module that suggests Bureau of Labor Statistics occupation codes from a job description, replacing manual code identification in HR's classification workflow. Originally scoped to cover CUPA codes as well; narrowed to BLS for the first delivery.",
    homeUnits: ["Human Resources"],
    operationalOwners: [{ name: "Brooke Dahmen" }],
    buildParticipants: ["IIDS"],
    status: "approved",
    visibility: "Public",
    proposedDeploymentEnvironment: "to-be-determined",
    enterpriseSystemReplacement: { status: "to-be-determined" },
    ai4raRelationship: "Reference",
    iidsSponsor: "Colin Addington",
    operationalFunction:
      "Reads a job description and proposes candidate BLS occupation codes for HR classification staff to confirm.",
    operationalExcellenceOutcome:
      "Replaces manual code lookup — an estimated 0.5 FTE of HR classification effort returned, with more consistent coding across positions.",
    relatedSlugs: ["vandalizer"],
    workCategories: ["process"],
    strategicPlanAlignment: ["E.2"],
  },

  // ============================================================
  // University Communications and Marketing
  // ============================================================
  {
    slug: "ucm-daily-register",
    name: "UCM Daily Register",
    tagline: "AI-assisted newsletter production pipeline for UCM.",
    description:
      "Editorial pipeline for The Daily Register and My UI. Submission intake, AI-assisted style editing (Claude or OpenAI via MindRouter, with AP + UI style enforcement), word-level diff review, section-organized auto-assembly, and branded .docx export.",
    homeUnits: ["University Communications and Marketing"],
    operationalOwners: [
      { name: "Joy Bauer" },
      { name: "Leigh Cooper" },
      { name: "Jodi Walker" },
    ],
    buildParticipants: ["IIDS"],
    status: "prototype",
    visibility: "Public",
    proposedDeploymentEnvironment: "oit-hosted",
    enterpriseSystemReplacement: { status: "to-be-determined" },
    ai4raRelationship: "None",
    iidsSponsor: "Barrie Robison",
    liveUrlIsStaging: true,
    repoUrl: "https://github.com/ui-insight/UCMDailyRegister",
    liveUrl: "https://ucmnews.insight.uidaho.edu",
    operationalFunction:
      "Editorial cycle from community submission through style-consistent AI editing, human review, newsletter assembly, and Word export. Data-driven style rules editable via UI.",
    operationalExcellenceOutcome:
      "Faster newsletter turnaround. Enforces AP + UI style consistently across issues. Reduces manual editorial burden per issue.",
    tech: ["React 19", "FastAPI", "SQLAlchemy 2.0", "MindRouter"],
    relatedSlugs: ["mindrouter", "nexus"],
    workCategories: ["documents", "process"],
    strategicPlanAlignment: ["E.2"],
  },

  // ============================================================
  // Office of Sponsored Programs (ORED)
  // ============================================================
  {
    slug: "vandalizer",
    name: "Vandalizer",
    tagline: "AI-powered document intelligence for research administration.",
    description:
      "Open-source, self-hosted platform for AI-powered document review and data extraction, purpose-built for research administration. Structured LLM extraction, workflow engine, citation-backed RAG chat, multi-tenant workspaces. Developed under the AI4RA NSF GRANTED partnership and deployed at UI and Southern Utah University.",
    homeUnits: ["Office of Sponsored Programs (ORED)"],
    operationalOwners: [
      { name: "Sarah Martonick", title: "UI implementation owner" },
      { name: "John Brunsfeld", title: "Lead developer" },
    ],
    buildParticipants: ["IIDS"],
    status: "production",
    visibility: "Public",
    proposedDeploymentEnvironment: "to-be-determined",
    enterpriseSystemReplacement: { status: "to-be-determined" },
    ai4raRelationship: "Core",
    dualDestinyPlanned: true,
    externalDeployments: ["Southern Utah University"],
    iidsSponsor: "John Brunsfeld",
    productionScope: "external",
    supportContact: "John Brunsfeld",
    repoUrl: "https://github.com/ui-insight/vandalizer",
    liveUrl: "https://vandalizer.uidaho.edu",
    funding: "NSF GRANTED Award #2427549",
    operationalFunction:
      "Document-heavy research administration work: RFA extraction, award/contract review, compliance filings. Structured extraction + workflow engine + citation-backed Q&A against document collections.",
    operationalExcellenceOutcome:
      "Staff time savings on document extraction. Higher extraction accuracy. Reusable extraction workflows. Citation-backed Q&A over RA document collections.",
    tech: ["React 19", "Python 3.11+", "FastAPI", "Docker"],
    relatedSlugs: ["mindrouter", "dgx-stack", "processmapping"],
    workCategories: ["documents", "research-admin"],
    strategicPlanAlignment: ["D.2", "E.2"],
  },
  {
    slug: "processmapping",
    name: "ProcessMapping",
    tagline: "Process intelligence platform for Research Administration.",
    description:
      "Full-stack app plus data repository for Research Administration process intelligence. Canonical process-map JSON, Vandalizer-powered transcript ingest, workflow comparison, schema-validated projection into insight-db. AI4RA dual-destiny project.",
    homeUnits: ["Office of Sponsored Programs (ORED)"],
    operationalOwners: [{ name: "Barrie Robison" }],
    buildParticipants: ["IIDS"],
    status: "building",
    visibility: "Public",
    proposedDeploymentEnvironment: "to-be-determined",
    enterpriseSystemReplacement: { status: "to-be-determined" },
    ai4raRelationship: "Core",
    dualDestinyPlanned: true,
    iidsSponsor: "Barrie Robison",
    liveUrlIsStaging: true,
    repoUrl: "https://github.com/ui-insight/ProcessMapping",
    liveUrl: "https://processmapping.insight.uidaho.edu",
    operationalFunction:
      "Documents and analyzes RA processes: who does what, with which systems, using which inputs and outputs. Feeds requirements for OpenERA and similar tools. Surfaces coverage gaps between processes and current tooling.",
    operationalExcellenceOutcome:
      "Shared vocabulary and visibility for RA processes. Identifies process/tool coverage gaps. Requirements source for automation. Onboarding and training asset.",
    tech: ["React 19", "TypeScript", "Vite", "FastAPI", "Python 3.11+"],
    relatedSlugs: ["vandalizer"],
    workCategories: ["process", "research-admin"],
    strategicPlanAlignment: ["D.2", "E.2", "E.4"],
  },

  // ============================================================
  // Office of Research and Economic Development
  // ============================================================
  {
    slug: "openera",
    name: "OpenERA",
    tagline:
      "Open electronic research administration system — canonical UDM implementor for sponsored research.",
    description:
      "Institutional sponsored-research administration system, operated by IIDS for the Office of Research and Economic Development. The canonical implementor of the AI4RA Unified Data Model in research administration: 32 tables spanning 20 canonical UDM tables and 12 project-specific extensions. AI4RA Core dual-destiny project; designed to be deployable beyond UI as the partnership matures.",
    homeUnits: ["Office of Research and Economic Development"],
    operationalOwners: [
      { name: "Sarah Martonick", title: "UI implementation owner" },
    ],
    buildParticipants: ["IIDS"],
    status: "building",
    visibility: "Partial",
    proposedDeploymentEnvironment: "oit-hosted",
    enterpriseSystemReplacement: {
      status: "yes",
      systemName: "VERAS",
      annualCostUsd: 150_000,
      renewalDate: "2027-03-31",
    },
    ai4raRelationship: "Core",
    dualDestinyPlanned: true,
    iidsSponsor: "Barrie Robison",
    liveUrlIsStaging: true,
    repoUrl: "https://github.com/ui-insight/OpenERA",
    liveUrl: "https://openera.insight.uidaho.edu",
    operationalFunction:
      "Sponsored-research administration: proposal lifecycle, award management, compliance, and reporting for ORED. Anchors the institutional research-admin data layer that Vandalizer, ProcessMapping, and adjacent ORED tools build against.",
    operationalExcellenceOutcome:
      "On-prem, UDM-aligned ERA system with shared data semantics across ORED tooling. Enables AI features (extraction, lookup, classification) on research-admin data without third-party data egress. Reference deployment for AI4RA partners.",
    tech: ["React", "TypeScript", "Tailwind CSS", "FastAPI", "SQLAlchemy 2.0", "PostgreSQL 16"],
    relatedSlugs: ["vandalizer", "processmapping", "nexus"],
    workCategories: ["research-admin"],
    strategicPlanAlignment: ["D.2", "E.2"],
  },

  // ============================================================
  // ORED + Office of General Counsel (dual home)
  // ============================================================
  {
    slug: "execord",
    name: "ExecOrd",
    tagline:
      "Executive Order compliance tracker.",
    description:
      "Compliance tracking prototype for federal Executive Order impacts on the institution.",
    homeUnits: ["Office of Research and Economic Development", "Office of General Counsel"],
    operationalOwners: [{ name: "Sarah Martonick" }],
    buildParticipants: ["IIDS"],
    status: "prototype",
    visibility: "Public",
    proposedDeploymentEnvironment: "to-be-determined",
    enterpriseSystemReplacement: { status: "to-be-determined" },
    ai4raRelationship: "None",
    iidsSponsor: "Barrie Robison",
    liveUrlIsStaging: true,
    repoUrl: "https://github.com/ui-insight/eo-compliance",
    isPrivateRepo: true,
    liveUrl: "https://eocompliance.insight.uidaho.edu",
    operationalFunction:
      "Tracks federal Executive Orders, applicability to UI, required actions, deadlines, responsible parties, and current posture.",
    operationalExcellenceOutcome:
      "Systematic EO response posture. Reduces scramble when new EOs drop. Living view of EO-driven obligations for leadership.",
    workCategories: ["documents", "process"],
    strategicPlanAlignment: ["E.4"],
  },

  // ============================================================
  // Strategic Enrollment Management
  // ============================================================
  {
    slug: "sem-experiential",
    name: "SEM Experiential Learning",
    tagline:
      "Co-built with SEM — experiential learning and student engagement records.",
    description:
      "Platform for managing experiential learning and student engagement records. MVP covers organizations, events, attendance, dashboard metrics, and admin user lifecycle. Scaffolded from TEMPLATE-app following OpenERA patterns. This is an early example of IIDS diffusing agentic-coding capability out into partner units: SEM is co-building alongside IIDS, not just consuming.",
    homeUnits: ["Strategic Enrollment Management"],
    operationalOwners: [
      { name: "Dean Kahler", title: "Vice Provost of SEM" },
    ],
    buildParticipants: ["IIDS", "SEM"],
    status: "building",
    visibility: "Public",
    proposedDeploymentEnvironment: "to-be-determined",
    enterpriseSystemReplacement: { status: "to-be-determined" },
    ai4raRelationship: "None",
    iidsSponsor: "Barrie Robison",
    repoUrl: "https://github.com/ui-insight/SEM-experiential",
    operationalFunction:
      "Single record of student engagement: events, attendance, organizations. Foundation for verified experience transcripts.",
    operationalExcellenceOutcome:
      "Consolidates fragmented student engagement tracking. Supports recruitment/retention reporting. Demonstrates unit-led co-build pattern — a repeatable path for other UI units to develop their own AI-assisted tooling.",
    tags: ["diffusion"],
    relatedSlugs: ["template-app"],
    workCategories: ["coordination"],
    strategicPlanAlignment: ["B.3"],
  },

  // ============================================================
  // Athletics
  // ============================================================
  {
    slug: "sidearm-pipeline",
    name: "Vandals Stats Pipeline",
    tagline:
      "Trusted athletics data warehouse and exploratory workspace for Sports Information Directors.",
    description:
      "Internal athletics data warehouse that ingests public Sidearm boxscores and season statistics, normalizes game and player history in PostgreSQL, preserves source provenance and coverage windows, and gives Sports Information Directors an evidence-backed workspace for record-book research, notable-achievement review, and downstream website-ready data. Release 1 is internal-SID-first; public website integration is deferred.",
    homeUnits: ["Athletics"],
    operationalOwners: [],
    buildParticipants: ["IIDS"],
    status: "building",
    visibility: "Public",
    proposedDeploymentEnvironment: "oit-hosted",
    enterpriseSystemReplacement: { status: "no" },
    ai4raRelationship: "None",
    iidsSponsor: "Barrie Robison",
    repoUrl: "https://github.com/ui-insight/sidearm-pipeline",
    operationalFunction:
      "Ingests and normalizes Sidearm boxscores and cumulative season statistics; maintains a provenance-aware athletics record book; and supports SID review, comparison, export, achievement suggestions, and governed natural-language questions over verified warehouse facts.",
    operationalExcellenceOutcome:
      "Turns fragmented public athletics statistics into a durable institutional record, reduces manual record-book research, and gives Athletics staff faster access to evidence they can confidently use in coverage and website publishing.",
    tech: [
      "React 19",
      "TypeScript",
      "Tailwind CSS",
      "FastAPI",
      "SQLAlchemy 2.0",
      "PostgreSQL 16",
      "Docker",
    ],
    relatedSlugs: ["template-app", "mindrouter", "nexus"],
    workCategories: ["knowledge-retrieval", "process"],
    strategicPlanAlignment: ["E.1", "E.2"],
  },

  // ============================================================
  // Research Faculty Development (ORED)
  // ============================================================
  {
    slug: "rfd-companion",
    name: "RFD Companion",
    tagline:
      "One accountable workspace for Research and Faculty Development operations.",
    description:
      "Standalone operational workspace for proposal-development support, faculty-development programs, internal competitions, events, reviews, shared calendars, and staff and faculty next actions. RFD Companion integrates with OpenERA through explicit least-privilege APIs, is intended to replace RFD's InfoReady workflows after parity and migration validation, and will replace TDX for proposal-development operations after a controlled cutover.",
    homeUnits: ["Research Faculty Development (ORED)"],
    operationalOwners: [
      {
        name: "Carly Cummings",
        title: "Director of Research and Faculty Development",
      },
    ],
    buildParticipants: ["IIDS", "Research and Faculty Development"],
    status: "building",
    visibility: "Public",
    proposedDeploymentEnvironment: "to-be-determined",
    enterpriseSystemReplacement: {
      status: "yes",
      systemName: "InfoReady",
      annualCostUsd: 17_000,
      renewalDate: "2026-11-06",
    },
    ai4raRelationship: "Adjacent",
    iidsSponsor: "Barrie Robison",
    repoUrl: "https://github.com/ui-insight/RFDModule",
    isPrivateRepo: true,
    operationalFunction:
      "Coordinates RFD service requests, proposal checklists and task schedules, faculty-development programs and cohorts, competitions, events, reviews, shared deadlines, and role-scoped next actions while exchanging authoritative proposal and award data with OpenERA.",
    operationalExcellenceOutcome:
      "Replaces fragmented spreadsheets and vendor-shaped workflows with one RFD-owned operating model, reduces duplicate entry across research-administration systems, and positions RFD to retire the approximately $17,000-per-year InfoReady contract after validated parity and migration.",
    tech: [
      "React",
      "TypeScript",
      "FastAPI",
      "SQLAlchemy 2.0",
      "PostgreSQL 16",
      "Redis",
      "arq",
      "Docker",
    ],
    relatedSlugs: ["openera", "rfd-career"],
    workCategories: ["research-admin", "process", "coordination"],
    strategicPlanAlignment: ["D.2", "E.2", "E.4"],
  },
  {
    slug: "rfd-career",
    name: "RFD CAREER Dashboard",
    tagline: "Cohort progress dashboard for the CAREER Club program.",
    description:
      "Interactive cohort dashboard tracking participant progress through CAREER Club workbook data. Supports faculty development program leaders in identifying stuck participants and evaluating program effectiveness.",
    homeUnits: ["Research Faculty Development (ORED)"],
    operationalOwners: [{ name: "Eric Torok" }],
    buildParticipants: ["IIDS"],
    status: "piloting",
    visibility: "Public",
    proposedDeploymentEnvironment: "to-be-determined",
    enterpriseSystemReplacement: { status: "to-be-determined" },
    ai4raRelationship: "Adjacent",
    iidsSponsor: "Barrie Robison",
    pilotCohort: { size: 12, scope: "CAREER Club cohort" },
    repoUrl: "https://github.com/ui-insight/RFD-career",
    liveUrl: "https://rfdcareerclub.insight.uidaho.edu",
    operationalFunction:
      "Visualizes CAREER Club cohort and individual-participant progress against workbook rubric milestones.",
    operationalExcellenceOutcome:
      "Cohort visibility for program leaders. Data-driven program improvement. Stronger NSF CAREER-grant pipeline.",
    tech: ["React", "TypeScript", "Vite", "FastAPI"],
    workCategories: ["executive-analytics"],
    strategicPlanAlignment: ["D.2", "E.3"],
  },

  // ============================================================
  // UI Library
  // ============================================================
  {
    slug: "universo",
    name: "UniVerso",
    tagline:
      "AI-powered research discovery for the University of Idaho.",
    description:
      "Conversational research discovery platform: users search and discover UI research through natural-language queries, powered by vector search (ChromaDB) and LLM-generated overviews. Surfaces researchers, projects, and outputs across the university to internal and external audiences. Uniquely uses a MongoDB + ChromaDB stack rather than the Postgres + UDM line shared by the AI4RA-aligned projects.",
    homeUnits: ["UI Library"],
    operationalOwners: [
      { name: "Devin Becker", title: "Associate Dean of the Library" },
    ],
    buildParticipants: ["IIDS"],
    status: "piloting",
    visibility: "Public",
    proposedDeploymentEnvironment: "to-be-determined",
    enterpriseSystemReplacement: { status: "to-be-determined" },
    ai4raRelationship: "None",
    iidsSponsor: "Barrie Robison",
    pilotCohort: { size: 10, scope: "UI Library and IIDS staff" },
    repoUrl: "https://github.com/ui-iids/universo",
    isPrivateRepo: true,
    liveUrl: "https://universo.insight.uidaho.edu",
    operationalFunction:
      "Conversational interface for discovering UI research: search across researchers, projects, and outputs; AI-generated overviews summarise discovery results in context.",
    operationalExcellenceOutcome:
      "Lowers the barrier to discovering what UI researchers do — internally for cross-unit collaboration, externally for partners and prospective collaborators. Library-led complement to the ORED-led research-administration stack.",
    tech: [
      "FastAPI",
      "Python 3.13",
      "React 19",
      "Vite",
      "TypeScript",
      "MongoDB",
      "ChromaDB",
      "LangChain",
      "MindRouter",
    ],
    relatedSlugs: ["mindrouter"],
    workCategories: ["research-admin"],
    strategicPlanAlignment: ["D.2"],
  },

  // ============================================================
  // IIDS — Infrastructure
  // ============================================================
  {
    slug: "mindrouter",
    name: "MindRouter",
    tagline:
      "Production LLM load balancer and unified API fronting UI's on-prem AI compute.",
    description:
      "LLM inference load balancer fronting a heterogeneous Ollama + vLLM cluster. Provides unified OpenAI-, Ollama-, and Anthropic-compatible endpoints with fair-share scheduling, quotas, telemetry, Azure AD SSO, and full audit logging. Open-sourced at mindrouter.ai and deployed at UI.",
    homeUnits: ["IIDS"],
    operationalOwners: [{ name: "Luke Sheneman" }],
    buildParticipants: ["IIDS"],
    status: "production",
    visibility: "Public",
    proposedDeploymentEnvironment: "iids-hosted",
    enterpriseSystemReplacement: { status: "to-be-determined" },
    ai4raRelationship: "Core",
    dualDestinyPlanned: true,
    iidsSponsor: "Luke Sheneman",
    productionScope: "external",
    supportContact: "Luke Sheneman",
    repoUrl: "https://github.com/ui-insight/MindRouter",
    liveUrl: "https://mindrouter.uidaho.edu",
    operationalFunction:
      "Shared institutional LLM inference substrate. Every AI app at UI routes through it. Fair-share scheduling, quotas, audit trail, on-prem compute, cost control.",
    operationalExcellenceOutcome:
      "Enables every downstream AI app at UI. Keeps data on-prem for compliance. Avoids per-seat vendor lock-in. Institutional audit trail. Fair access across research and operations workloads.",
    tech: ["Python 3.11+", "Docker", "Ollama", "vLLM", "Azure AD SSO"],
    relatedSlugs: ["dgx-stack", "audit-dashboard", "vandalizer", "ucm-daily-register"],
    workCategories: ["ai-infrastructure"],
    strategicPlanAlignment: ["A.3", "E.2"],
  },
  {
    slug: "dgx-stack",
    name: "DGX Stack",
    tagline:
      "On-prem vLLM + OCR appliance on NVIDIA DGX Spark (Grace-Blackwell).",
    description:
      "Two-container stack for NVIDIA DGX Spark that serves a multimodal LLM via vLLM alongside a document-OCR container. Supports Gemma 4 26B and Qwen 3.5 35B FP8. Deployed at UI as a MindRouter backend; also deployed at Southern Utah University (AI4RA partner) for Vandalizer.",
    homeUnits: ["IIDS"],
    operationalOwners: [{ name: "Luke Sheneman" }],
    buildParticipants: ["IIDS"],
    status: "production",
    visibility: "Public",
    proposedDeploymentEnvironment: "iids-hosted",
    enterpriseSystemReplacement: { status: "to-be-determined" },
    ai4raRelationship: "Adjacent",
    externalDeployments: ["Southern Utah University"],
    iidsSponsor: "Luke Sheneman",
    productionScope: "external",
    supportContact: "Luke Sheneman",
    repoUrl: "https://github.com/ui-insight/dgx-stack",
    operationalFunction:
      "On-prem LLM + OCR appliance. Serves as a backend node to MindRouter. Provides the OCR used by Audit Dashboard, Vandalizer, OpenERA. Supports air-gapped workloads.",
    operationalExcellenceOutcome:
      "On-prem AI compute without cloud recurring costs. Supports compliance-sensitive and air-gapped workloads. Backbone for institutional OCR and LLM serving.",
    tech: ["Docker", "vLLM", "NVIDIA Container Toolkit", "CUDA 13"],
    relatedSlugs: ["mindrouter", "audit-dashboard", "vandalizer"],
    workCategories: ["ai-infrastructure"],
    strategicPlanAlignment: ["D.2", "E.2"],
  },
  {
    slug: "data-infrastructure-pilot",
    name: "Data Infrastructure Pilot",
    tagline:
      "Institutional data lakehouse pilot aligning the data behind AI4UI applications.",
    description:
      "Pilot connecting institutional structured and unstructured data sources to a shared data lakehouse, starting with Banner plus at least one other system — fully documented with a data dictionary. The longer vision expands the lake to include ArchAI contract data, targeted core documents from proposals, and other sources the AI4UI application family draws on.",
    homeUnits: ["IIDS"],
    operationalOwners: [
      { name: "Arpan Pal" },
      { name: "Nathan Layman" },
    ],
    buildParticipants: ["IIDS"],
    status: "approved",
    visibility: "Public",
    proposedDeploymentEnvironment: "to-be-determined",
    enterpriseSystemReplacement: { status: "to-be-determined" },
    ai4raRelationship: "Adjacent",
    iidsSponsor: "Colin Addington",
    operationalFunction:
      "Establishes governed lakehouse access to institutional data sources, with documentation and data dictionaries, as the shared substrate for AI4UI applications.",
    operationalExcellenceOutcome:
      "Aligns the data used and created by AI4UI applications on one governed foundation instead of per-project extracts — the E.1 data-warehouse priority made concrete.",
    relatedSlugs: ["dgx-stack", "nexus"],
    workCategories: ["ai-infrastructure"],
    strategicPlanAlignment: ["E.1", "E.2"],
  },
  {
    slug: "template-app",
    name: "TEMPLATE-app",
    tagline:
      "Production-ready scaffold for new UI business applications (under OIT review).",
    description:
      "Opinionated starting point for building University business applications with agentic AI development. Bakes in UI's tech stack, documentation standards, data governance classification, security standards (JWT, RBAC, dependency scanning), CI/CD, and agent guidance from day one. Available for use by any UI unit; currently under OIT review for institutional-standards endorsement.",
    homeUnits: ["IIDS"],
    operationalOwners: [{ name: "Barrie Robison" }],
    buildParticipants: ["IIDS"],
    status: "paused",
    visibility: "Public",
    proposedDeploymentEnvironment: "not-applicable",
    enterpriseSystemReplacement: { status: "no" },
    institutionalReviewStatus: "Under OIT review",
    ai4raRelationship: "Adjacent",
    iidsSponsor: "Luke Sheneman",
    productionScope: "institution-wide",
    supportContact: "Barrie Robison",
    repoUrl: "https://github.com/ui-insight/TEMPLATE-app",
    operationalFunction:
      "Standardizes how new UI business apps start. Enforces data governance, security, documentation, CI/CD, and agentic-development norms from day one. Consumed by SEM-experiential, Audit Dashboard, StratPlanTactics.",
    operationalExcellenceOutcome:
      "Consistent app patterns across UI units. Faster new-app delivery. Propagates institutional standards by construction. Lowers the barrier for unit-led co-builds (the SEM pattern).",
    tech: ["React 19", "TypeScript", "Tailwind v4", "FastAPI", "PostgreSQL"],
    tags: ["diffusion"],
    relatedSlugs: [
      "sem-experiential",
      "audit-dashboard",
      "stratplan",
      "nexus",
    ],
    workCategories: ["ai-infrastructure"],
    strategicPlanAlignment: ["E.2", "E.4"],
  },

  // ============================================================
  // Tracked — not built by IIDS
  // ============================================================
  {
    slug: "oit-data-modernization",
    name: "OIT Data Modernization (Huron)",
    tagline: "Enterprise data modernization led by OIT with Huron consulting.",
    description:
      "OIT is leading an institutional data modernization effort in partnership with Huron Consulting. The work is tracked here as part of the AI projects inventory; detailed information will be added as OIT shares scope, timelines, and integration points with related IIDS-built work.",
    homeUnits: ["Office of Information Technology"],
    operationalOwners: [],
    buildParticipants: ["OIT", "Huron Consulting"],
    status: "tracked",
    visibility: "Public",
    proposedDeploymentEnvironment: "to-be-determined",
    enterpriseSystemReplacement: { status: "to-be-determined" },
    ai4raRelationship: "None",
    iidsSponsor: "Barrie Robison",
    operationalFunction:
      "Enterprise data modernization scope to be confirmed.",
    operationalExcellenceOutcome:
      "Foundation for institutional reporting, analytics, and interoperability across enterprise systems.",
    trackingOnly: true,
    strategicPlanAlignment: ["E.1"],
  },
  {
    slug: "nexus",
    name: "Nexus",
    tagline:
      "OIT-managed application platform where UI application modules are deployed.",
    description:
      "React + FastAPI application platform running on OIT-managed secure infrastructure, built collaboratively by OIT and IIDS. Nexus is the institutional template where University of Idaho application modules are deployed, providing a shared, audited, and security-hardened runtime for AI-enabled and traditional unit-level apps. Complements TEMPLATE-app: where TEMPLATE-app is the development scaffold, Nexus is the production landing zone. Governed by OIT's Enterprise AI Development Framework (the approved tech stack) and AI-Assisted Builder Guide (the six-stage pathway for teams outside OIT); OpenERA and UCM Daily Register are the first IIDS-built applications entering that pathway.",
    homeUnits: ["Office of Information Technology"],
    operationalOwners: [
      { name: "Kali Armitage" },
      { name: "Colin Addington" },
    ],
    buildParticipants: ["OIT", "IIDS"],
    status: "tracked",
    visibility: "Public",
    proposedDeploymentEnvironment: "oit-hosted",
    enterpriseSystemReplacement: { status: "no" },
    ai4raRelationship: "None",
    iidsSponsor: "Barrie Robison",
    trackingOnly: true,
    tech: ["React", "FastAPI", "OIT managed infrastructure"],
    operationalFunction:
      "Hosts UI application modules on OIT-managed secure infrastructure with a consistent runtime, identity, and security baseline. Target deployment surface for new UI apps that need institutional hosting.",
    operationalExcellenceOutcome:
      "Standardizes where institutional application modules live. Shared security posture, audit trail, and operational footprint across UI units. Reduces per-app hosting overhead and fragmentation.",
    relatedSlugs: ["template-app", "openera", "ucm-daily-register"],
    workCategories: ["ai-infrastructure"],
    strategicPlanAlignment: ["E.1", "E.4"],
  },
];

// ============================================================
// Helpers
// ============================================================

// Operational status → public stage rollup. See ADR 0001.
export function computePublicStage(status: ProjectStatus): PublicStage {
  switch (status) {
    case "idea":
    case "approved":
      return "exploring";
    case "building":
    case "prototype":
      return "building";
    case "piloting":
    case "production":
    case "maintained":
      return "live";
    case "paused":
      return "paused";
    case "sunsetting":
    case "archived":
      return "retired";
    case "tracked":
      return "tracked";
  }
}

const STATUSES: ReadonlyArray<ProjectStatus> = [
  "idea",
  "approved",
  "building",
  "prototype",
  "piloting",
  "production",
  "maintained",
  "paused",
  "sunsetting",
  "archived",
  "tracked",
];

export function isProjectStatus(s: string): s is ProjectStatus {
  return (STATUSES as readonly string[]).includes(s);
}

// String-input version of computePublicStage. Postgres-sourced rows
// carry status as a plain string; if a row has a status outside the
// canonical 10-value union (drift, legacy data, etc.), bucket it as
// `exploring` so the UI never crashes.
export function publicStageFromStatus(status: string): PublicStage {
  if (isProjectStatus(status)) return computePublicStage(status);
  return "exploring";
}

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((i) => i.slug === slug);
}

export function getRelatedProjects(i: Project): Project[] {
  if (!i.relatedSlugs) return [];
  return i.relatedSlugs
    .map((slug) => getProjectBySlug(slug))
    .filter((x): x is Project => x !== undefined);
}

export function getPubliclyVisible(): Project[] {
  return projects.filter((i) => i.visibility !== "Internal-only");
}

// Group ordering for display — home-unit groups appear in this order.
export const HOME_UNIT_GROUP_ORDER = [
  "Office of the President",
  "Office of Sponsored Programs (ORED)",
  "Office of Research and Economic Development",
  "Research Faculty Development (ORED)",
  "UI Library",
  "Division of Financial Affairs",
  "Strategic Enrollment Management",
  "Athletics",
  "University Communications and Marketing",
  "Office of General Counsel",
  "Office of Information Technology",
  "IIDS",
];

export function groupByHomeUnit(
  items: Project[]
): { unit: string; items: Project[] }[] {
  // A project is listed under its FIRST home unit for grouping.
  const groups = new Map<string, Project[]>();
  for (const i of items) {
    const primary = i.homeUnits[0] || "Unclassified";
    const existing = groups.get(primary) || [];
    existing.push(i);
    groups.set(primary, existing);
  }
  const ordered = HOME_UNIT_GROUP_ORDER.filter((u) => groups.has(u)).map(
    (unit) => ({ unit, items: groups.get(unit) || [] })
  );
  // Any unexpected home units get appended at the end
  for (const [unit, items] of groups.entries()) {
    if (!HOME_UNIT_GROUP_ORDER.includes(unit)) {
      ordered.push({ unit, items });
    }
  }
  return ordered;
}

// ============================================================
// Lifecycle Display — UI helpers for ADR 0001
// ============================================================
// Labels, colors, and rollups for the operational ladder and
// public-stage axes. Imported by PortfolioCard, PortfolioFilters,
// and the landing stat strip.
//
// Color rule (locked in .impeccable.md):
//   - Public-stage chips carry stage-specific color (silver / huckleberry /
//     clearwater / gray / huckleberry-tint).
//   - Operational chips are ALWAYS neutral surface — same restraint as
//     the work-categories chips. No per-status color.
// ============================================================

export const PUBLIC_STAGE_LABEL: Record<PublicStage, string> = {
  exploring: "Exploring",
  building: "Building",
  live: "Live",
  paused: "Paused",
  retired: "Retired",
  tracked: "Tracked",
};

// Tailwind class strings for each public-stage chip.
// Each entry is a one-shot className for a chip with border + bg + text.
export const PUBLIC_STAGE_CHIP: Record<PublicStage, string> = {
  exploring: "border-brand-silver/40 bg-brand-silver/10 text-brand-silver",
  building: "border-brand-huckleberry/30 bg-brand-huckleberry/10 text-brand-huckleberry",
  live: "border-brand-clearwater/40 bg-brand-clearwater/10 text-brand-clearwater",
  // Paused uses the caution/amber family (already the codebase signal for
  // blockers) — a deliberate hold reads distinctly from the brand-accent
  // stages without borrowing reserved Pride Gold.
  paused: "border-amber-300 bg-amber-50 text-amber-700",
  retired: "border-gray-200 bg-gray-50 text-gray-500",
  tracked: "border-brand-huckleberry/30 bg-brand-huckleberry/10 text-brand-huckleberry",
};

// Reading-order list — used by the filter UI and the landing stat strip.
// `tracked` is omitted from the conventional progression and tacked on
// at the end since it's a meta-state that bypasses the ladder.
export const PUBLIC_STAGE_ORDER: PublicStage[] = [
  "exploring",
  "building",
  "live",
  "paused",
  "retired",
  "tracked",
];

export const OPERATIONAL_LABEL: Record<ProjectStatus, string> = {
  idea: "Idea",
  approved: "Approved",
  building: "Building",
  prototype: "Prototype",
  piloting: "Piloting",
  production: "Production",
  maintained: "Maintained",
  paused: "Paused",
  sunsetting: "Sunsetting",
  archived: "Archived",
  tracked: "Tracked",
};

// Tooltip-grade definitions for the colored chips on PortfolioCard. Each
// string is short enough to read in a native `title` tooltip; together
// they replace the bottom-of-page "How to read this inventory" callout.
export const PUBLIC_STAGE_TITLE: Record<PublicStage, string> = {
  exploring: "Exploring — idea or approval phase; not yet being built.",
  building: "Building — actively being built or prototyped by IIDS.",
  live: "Live — piloting, in production, or maintained.",
  paused: "Paused — deliberately on hold; not abandoned, may resume.",
  retired: "Retired — sunsetting or archived.",
  tracked: "Tracked — in the inventory but not built by IIDS.",
};

export const OPERATIONAL_TITLE: Record<ProjectStatus, string> = {
  idea: "Idea — proposal not yet evaluated.",
  approved: "Approved — green-lit but not yet started.",
  building: "Building — under active development.",
  prototype: "Prototype — early build, not yet user-tested.",
  piloting: "Piloting — limited user base validating the build.",
  production: "Production — broadly deployed and in use.",
  maintained: "Maintained — production with ongoing support.",
  paused: "Paused — active development deliberately halted; expected to resume.",
  sunsetting: "Sunsetting — being phased out.",
  archived: "Archived — fully retired.",
  tracked: "Tracked — externally owned, in inventory only.",
};

// Inverse of computePublicStage — for the filter drill-in.
// Lists the 1-N operational states that roll up into each public stage,
// in approximate ladder order.
export const STAGE_OPERATIONAL_ROLLUP: Record<PublicStage, ProjectStatus[]> = {
  exploring: ["idea", "approved"],
  building: ["building", "prototype"],
  live: ["piloting", "production", "maintained"],
  paused: ["paused"],
  retired: ["sunsetting", "archived"],
  tracked: ["tracked"],
};

// Aggregate stage counts across a list of items keyed by status. Used by
// the landing stat strip and the /portfolio header. Returns the stages
// in PUBLIC_STAGE_ORDER, with zero-count stages dropped.
export function stageBreakdown(
  items: ReadonlyArray<{ status: string }>
): Array<{ stage: PublicStage; count: number }> {
  const counts = new Map<PublicStage, number>();
  for (const item of items) {
    const stage = publicStageFromStatus(item.status);
    counts.set(stage, (counts.get(stage) ?? 0) + 1);
  }
  return PUBLIC_STAGE_ORDER.filter((s) => (counts.get(s) ?? 0) > 0).map(
    (stage) => ({ stage, count: counts.get(stage)! })
  );
}
