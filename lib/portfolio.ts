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
  | "sunsetting"
  | "archived"
  | "tracked";

// Public-stage rollup — what stakeholders see on /portfolio and the
// landing stat strip. Computed from `status` via `computePublicStage`.
export type PublicStage =
  | "exploring"
  | "building"
  | "live"
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
    status: "building",
    visibility: "Public",
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
    status: "building",
    visibility: "Public",
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
    relatedSlugs: ["mindrouter"],
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
    relatedSlugs: ["vandalizer", "processmapping"],
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
    status: "building",
    visibility: "Public",
    ai4raRelationship: "None",
    iidsSponsor: "Barrie Robison",
    liveUrlIsStaging: true,
    repoUrl: "https://github.com/ui-insight/ExecOrd",
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
  // Research Faculty Development (ORED)
  // ============================================================
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
    ai4raRelationship: "Core",
    dualDestinyPlanned: true,
    iidsSponsor: "Luke Sheneman",
    productionScope: "external",
    supportContact: "Luke Sheneman",
    repoUrl: "https://github.com/ui-insight/MindRouter",
    liveUrl: "https://mindrouter.ai",
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
    slug: "template-app",
    name: "TEMPLATE-app",
    tagline:
      "Production-ready scaffold for new UI business applications (under OIT review).",
    description:
      "Opinionated starting point for building University business applications with agentic AI development. Bakes in UI's tech stack, documentation standards, data governance classification, security standards (JWT, RBAC, dependency scanning), CI/CD, and agent guidance from day one. Available for use by any UI unit; currently under OIT review for institutional-standards endorsement.",
    homeUnits: ["IIDS"],
    operationalOwners: [{ name: "Barrie Robison" }],
    buildParticipants: ["IIDS"],
    status: "production",
    visibility: "Public",
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
      "React + FastAPI application platform running on OIT-managed secure infrastructure, built collaboratively by OIT and IIDS. Nexus is the institutional template where University of Idaho application modules are deployed, providing a shared, audited, and security-hardened runtime for AI-enabled and traditional unit-level apps. Complements TEMPLATE-app: where TEMPLATE-app is the development scaffold, Nexus is the production landing zone.",
    homeUnits: ["Office of Information Technology"],
    operationalOwners: [
      { name: "Kali Armitage" },
      { name: "Colin Addington" },
    ],
    buildParticipants: ["OIT", "IIDS"],
    status: "tracked",
    visibility: "Public",
    ai4raRelationship: "None",
    iidsSponsor: "Barrie Robison",
    trackingOnly: true,
    tech: ["React", "FastAPI", "OIT managed infrastructure"],
    operationalFunction:
      "Hosts UI application modules on OIT-managed secure infrastructure with a consistent runtime, identity, and security baseline. Target deployment surface for new UI apps that need institutional hosting.",
    operationalExcellenceOutcome:
      "Standardizes where institutional application modules live. Shared security posture, audit trail, and operational footprint across UI units. Reduces per-app hosting overhead and fragmentation.",
    relatedSlugs: ["template-app"],
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
  "Division of Financial Affairs",
  "Strategic Enrollment Management",
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
  retired: "Retired",
  tracked: "Tracked",
};

// Tailwind class strings for each public-stage chip.
// Each entry is a one-shot className for a chip with border + bg + text.
export const PUBLIC_STAGE_CHIP: Record<PublicStage, string> = {
  exploring: "border-brand-silver/40 bg-brand-silver/10 text-brand-silver",
  building: "border-brand-huckleberry/30 bg-brand-huckleberry/10 text-brand-huckleberry",
  live: "border-brand-clearwater/40 bg-brand-clearwater/10 text-brand-clearwater",
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
