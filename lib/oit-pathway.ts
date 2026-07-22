// OIT builder pathway — typed representation of the OIT "AI for UI"
// governance documents as they apply to teams outside OIT deploying on
// OIT-managed infrastructure. Source documents live on the Azure DevOps
// Development wiki (links below); this module tracks the published
// drafts so /standards/oit-pathway can render the lifecycle, the rules,
// and where our projects sit — and so tsc catches drift when a stage or
// rule is renamed.
//
// Two tracks, two documents:
//   - Enterprise AI Development Framework — the TECH standards (approved
//     stack, two-zone hosted environment, APM 30.11 classification,
//     required pre-deploy artifacts). Tracked ask-by-ask in
//     lib/standards-watch.ts.
//   - AI-Assisted Builder Guide — the PROCESS for builders outside OIT
//     (six-stage lifecycle with gates, enterprise tooling from day one,
//     six binding rules). Modeled here.
//
// The hosted environment these documents describe is what the project
// inventory tracks as Nexus (lib/portfolio.ts, slug "nexus") — the
// OIT-managed application platform built collaboratively by OIT and
// IIDS. The wiki drafts describe the platform without using the name;
// this module makes the connection explicit so the pathway page can
// link the standards to the inventory entry.

export interface OitSourceDoc {
  title: string;
  href: string;
  updated: string; // ISO date of the wiki page's last update
  role: string; // one-line description of what this document governs
}

export const OIT_SOURCE_DOCS: OitSourceDoc[] = [
  {
    title: "Enterprise AI Development Framework",
    href: "https://dev.azure.com/uidaho/Development/_wiki/wikis/Development.wiki/19540/Enterprise-AI-Development-Framework",
    updated: "2026-06-10",
    role: "The technology standards: approved stack, two-zone hosted environment, APM 30.11 data classification, and the artifact set required before deployment.",
  },
  {
    title: "AI-Assisted Builder Guide",
    href: "https://dev.azure.com/uidaho/Development/_wiki/wikis/Development.wiki/19581/AI-Assisted-Builder-Guide",
    updated: "2026-05-20",
    role: "The process for builders outside OIT: a six-stage lifecycle with gates, enterprise tooling from day one, and six rules every in-scope application follows.",
  },
  {
    title: "AI Development (AI for UI)",
    href: "https://dev.azure.com/uidaho/Development/_wiki/wikis/Development.wiki/19582/AI-Development",
    updated: "2026-05-20",
    role: "The joint IIDS/OIT effort behind both documents, with the named delivery, security, IAM, infrastructure, and development contacts.",
  },
];

// ---- Six-stage lifecycle (AI-Assisted Builder Guide, May 2026) --------

export type StageLead = "Builder" | "Collaborative" | "OIT";

export interface PathwayStage {
  number: number;
  name: string;
  ledBy: StageLead;
  summary: string;
  // The gate or checkpoint that closes this stage, when the guide
  // defines one. Stages 2 and 6 carry a checkpoint / annual review
  // rather than a hard gate.
  gate?: string;
}

// Concrete operating decisions that make the still-evolving source process
// actionable. These are local IIDS/OIT milestones layered onto the published
// draft lifecycle; they do not imply that the source wiki has been revised.
export interface PathwayMilestone {
  id: string;
  stage: number;
  name: string;
  ledBy: StageLead;
  href?: string;
  summary: string;
  completeWhen: string[];
  boundary: string;
  openQuestions?: string[];
}

