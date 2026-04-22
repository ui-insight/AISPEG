// ============================================================
// UI AI Intervention Inventory
// ============================================================
// The authoritative list of AI interventions across University of Idaho units
// that AISPEG coordinates, builds, or tracks. An "intervention" is a UI
// deployment / UI-owned effort — not a GitHub repo. Repos are artifacts;
// interventions have home units, operational owners, and status-at-UI.
//
// This file replaces the repo-centric "portfolioProjects" that predated the
// April 2026 interview with Barrie Robison. AI4RA reference projects
// (prompt-library, evaluation-harness, AI4RA-UDM, mcp-ecfr, etc.) live on
// /ai4ra-ecosystem, not here.
// ============================================================

export type Visibility =
  | "Public"       // Everything about this entry can be shown publicly
  | "Partial"      // Entry acknowledged; UI deployment details embargoed
  | "Internal-only"; // Not shown on the public site at all

export type InterventionStatus =
  | "Planned"
  | "Prototype"    // Built, not yet in use with real users
  | "Piloting"     // Deployed prototype in use with a limited group
  | "Production"   // Deployed for regular institutional use
  | "Tracked"      // Not built by AISPEG/IIDS; tracking-only stub
  | "Archived";

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

export interface Intervention {
  slug: string;
  name: string;
  tagline: string;
  description: string;

  // Ownership
  homeUnits: string[];
  operationalOwners: OperationalOwner[];
  buildParticipants: string[];

  // Status
  status: InterventionStatus;
  visibility: Visibility;
  institutionalReviewStatus?: InstitutionalReviewStatus;

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
}