export const PATHWAY_STAGES: PathwayStage[] = [
  {
    number: 1,
    name: "Idea & Scoping",
    ledBy: "Builder",
    summary:
      "Problem statement, every data source identified, a named departmental sponsor, and an OIT intake request. Student, HR, or research data triggers a data classification review at this stage, not later.",
    gate: "OIT intake approval is required before any development begins.",
  },
  {
    number: 2,
    name: "Design & Build",
    ledBy: "Collaborative",
    summary:
      "Builders lead development and engage OIT at defined milestones: intake, a design check-in before significant investment, and a pre-review handoff. Enterprise tooling (university-licensed Claude or GitHub Copilot, GitHub Enterprise) from day one; synthetic or anonymized test data only. The OIT deployment repository is established in ui-AI4UI no later than the pre-review handoff.",
    gate: "Checkpoint: the repository-placement milestone, documentation, and a working demo are complete before requesting security review.",
  },
  {
    number: 3,
    name: "Security & Compliance Review",
    ledBy: "OIT",
    summary:
      "OIT Security reviews authentication (university SSO via Entra ID required), data storage and retention, all third-party and AI API calls, dependency vulnerabilities, and FERPA/HIPAA compliance. Automatic blockers include data outside OIT-approved infrastructure, standalone auth, personal or free-tier AI accounts, and missing ownership.",
    gate: "Hard gate — no bypass process. Remediation is required before re-review.",
  },
  {
    number: 4,
    name: "Staging & Testing",
    ledBy: "Collaborative",
    summary:
      "OIT DevOps provisions staging. Structured user testing, explicit failure-condition testing for AI components, accessibility verification, audit-logging confirmation, and enterprise-integration validation in staging — never in production first.",
    gate: "OIT DevOps and the OIT point of contact sign off on staging results before production deployment is scheduled.",
  },
  {
    number: 5,
    name: "Production Deployment",
    ledBy: "OIT",
    summary:
      "OIT DevOps deploys to production (Azure, OCI, or on-prem Kubernetes) and configures DNS, SSL, and SSO. Builders do not deploy to production directly. Named owner, runbook, and a documented decommission path must be on file before go-live.",
    gate: "Go-live: all gates cleared. The application is live, monitored, and registered in the university AI inventory.",
  },
  {
    number: 6,
    name: "Operate & Maintain",
    ledBy: "Collaborative",
    summary:
      "Builders notify OIT before changes (updates follow the same review process), keep enterprise licenses current, and own AI-vendor API deprecation remediation. OIT monitors infrastructure, patches the platform, and re-reviews sensitive applications annually.",
    gate: "Annual review: owner and OIT confirm compliance, ownership, and continued need.",
  },
];

export const PATHWAY_MILESTONES: PathwayMilestone[] = [
  {
    id: "oit-deployment-repository",
    stage: 2,
    name: "Establish the OIT deployment repository in ui-AI4UI",
    ledBy: "Collaborative",
    href: "https://github.com/ui-AI4UI",
    summary:
      "Once OIT-managed deployment is the accepted target, create the application's deployment repository in—or transfer it to—the ui-AI4UI GitHub organization. New projects should start there; existing projects complete the move no later than the Stage 2 pre-review handoff.",
    completeWhen: [
      "The deployment-bound repository exists under github.com/ui-AI4UI.",
      "Named builder and OIT collaborators can access the repository for review and handoff work.",
      "The repository URL is recorded in the project inventory and the OIT intake or handoff record.",
    ],
    boundary:
      "Repository placement records deployment intent and shared custody. It is not security approval, support acceptance, or authorization to deploy; Stages 3 through 5 still apply.",
    openQuestions: [
      "Whether ui-AI4UI is the authoritative application repository or a deployment repository when an upstream or open-source repository also exists.",
      "Which OIT and IIDS teams administer organization membership, repository creation, CODEOWNERS, and branch protections.",
      "Whether GitHub Actions, Azure Pipelines, or both provide the binding CI/CD and required checks.",
      "Who performs an existing-repository transfer and how issues, history, secrets, and external links are preserved.",
    ],
  },
];

// ---- Six rules for every in-scope application -------------------------

export interface PathwayRule {
  title: string;
  detail: string;
}

export const PATHWAY_RULES: PathwayRule[] = [
  {
    title: "Enterprise tooling from day one",
    detail:
      "University-licensed Claude or GitHub Copilot plus GitHub Enterprise, with university guardrails, from the first line of code. For OIT-bound applications, the deployment repository is placed in ui-AI4UI as the Stage 2 operating milestone. Personal accounts and free tiers are not permitted for in-scope projects.",
  },
  {
    title: "Data classification first",
    detail:
      "Any application touching student, employee, or research data requires a formal data classification review before development begins.",
  },
  {
    title: "AI inventory registration",
    detail:
      "All AI-generated or AI-assisted applications register in the university's AI application inventory, regardless of size or audience.",
  },
  {
    title: "Approved infrastructure only",
    detail:
      "Deployments use OIT-approved platforms: Azure, OCI, or on-prem Kubernetes. Personal cloud accounts and free-tier services are not permitted.",
  },
  {
    title: "University identity required",
    detail:
      "All applications authenticate through university SSO (Entra ID). Standalone username/password systems are not approved.",
  },
  {
    title: "Named ownership required",
    detail:
      "Every application has a named individual owner responsible for maintenance, updates, and decommissioning. A department name is not sufficient.",
  },
];