export const interventions: Intervention[] = [
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
    status: "Production",
    visibility: "Public",
    ai4raRelationship: "None",
    repoUrl: "https://github.com/ui-insight/StratPlanTacticsMB",
    liveUrl: "https://strategicplan.insight.uidaho.edu",
    operationalFunction:
      "Executive tracking of strategic plan execution across 25 units and 337 tactics. Alignment matrix, synergy finder, coverage analysis, investment portfolio analytics, redundancy detection, pillar deep-dive, unit portfolios, tactic explorer.",
    operationalExcellenceOutcome:
      "Makes strategic execution visible. Surfaces under-served priorities, cross-unit synergies, and misalignment. Supports investment prioritization conversations.",
    tech: ["React 19", "TypeScript", "Tailwind v4", "FastAPI", "PostgreSQL"],
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
    status: "Prototype",
    visibility: "Partial",
    ai4raRelationship: "None",
    repoUrl: "https://github.com/ui-insight/AuditDashboard",
    operationalFunction:
      "Audit observation lifecycle: ingest report PDF → extract observations and action items → assign responsible parties → monitor closure with overdue alerts. Replaces spreadsheet tracking.",
    operationalExcellenceOutcome:
      "Closes the audit follow-through loop. Reduces risk of observations lingering past target dates. Gives leadership a living compliance-posture view.",
    tech: ["React 19", "FastAPI", "PostgreSQL 16", "MindRouter", "Qwen3"],
    relatedSlugs: ["mindrouter", "dgx-stack", "template-app"],
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
    status: "Prototype",
    visibility: "Public",
    ai4raRelationship: "None",
    repoUrl: "https://github.com/ui-insight/UCMDailyRegister",
    liveUrl: "https://ucmnews.insight.uidaho.edu",
    operationalFunction:
      "Editorial cycle from community submission through style-consistent AI editing, human review, newsletter assembly, and Word export. Data-driven style rules editable via UI.",
    operationalExcellenceOutcome:
      "Faster newsletter turnaround. Enforces AP + UI style consistently across issues. Reduces manual editorial burden per issue.",
    tech: ["React 19", "FastAPI", "SQLAlchemy 2.0", "MindRouter"],
    relatedSlugs: ["mindrouter"],
  },

  // ============================================================
  // Office of Sponsored Programs (ORED)
  // ============================================================
  {
    // Embargoed on the public site. Internal identity (project name,
    // scope, artifacts) deliberately omitted here — the card, owner,
    // status, and AI4RA Core relationship are shown; everything else
    // is placeholder until public release.
    slug: "embargoed-osp",
    name: "Embargoed project",
    tagline: "Details embargoed pending public release.",
    description:
      "This intervention is in active development. Its identity, scope, and deployment details are embargoed on the public site until authorized release. The project is an AI4RA Core dual-destiny effort with a named UI operational owner and institutional build participants shown below. Contact the operational owner for authorized access.",
    homeUnits: ["Office of Sponsored Programs (ORED)"],
    operationalOwners: [{ name: "Sarah Martonick" }],
    buildParticipants: ["IIDS"],
    status: "Prototype",
    visibility: "Partial",
    ai4raRelationship: "Core",
    dualDestinyPlanned: true,
    operationalFunction: "Embargoed.",
    operationalExcellenceOutcome: "Embargoed.",
  },
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
    status: "Production",
    visibility: "Public",
    ai4raRelationship: "Core",
    dualDestinyPlanned: true,
    externalDeployments: ["Southern Utah University"],
    repoUrl: "https://github.com/ui-insight/vandalizer",
    liveUrl: "https://vandalizer.uidaho.edu",
    funding: "NSF GRANTED Award #2427549",
    operationalFunction:
      "Document-heavy research administration work: RFA extraction, award/contract review, compliance filings. Structured extraction + workflow engine + citation-backed Q&A against document collections.",
    operationalExcellenceOutcome:
      "Staff time savings on document extraction. Higher extraction accuracy. Reusable extraction workflows. Citation-backed Q&A over RA document collections.",
    tech: ["React 19", "Python 3.11+", "FastAPI", "Docker"],
    relatedSlugs: ["embargoed-osp", "mindrouter", "dgx-stack", "processmapping"],
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
    status: "Prototype",
    visibility: "Public",
    ai4raRelationship: "Core",
    dualDestinyPlanned: true,
    repoUrl: "https://github.com/ui-insight/ProcessMapping",
    liveUrl: "https://processmapping.insight.uidaho.edu",
    operationalFunction:
      "Documents and analyzes RA processes: who does what, with which systems, using which inputs and outputs. Feeds requirements for OpenERA and similar tools. Surfaces coverage gaps between processes and current tooling.",
    operationalExcellenceOutcome:
      "Shared vocabulary and visibility for RA processes. Identifies process/tool coverage gaps. Requirements source for automation. Onboarding and training asset.",
    tech: ["React 19", "TypeScript", "Vite", "FastAPI", "Python 3.11+"],
    relatedSlugs: ["embargoed-osp", "vandalizer"],
  },

  // ============================================================
  // ORED + Office of General Counsel (dual home)
  // ============================================================
  {
    slug: "execord",
    name: "ExecOrd",
    tagline:
      "Executive Order compliance tracker (UI deployment embargoed).",
    description:
      "Compliance tracking prototype for federal Executive Order impacts on the institution. UI deployment details are embargoed.",
    homeUnits: ["Office of Research and Economic Development", "Office of General Counsel"],
    operationalOwners: [{ name: "Sarah Martonick" }],
    buildParticipants: ["IIDS"],
    status: "Prototype",
    visibility: "Internal-only",
    ai4raRelationship: "None",
    repoUrl: "https://github.com/ui-insight/ExecOrd",
    isPrivateRepo: true,
    operationalFunction:
      "Tracks federal Executive Orders, applicability to UI, required actions, deadlines, responsible parties, and current posture.",
    operationalExcellenceOutcome:
      "Systematic EO response posture. Reduces scramble when new EOs drop. Living view of EO-driven obligations for leadership.",
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
      "Platform for managing experiential learning and student engagement records. MVP covers organizations, events, attendance, dashboard metrics, and admin user lifecycle. Scaffolded from TEMPLATE-app following OpenERA patterns. This is an early example of AISPEG diffusing agentic-coding capability out of IIDS: SEM is co-building alongside IIDS, not just consuming.",
    homeUnits: ["Strategic Enrollment Management"],
    operationalOwners: [
      { name: "Dean Kahler", title: "Vice Provost of SEM" },
    ],
    buildParticipants: ["IIDS", "SEM"],
    status: "Prototype",
    visibility: "Internal-only",
    ai4raRelationship: "None",
    repoUrl: "https://github.com/ui-insight/SEM-experiential",
    operationalFunction:
      "Single record of student engagement: events, attendance, organizations. Foundation for verified experience transcripts.",
    operationalExcellenceOutcome:
      "Consolidates fragmented student engagement tracking. Supports recruitment/retention reporting. Demonstrates unit-led co-build pattern — a repeatable path for other UI units to develop their own AI-assisted tooling.",
    tags: ["diffusion"],
    relatedSlugs: ["template-app"],
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
    status: "Piloting",
    visibility: "Public",
    ai4raRelationship: "Adjacent",
    repoUrl: "https://github.com/ui-insight/RFD-career",
    operationalFunction:
      "Visualizes CAREER Club cohort and individual-participant progress against workbook rubric milestones.",
    operationalExcellenceOutcome:
      "Cohort visibility for program leaders. Data-driven program improvement. Stronger NSF CAREER-grant pipeline.",
    tech: ["React", "TypeScript", "Vite", "FastAPI"],
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
    status: "Production",
    visibility: "Public",
    ai4raRelationship: "Core",
    dualDestinyPlanned: true,
    repoUrl: "https://github.com/ui-insight/MindRouter",
    liveUrl: "https://mindrouter.ai",
    operationalFunction:
      "Shared institutional LLM inference substrate. Every AI app at UI routes through it. Fair-share scheduling, quotas, audit trail, on-prem compute, cost control.",
    operationalExcellenceOutcome:
      "Enables every downstream AI app at UI. Keeps data on-prem for compliance. Avoids per-seat vendor lock-in. Institutional audit trail. Fair access across research and operations workloads.",
    tech: ["Python 3.11+", "Docker", "Ollama", "vLLM", "Azure AD SSO"],
    relatedSlugs: ["dgx-stack", "audit-dashboard", "vandalizer", "ucm-daily-register"],
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
    status: "Production",
    visibility: "Public",
    ai4raRelationship: "Adjacent",
    externalDeployments: ["Southern Utah University"],
    repoUrl: "https://github.com/ui-insight/dgx-stack",
    operationalFunction:
      "On-prem LLM + OCR appliance. Serves as a backend node to MindRouter. Provides the OCR used by Audit Dashboard, Vandalizer, OpenERA. Supports air-gapped workloads.",
    operationalExcellenceOutcome:
      "On-prem AI compute without cloud recurring costs. Supports compliance-sensitive and air-gapped workloads. Backbone for institutional OCR and LLM serving.",
    tech: ["Docker", "vLLM", "NVIDIA Container Toolkit", "CUDA 13"],
    relatedSlugs: ["mindrouter", "audit-dashboard", "vandalizer"],
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
    status: "Production",
    visibility: "Public",
    institutionalReviewStatus: "Under OIT review",
    ai4raRelationship: "Adjacent",
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
      "embargoed-osp",
      "nexus",
    ],
  },

  // ============================================================
  // Tracked — not built by AISPEG / IIDS
  // ============================================================
  {
    slug: "oit-data-modernization",
    name: "OIT Data Modernization (Huron)",
    tagline: "Enterprise data modernization led by OIT with Huron consulting.",
    description:
      "OIT is leading an institutional data modernization effort in partnership with Huron Consulting. AISPEG is tracking this work as part of the AI interventions inventory; detailed information will be added as OIT shares scope, timelines, and integration points with existing AISPEG-coordinated work.",
    homeUnits: ["Office of Information Technology"],
    operationalOwners: [],
    buildParticipants: ["OIT", "Huron Consulting"],
    status: "Tracked",
    visibility: "Public",
    ai4raRelationship: "None",
    operationalFunction:
      "Enterprise data modernization scope to be confirmed.",
    operationalExcellenceOutcome:
      "Foundation for institutional reporting, analytics, and interoperability across enterprise systems.",
    trackingOnly: true,
  },
  {
    slug: "nexus",
    name: "Nexus",
    tagline:
      "OIT-managed application platform where UI application modules are deployed.",
    description:
      "React + FastAPI application platform running on OIT-managed secure infrastructure. Nexus is the institutional template where University of Idaho application modules are deployed, providing a shared, audited, and security-hardened runtime for AI-enabled and traditional unit-level apps. Complements TEMPLATE-app: where TEMPLATE-app is the development scaffold, Nexus is the production landing zone.",
    homeUnits: ["Office of Information Technology"],
    operationalOwners: [],
    buildParticipants: ["OIT"],
    status: "Production",
    visibility: "Public",
    ai4raRelationship: "None",
    tech: ["React", "FastAPI", "OIT managed infrastructure"],
    operationalFunction:
      "Hosts UI application modules on OIT-managed secure infrastructure with a consistent runtime, identity, and security baseline. Target deployment surface for new UI apps that need institutional hosting.",
    operationalExcellenceOutcome:
      "Standardizes where institutional application modules live. Shared security posture, audit trail, and operational footprint across UI units. Reduces per-app hosting overhead and fragmentation.",
    relatedSlugs: ["template-app"],
  },
];

// ============================================================
// Helpers
// ============================================================

export function getInterventionBySlug(slug: string): Intervention | undefined {
  return interventions.find((i) => i.slug === slug);
}

export function getRelatedInterventions(i: Intervention): Intervention[] {
  if (!i.relatedSlugs) return [];
  return i.relatedSlugs
    .map((slug) => getInterventionBySlug(slug))
    .filter((x): x is Intervention => x !== undefined);
}

export function getPubliclyVisible(): Intervention[] {
  return interventions.filter((i) => i.visibility !== "Internal-only");
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
  items: Intervention[]
): { unit: string; items: Intervention[] }[] {
  // An intervention is listed under its FIRST home unit for grouping.
  const groups = new Map<string, Intervention[]>();
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