// ---- Scope triggers ----------------------------------------------------

// Any single trigger brings a project into the framework's scope.
export const IN_SCOPE_TRIGGERS: string[] = [
  "Deployed to OIT-managed infrastructure and used by students, faculty, or staff",
  "Integrates with university administrative systems (Banner, SSO, other institutional data sources)",
  "Handles data classified under university policy (FERPA, HIPAA, other regulated types)",
  "Requires OIT support, monitoring, or ongoing maintenance",
];

export const OUT_OF_SCOPE_EXAMPLES: string[] = [
  "Personal projects with no institutional deployment intent",
  "Open-source projects not hosted on OIT infrastructure (the guide's own examples: OpenERA, Vandalizer)",
  "Research tools used solely by the developing researcher",
  "Proof-of-concept experiments that will not seek enterprise deployment",
];

// ---- Projects entering the pathway ------------------------------------

export interface PathwayProject {
  slug: string; // portfolio slug — links to /portfolio/<slug>
  name: string;
  // Why this project is (or is about to be) in scope for the framework.
  scopeTrigger: string;
  // Where the project stands against the six stages today.
  position: string;
  // Facts the intake conversation starts from — what is already true
  // of the project. Kept factual; portfolio entries are the source.
  standingFacts: string[];
  // What the Stage 1 intake and Stage 3 security gate will examine.
  // Framed as the questions the pathway asks, not as asserted status.
  gateQuestions: string[];
}

export const PATHWAY_PROJECTS: PathwayProject[] = [
  {
    slug: "openera",
    name: "OpenERA",
    scopeTrigger:
      "The Builder Guide names OpenERA as an out-of-scope example while it runs open-source off OIT infrastructure. Pursuing deployment onto Nexus flips that: the project enters the framework at Stage 1, and the existing codebase is reviewed at the Stage 3 security gate.",
    position:
      "Entering Stage 1 — Idea & Scoping, targeting Nexus deployment. Existing code will be reviewed at the Stage 3 security gate per the guide's scope-change rule.",
    standingFacts: [
      "Built on FastAPI, React, TypeScript, SQLAlchemy 2.0, and PostgreSQL 16 — the core of the framework's approved stack",
      "Named UI implementation owner: Sarah Martonick (Office of Research and Economic Development)",
      "Currently staged on IIDS infrastructure at openera.insight.uidaho.edu",
      "AI4RA Core dual-destiny project (NSF GRANTED) — the open-source distribution remains out of the framework's scope",
    ],
    gateQuestions: [
      "Data classification under APM 30.11 — sponsored-research administration data spans multiple regulated types",
      "Authentication path to university SSO (Entra ID)",
      "Repository and CI/CD handoff — establish the OIT deployment repository in ui-AI4UI at Stage 2; define its relationship to the AI4RA upstream plus branch, workflow, and release controls",
      "Observability stack (OpenTelemetry, Prometheus, Jaeger, Splunk) and pre-deploy artifact set",
    ],
  },
  {
    slug: "ucm-daily-register",
    name: "UCM Daily Register",
    scopeTrigger:
      "Seeking deployment onto Nexus for daily use by University Communications and Marketing staff — OIT-managed infrastructure used by staff is the framework's first scope trigger.",
    position: "Entering Stage 1 — Idea & Scoping, targeting Nexus deployment.",
    standingFacts: [
      "Built on React, FastAPI, and SQLAlchemy 2.0, with AI editing routed through MindRouter — aligned with the framework's approved stack and its named gateway candidate",
      "Named operational owners: Joy Bauer, Leigh Cooper, and Jodi Walker (University Communications and Marketing)",
      "Currently staged on IIDS infrastructure at ucmnews.insight.uidaho.edu",
    ],
    gateQuestions: [
      "Data classification under APM 30.11 — editorial submissions are institutional content; classification review will confirm the tier",
      "Authentication path to university SSO (Entra ID)",
      "AI API posture — MindRouter is on-prem and named in the framework's stack table; the approved-models list is still TBD",
      "Repository and CI/CD handoff — establish the OIT deployment repository in ui-AI4UI by the Stage 2 pre-review handoff; define branch, workflow, and release controls",
      "Named individual owner for the Stage 5 go-live requirement (runbook and decommission path on file)",
    ],
  },
];
