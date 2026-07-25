// lib/oit-ea-portfolio.ts
//
// OIT's FY2027 Enterprise Applications project portfolio, modeled in
// OIT's own tracking structure, plus a crosswalk to lib/portfolio.ts.
//
// Source: "FY2027 EA Projects and Priorities.xlsx", shared by OIT in
// July 2026 — 61 rows across five work categories. This module is a
// point-in-time transcription, not a live feed: OIT maintains the
// spreadsheet, and there is no API to sync from. Re-transcribe when OIT
// shares a newer cut and update `SOURCE_AS_OF`.
//
// Why model their structure rather than fold their rows into ours:
// OIT tracks commitment (priority, owning team, TPM, effort by
// discipline), while lib/portfolio.ts tracks product lifecycle (status,
// deployment target, replacement economics). Neither vocabulary
// subsumes the other. Keeping OIT's columns intact means the crosswalk
// stays honest about which facts came from whom — and `portfolioSlug`
// is the single seam between the two inventories, checked by
// `npm run verify:portfolio`.
//
// Transcription rules applied (source fidelity preserved in
// `sourceName` wherever the display name was cleaned):
//   - Team labels normalized: "Product Mgmt"/"Product Management" →
//     "Product Management"; "Endpoint Mgmt" → "Endpoint Management".
//   - Category "Operstions" (row 45) read as "Operations".
//   - Effort "low" (row 43) read as "Low".
//   - Blank and whitespace-only effort cells become `undefined` — OIT
//     leaves a discipline blank when it contributes no effort. That is
//     distinct from the explicit "Unknown" they record when the effort
//     is real but unsized.
//   - Three source typos corrected for display ("PageUP", "oboarding",
//     "Mananger"); the source spelling is retained in `sourceName`.

/** The cut of OIT's spreadsheet this module transcribes. */
export const SOURCE_AS_OF = "2026-07-25";

/** OIT's fiscal-year label for this portfolio (UI FY runs Jul 1 – Jun 30). */
export const SOURCE_FISCAL_YEAR = "FY2027";

// ---- OIT's tracking dimensions ---------------------------------------

/** OIT's "Priority" column. */
export type OitPriority = "Critical" | "High" | "Medium" | "Low";

/** OIT's "Category" column — the kind of work, not its subject matter. */
export type OitWorkCategory =
  | "Project"
  | "Operations"
  | "Ongoing Initiative"
  | "Infrastructure"
  | "Administrative";

/** OIT's "Primary Team" column. */
export type OitTeam =
  | "Systems"
  | "Development"
  | "Enterprise Applications"
  | "Application Administration"
  | "Product Management"
  | "Endpoint Management";

/**
 * OIT's effort scale. "Unknown" is a value they record deliberately —
 * effort exists but has not been sized. A discipline that contributes
 * nothing is left blank in the sheet and `undefined` here.
 */
export type OitEffort = "High" | "Medium" | "Low" | "Unknown";

/**
 * OIT sizes each project against four disciplines rather than one
 * aggregate estimate — the four columns are the load each team carries.
 */
export interface OitEffortProfile {
  /** "TPM/Manager Effort" — coordination and product-management load. */
  tpmManager?: OitEffort;
  /** "Dev Effort" — application development load. */
  development?: OitEffort;
  /** "Admin Effort" — application-administration load. */
  administration?: OitEffort;
  /** "Systems Effort" — infrastructure and systems-engineering load. */
  systems?: OitEffort;
}

/** How firmly a row maps to a lib/portfolio.ts entry. */
export type CrosswalkConfidence =
  /** The two inventories describe the same effort; no open question. */
  | "confirmed"
  /** Strong evidence on both sides, one unresolved detail noted. */
  | "probable"
  /** Plausible on subject matter alone; needs OIT confirmation. */
  | "candidate";

/**
 * A row of OIT's portfolio that lands on a surface this site already
 * maintains without being a project in our inventory — OIT's governance
 * and data-standards work, mostly.
 */
export interface RelatedSurface {
  label: string;
  href: string;
  note: string;
}

export interface OitEaProject {
  /** Stable kebab id derived from the project name. */
  id: string;
  /** Display name. */
  name: string;
  /** Verbatim source spelling, when it differs from `name`. */
  sourceName?: string;
  priority: OitPriority;
  category: OitWorkCategory;
  primaryTeam: OitTeam;
  /**
   * OIT's "TPM or Manager (Primary)". Usually a named person; OIT
   * records a team name where no individual is assigned.
   */
  tpmOrManager: string;
  effort: OitEffortProfile;
  /** OIT's "Notes" column — mostly completion targets. */
  notes?: string;

  /** Matching lib/portfolio.ts slug, where the same effort appears in both. */
  portfolioSlug?: string;
  crosswalkConfidence?: CrosswalkConfidence;
  /** What supports the match, and what is still open. Required with a slug. */
  crosswalkNote?: string;

  /** A site surface this row touches without being a portfolio project. */
  relatedSurface?: RelatedSurface;
}

// ---- The portfolio ---------------------------------------------------

export const OIT_EA_PROJECTS: readonly OitEaProject[] = [
  // --- Category: Project --------------------------------------------
  {
    id: "nutanix-kubernetes-platform",
    name: "Nutanix Kubernetes Platform",
    priority: "Critical",
    category: "Project",
    primaryTeam: "Systems",
    tpmOrManager: "Ben Kirchmeier",
    effort: { systems: "Medium" },
  },
  {
    id: "pageup-deployment",
    name: "PageUp deployment",
    sourceName: "PageUP deployment",
    priority: "Critical",
    category: "Project",
    primaryTeam: "Development",
    tpmOrManager: "Business Systems",
    effort: { development: "High", administration: "Low" },
  },
  {
    id: "data-governance-enablement",
    name: "Data Governance Enablement",
    priority: "Critical",
    category: "Project",
    primaryTeam: "Enterprise Applications",
    tpmOrManager: "Kali Armitage",
    effort: { tpmManager: "High", administration: "Low" },
    relatedSurface: {
      label: "Data Model",
      href: "/standards/data-model",
      note: "The AI4RA Unified Data Model catalog and controlled vocabularies this site tracks are the data-standards layer OIT's enablement work governs.",
    },
  },
  {
    id: "databricks-platform-deployment",
    name: "Databricks Platform Deployment",
    priority: "Critical",
    category: "Project",
    primaryTeam: "Application Administration",
    tpmOrManager: "Randy Wood",
    effort: {
      tpmManager: "High",
      development: "High",
      administration: "High",
      systems: "High",
    },
    portfolioSlug: "data-infrastructure-pilot",
    crosswalkConfidence: "candidate",
    crosswalkNote:
      "Both efforts stand up a lakehouse for institutional data. Whether the Data Infrastructure Pilot is meant to land on OIT's Databricks platform, or is a parallel IIDS track, has not been confirmed with OIT.",
  },
  {
    id: "nacubo-dashboards-data-architecture",
    name: "NACUBO Dashboards Data Architecture and Pipelines",
    priority: "Critical",
    category: "Project",
    primaryTeam: "Enterprise Applications",
    tpmOrManager: "Kali Armitage",
    effort: { tpmManager: "High", development: "High", administration: "Low" },
  },
  {
    id: "inbox-idaho",
    name: "Inbox Idaho",
    priority: "Critical",
    category: "Project",
    primaryTeam: "Development",
    tpmOrManager: "Trevor Humble",
    effort: { tpmManager: "High", development: "High", administration: "High" },
  },
  {
    id: "veras-replacement",
    name: "VERAS Replacement",
    priority: "Critical",
    category: "Project",
    primaryTeam: "Enterprise Applications",
    tpmOrManager: "Trevor Humble",
    effort: {
      tpmManager: "Medium",
      development: "Medium",
      administration: "Low",
      systems: "Low",
    },
    portfolioSlug: "openera",
    crosswalkConfidence: "probable",
    crosswalkNote:
      "OpenERA declares VERAS as the enterprise system it replaces ($150k/yr, renewal March 2027), and OIT carries VERAS replacement as a Critical FY27 commitment. Open question: whether OIT's row denotes OpenERA itself or the Nexus sponsored-programs module — these are separate efforts and should not be conflated.",
  },
  {
    id: "nexus",
    name: "Nexus",
    priority: "Critical",
    category: "Project",
    primaryTeam: "Enterprise Applications",
    tpmOrManager: "Trevor Humble",
    effort: {
      tpmManager: "Medium",
      development: "Medium",
      administration: "Low",
      systems: "Low",
    },
    portfolioSlug: "nexus",
    crosswalkConfidence: "confirmed",
    crosswalkNote:
      "The same platform on both sides: OIT's Enterprise Applications team owns delivery; our inventory tracks it as the OIT-managed landing zone where UI application modules deploy.",
  },
  {
    id: "ai-development-decision-framework",
    name: "AI Development Decision Framework",
    priority: "Critical",
    category: "Project",
    primaryTeam: "Enterprise Applications",
    tpmOrManager: "Kali Armitage",
    effort: { tpmManager: "Medium" },
    relatedSurface: {
      label: "OIT Pathway",
      href: "/standards/oit-pathway",
      note: "The Enterprise AI Development Framework and AI-Assisted Builder Guide tracked on that page are the decision framework this row funds.",
    },
  },
  {
    id: "edabroad-platform-assessment",
    name: "EdAbroad Platform Assessment",
    priority: "Critical",
    category: "Project",
    primaryTeam: "Product Management",
    tpmOrManager: "Trevor Humble",
    effort: { tpmManager: "High" },
  },
  {
    id: "endpoint-toolbox",
    name: "Endpoint Toolbox",
    priority: "High",
    category: "Project",
    primaryTeam: "Systems",
    tpmOrManager: "Ben Kirchmeier",
    effort: { systems: "High" },
  },
  {
    id: "palo-alto-network-security-gateways",
    name: "Palo Alto Network Security and Application Gateways",
    priority: "High",
    category: "Project",
    primaryTeam: "Systems",
    tpmOrManager: "Ben Kirchmeier",
    effort: { systems: "High" },
  },
  {
    id: "replace-promax-servers",
    name: "Replace ProMax Servers with SNS Servers",
    priority: "High",
    category: "Project",
    primaryTeam: "Product Management",
    tpmOrManager: "Kariann Owens",
    effort: {
      tpmManager: "Low",
      development: "Low",
      administration: "Low",
      systems: "Medium",
    },
    notes: "Completion target September 2026",
  },
  {
    id: "dotnet-application-upgrades",
    name: ".Net Application Upgrades",
    priority: "High",
    category: "Project",
    primaryTeam: "Development",
    tpmOrManager: "Randi Croyle",
    effort: { development: "Medium" },
  },
  {
    id: "softdocs-admin-department-level-security",
    name: "Softdocs - Admin - Department Level Security",
    priority: "High",
    category: "Project",
    primaryTeam: "Application Administration",
    tpmOrManager: "Skye Swoboda-Colberg",
    effort: { tpmManager: "Medium", administration: "Medium" },
  },
  {
    id: "softdocs-ar-title-iv-forms",
    name: "Softdocs - AR - Title IV Forms and Integration",
    priority: "High",
    category: "Project",
    primaryTeam: "Development",
    tpmOrManager: "Skye Swoboda-Colberg",
    effort: { tpmManager: "High", development: "High", administration: "Medium" },
  },
  {
    id: "softdocs-hr-performance-evaluation",
    name: "Softdocs - HR - Performance Evaluation Enhancements",
    priority: "High",
    category: "Project",
    primaryTeam: "Development",
    tpmOrManager: "Skye Swoboda-Colberg",
    effort: { tpmManager: "Low", development: "Medium", administration: "Low" },
  },
  {
    id: "softdocs-hr-annual-contract",
    name: "Softdocs - HR - Annual Contract Enhancements",
    priority: "High",
    category: "Project",
    primaryTeam: "Development",
    tpmOrManager: "Skye Swoboda-Colberg",
    effort: { tpmManager: "Low", development: "Medium", administration: "Low" },
  },
  {
    id: "softdocs-prov-faculty-performance-evaluation",
    name: "Softdocs - PROV - Faculty Performance Evaluation",
    priority: "High",
    category: "Project",
    primaryTeam: "Development",
    tpmOrManager: "Skye Swoboda-Colberg",
    effort: { tpmManager: "Low", development: "Medium", administration: "Low" },
  },
  {
    id: "softdocs-prov-annual-contract",
    name: "Softdocs - PROV - Annual Contract Enhancements",
    priority: "High",
    category: "Project",
    primaryTeam: "Development",
    tpmOrManager: "Skye Swoboda-Colberg",
    effort: { tpmManager: "Low", development: "Medium", administration: "Low" },
  },
  {
    id: "sunapsis-to-banner-feed",
    name: "Sunapsis to Banner Feed",
    priority: "High",
    category: "Project",
    primaryTeam: "Development",
    tpmOrManager: "Trevor Humble",
    effort: { tpmManager: "Medium", development: "High", administration: "Medium" },
  },
  {
    id: "replace-ucm-print-online",
    name: "Replace UCM Print Online",
    priority: "Low",
    category: "Project",
    primaryTeam: "Product Management",
    tpmOrManager: "Kariann Owens",
    effort: {
      tpmManager: "High",
      development: "Low",
      administration: "Medium",
      systems: "Medium",
    },
    notes: "Completion target December 2027",
  },
  {
    id: "service-desk-phase-2",
    name: "Service Desk Phase 2",
    priority: "Low",
    category: "Project",
    primaryTeam: "Application Administration",
    tpmOrManager: "Randy Wood",
    effort: { tpmManager: "Low", administration: "Low" },
  },
  {
    id: "idaho-rise-ado-onboarding",
    name: "Idaho Rise ADO onboarding and infrastructure migration",
    sourceName: "Idaho Rise ADO oboarding and infrastructure migration",
    priority: "Low",
    category: "Project",
    primaryTeam: "Application Administration",
    tpmOrManager: "Randy Wood",
    effort: { administration: "Low", systems: "Low" },
  },
  {
    id: "bcdr",
    name: "BCDR",
    priority: "Medium",
    category: "Project",
    primaryTeam: "Systems",
    tpmOrManager: "Ben Kirchmeier",
    effort: { administration: "Medium", systems: "Medium" },
  },
  {
    id: "jaggaer-pay-implementation",
    name: "Jaggaer Pay implementation",
    priority: "Medium",
    category: "Project",
    primaryTeam: "Development",
    tpmOrManager: "Business Systems",
    effort: { development: "Low", administration: "Medium" },
  },
  {
    id: "service-portal-redesign",
    name: "Service Portal Redesign",
    priority: "Medium",
    category: "Project",
    primaryTeam: "Product Management",
    tpmOrManager: "Chryss Crotser",
    effort: { tpmManager: "Medium", administration: "Low" },
  },
  {
    id: "status-page",
    name: "Status Page",
    priority: "Medium",
    category: "Project",
    primaryTeam: "Application Administration",
    tpmOrManager: "Randy Wood",
    effort: { tpmManager: "Low", administration: "Medium" },
  },
  {
    id: "oke-observability",
    name: "OKE Observability",
    priority: "Medium",
    category: "Project",
    primaryTeam: "Application Administration",
    tpmOrManager: "Randy Wood",
    effort: {
      development: "Unknown",
      administration: "Medium",
      systems: "Medium",
    },
  },
  {
    id: "softdocs-hr-image-only-import",
    name: "Softdocs - HR - Image Only Import",
    priority: "Medium",
    category: "Project",
    primaryTeam: "Application Administration",
    tpmOrManager: "Skye Swoboda-Colberg",
    effort: { tpmManager: "Low", administration: "Medium" },
  },
  {
    id: "softdocs-admin-name-change-handling",
    name: "Softdocs - Admin - Name Change handling",
    priority: "Medium",
    category: "Project",
    primaryTeam: "Application Administration",
    tpmOrManager: "Skye Swoboda-Colberg",
    effort: { tpmManager: "Medium", administration: "Medium" },
  },
  {
    id: "softdocs-reg-form-development",
    name: "Softdocs - REG - Form Development",
    priority: "Medium",
    category: "Project",
    primaryTeam: "Application Administration",
    tpmOrManager: "Skye Swoboda-Colberg",
    effort: { tpmManager: "Medium", administration: "Medium" },
  },
  {
    id: "softdocs-ap-related-pcard-forms",
    name: "Softdocs - AP - Related Pcard Forms",
    priority: "Medium",
    category: "Project",
    primaryTeam: "Development",
    tpmOrManager: "Skye Swoboda-Colberg",
    effort: { tpmManager: "Medium", development: "Low", administration: "Low" },
  },
  {
    id: "softdocs-hr-staff-salary-change-permanent",
    name: "Softdocs - HR - Staff Salary Change (Permanent)",
    priority: "Medium",
    category: "Project",
    primaryTeam: "Development",
    tpmOrManager: "Skye Swoboda-Colberg",
    effort: { tpmManager: "Medium", development: "Medium", administration: "Low" },
  },
  {
    id: "softdocs-hr-staff-salary-change-temporary",
    name: "Softdocs - HR - Staff Salary Change (Temporary)",
    priority: "Medium",
    category: "Project",
    primaryTeam: "Development",
    tpmOrManager: "Skye Swoboda-Colberg",
    effort: { tpmManager: "Medium", development: "Medium", administration: "Low" },
  },
  {
    id: "softdocs-prov-faculty-summer-contract-2027",
    name: "Softdocs - PROV - Faculty Summer Contract 2027",
    priority: "Medium",
    category: "Project",
    primaryTeam: "Development",
    tpmOrManager: "Skye Swoboda-Colberg",
    effort: { tpmManager: "High", development: "High" },
  },
  {
    id: "softdocs-rotc-form-commissioning",
    name: "Softdocs - ROTC - Form Commissioning",
    priority: "Medium",
    category: "Project",
    primaryTeam: "Development",
    tpmOrManager: "Skye Swoboda-Colberg",
    effort: { tpmManager: "Medium", development: "Low", administration: "Low" },
  },
  {
    id: "data-interns-governance-project",
    name: "Data Interns Governance Project",
    priority: "Medium",
    category: "Project",
    primaryTeam: "Product Management",
    tpmOrManager: "Trevor Humble",
    effort: { tpmManager: "Medium", administration: "Low" },
    relatedSurface: {
      label: "Data Model",
      href: "/standards/data-model",
      note: "Data-governance capacity work adjacent to the UDM catalog and controlled vocabularies tracked here.",
    },
  },
  {
    id: "disability-resurvey-form",
    name: "Disability Resurvey Form",
    priority: "Medium",
    category: "Project",
    primaryTeam: "Product Management",
    tpmOrManager: "Skye Swoboda-Colberg",
    effort: { tpmManager: "Medium" },
  },
  {
    id: "myui-app",
    name: "MyUI App",
    priority: "Medium",
    category: "Project",
    primaryTeam: "Application Administration",
    tpmOrManager: "Trevor Humble",
    effort: { tpmManager: "Medium", administration: "High" },
    notes: "Q3 and Q4 project",
    relatedSurface: {
      label: "Op Excellence Survey",
      href: "/standards/operational-excellence",
      note: "A real MyUI mobile app was one of the most-requested items in the student survey.",
    },
  },
  {
    id: "myui-custom-card-resurvey",
    name: "MyUI Custom Card Resurvey",
    priority: "Medium",
    category: "Project",
    primaryTeam: "Product Management",
    tpmOrManager: "Trevor Humble",
    effort: { tpmManager: "High", development: "High", administration: "Medium" },
    notes: "Q3 and Q4 project",
  },
  {
    id: "cnr-ticketing-app",
    name: "CNR Ticketing App",
    priority: "Medium",
    category: "Project",
    primaryTeam: "Product Management",
    tpmOrManager: "Chryss Crotser",
    effort: {
      tpmManager: "Medium",
      development: "Low",
      administration: "Low",
      systems: "Low",
    },
  },
  {
    id: "student-accounts-kb",
    name: "Student Accounts KB",
    priority: "Medium",
    category: "Project",
    primaryTeam: "Product Management",
    tpmOrManager: "Chryss Crotser",
    effort: {
      tpmManager: "Medium",
      development: "Low",
      administration: "Low",
      systems: "Low",
    },
  },

  // --- Category: Operations -----------------------------------------
  {
    id: "certificate-lifecycle-and-service-migration",
    name: "Certificate Lifecycle and Service Migration",
    priority: "High",
    category: "Operations",
    primaryTeam: "Systems",
    tpmOrManager: "Ben Kirchmeier",
    effort: { systems: "High" },
  },
  {
    id: "student-computing-labs-upgrades",
    name: "Student Computing Labs Software Upgrades and Reimaging",
    priority: "High",
    category: "Operations",
    primaryTeam: "Endpoint Management",
    tpmOrManager: "Ben Kirchmeier",
    effort: { systems: "Medium" },
  },
  {
    id: "uidaho-takeover-vercel",
    name: "UIdaho takeover Vercel",
    priority: "High",
    category: "Operations",
    primaryTeam: "Application Administration",
    tpmOrManager: "Kariann Owens",
    effort: {
      tpmManager: "Medium",
      development: "Low",
      administration: "High",
      systems: "Low",
    },
    notes: "Completion target (needed immediately)",
  },
  {
    id: "ucm-product-manager-team",
    name: 'UCM Product Manager "Team"',
    sourceName: 'UCM Product Mananger "Team"',
    priority: "High",
    category: "Operations",
    primaryTeam: "Product Management",
    tpmOrManager: "Kariann Owens",
    effort: {
      tpmManager: "High",
      development: "Medium",
      administration: "Low",
      systems: "Low",
    },
    notes: "Completion target September 2026",
  },
  {
    id: "q3-banner-upgrade",
    name: "Q3 Banner Upgrade",
    priority: "High",
    category: "Operations",
    primaryTeam: "Application Administration",
    tpmOrManager: "Randy Wood",
    effort: { development: "Low", administration: "High" },
  },
  {
    id: "nagios-upgrades-and-sso",
    name: "Nagios Upgrades and SSO",
    priority: "Low",
    category: "Operations",
    primaryTeam: "Systems",
    tpmOrManager: "Ben Kirchmeier",
    effort: { development: "Unknown", systems: "Low" },
  },
  {
    id: "sql-server-upgrade-and-migration",
    name: "SQL Server Upgrade and Migration",
    priority: "Low",
    category: "Operations",
    primaryTeam: "Application Administration",
    tpmOrManager: "Randy Wood",
    effort: { administration: "Low", systems: "Low" },
  },
  {
    id: "integrating-systems-into-azdo",
    name: "Integrating Systems into AzDO and Tortoise Sprints",
    priority: "Medium",
    category: "Operations",
    primaryTeam: "Systems",
    tpmOrManager: "Ben Kirchmeier",
    effort: { systems: "Medium" },
  },
  {
    id: "terraform-for-manual-processes",
    name: "Terraform for Manual Processes - Endpoints and Servers",
    priority: "Medium",
    category: "Operations",
    primaryTeam: "Systems",
    tpmOrManager: "Ben Kirchmeier",
    effort: { systems: "High" },
  },
  {
    id: "admin-remodel-and-server-moves",
    name: "Admin Remodel and Server Moves",
    priority: "Medium",
    category: "Operations",
    primaryTeam: "Systems",
    tpmOrManager: "Ben Kirchmeier",
    effort: { systems: "Medium" },
  },
  {
    id: "uidaho-takeover-sitecore-deployments",
    name: "UIdaho takeover Sitecore Deployments",
    priority: "Medium",
    category: "Operations",
    primaryTeam: "Application Administration",
    tpmOrManager: "Kariann Owens",
    effort: {
      tpmManager: "High",
      development: "High",
      administration: "Low",
      systems: "Low",
    },
    notes: "Completion target Summer 2027",
  },

  // --- Category: Ongoing Initiative ---------------------------------
  {
    id: "ui-ux-design-student-partnership",
    name: "UI/UX Design Student Partnership",
    priority: "Low",
    category: "Ongoing Initiative",
    primaryTeam: "Product Management",
    tpmOrManager: "Trevor Humble",
    effort: { tpmManager: "High" },
    notes: "Fall semester 2026",
  },
  {
    id: "itsm-steering-committee",
    name: "ITSM Steering Committee",
    priority: "Medium",
    category: "Ongoing Initiative",
    primaryTeam: "Product Management",
    tpmOrManager: "Chryss Crotser",
    effort: { administration: "High" },
  },
  {
    id: "dev-architecture-review",
    name: "Dev Architecture Review",
    priority: "Medium",
    category: "Ongoing Initiative",
    primaryTeam: "Development",
    tpmOrManager: "Randi Croyle",
    effort: { development: "Medium" },
  },
  {
    id: "ear-process",
    name: "EAR process",
    priority: "Medium",
    category: "Ongoing Initiative",
    primaryTeam: "Development",
    tpmOrManager: "Randi Croyle",
    effort: { development: "Low" },
  },
  {
    id: "operational-excellence-cop",
    name: "Operational Excellence CoP",
    priority: "Medium",
    category: "Ongoing Initiative",
    primaryTeam: "Product Management",
    tpmOrManager: "Kali Armitage",
    effort: { tpmManager: "Medium" },
    relatedSurface: {
      label: "Op Excellence Survey",
      href: "/standards/operational-excellence",
      note: "The community of practice this row funds is the standing home for the operational-excellence survey findings tracked here.",
    },
  },

  // --- Category: Infrastructure -------------------------------------
  {
    id: "whole-room-ups-deployment",
    name: "Whole-room UPS Deployment - Library and Admin",
    priority: "Medium",
    category: "Infrastructure",
    primaryTeam: "Systems",
    tpmOrManager: "Ben Kirchmeier",
    effort: { systems: "Low" },
  },

  // --- Category: Administrative -------------------------------------
  {
    id: "pluralsight-licensing-and-onboarding",
    name: "Pluralsight Licensing and Onboarding with SSO",
    priority: "Low",
    category: "Administrative",
    primaryTeam: "Systems",
    tpmOrManager: "Ben Kirchmeier",
    effort: { systems: "Low" },
  },
] as const;

// ---- Ordering + labels -----------------------------------------------

/** Highest commitment first — the order OIT's priority column implies. */
export const OIT_PRIORITY_ORDER: readonly OitPriority[] = [
  "Critical",
  "High",
  "Medium",
  "Low",
] as const;

export const OIT_CATEGORY_ORDER: readonly OitWorkCategory[] = [
  "Project",
  "Operations",
  "Ongoing Initiative",
  "Infrastructure",
  "Administrative",
] as const;

export const OIT_EFFORT_ORDER: readonly OitEffort[] = [
  "High",
  "Medium",
  "Low",
  "Unknown",
] as const;

/** The four effort disciplines, in OIT's column order. */
export const OIT_EFFORT_DISCIPLINES = [
  { key: "tpmManager", label: "TPM / Manager" },
  { key: "development", label: "Development" },
  { key: "administration", label: "Administration" },
  { key: "systems", label: "Systems" },
] as const satisfies readonly {
  key: keyof OitEffortProfile;
  label: string;
}[];

export const CROSSWALK_CONFIDENCE_LABELS: Record<CrosswalkConfidence, string> = {
  confirmed: "Confirmed match",
  probable: "Probable match",
  candidate: "Candidate match",
};

// ---- Lookups ---------------------------------------------------------

/** Every row that crosswalks to a portfolio entry. */
export function crosswalkedProjects(): OitEaProject[] {
  return OIT_EA_PROJECTS.filter((p) => p.portfolioSlug !== undefined);
}

/** OIT's row for a portfolio slug, when one exists. */
export function oitProjectForSlug(slug: string): OitEaProject | null {
  return OIT_EA_PROJECTS.find((p) => p.portfolioSlug === slug) ?? null;
}

/** Every row that touches a site surface without being a portfolio project. */
export function surfaceLinkedProjects(): OitEaProject[] {
  return OIT_EA_PROJECTS.filter(
    (p) => p.relatedSurface !== undefined && p.portfolioSlug === undefined,
  );
}

export function projectsByPriority(priority: OitPriority): OitEaProject[] {
  return OIT_EA_PROJECTS.filter((p) => p.priority === priority);
}

export function projectsByCategory(category: OitWorkCategory): OitEaProject[] {
  return OIT_EA_PROJECTS.filter((p) => p.category === category);
}

/** Row counts per priority, in `OIT_PRIORITY_ORDER`. */
export function priorityCounts(): { priority: OitPriority; count: number }[] {
  return OIT_PRIORITY_ORDER.map((priority) => ({
    priority,
    count: projectsByPriority(priority).length,
  }));
}

/** Row counts per owning team, busiest first. */
export function teamCounts(): { team: OitTeam; count: number }[] {
  const counts = new Map<OitTeam, number>();
  for (const p of OIT_EA_PROJECTS) {
    counts.set(p.primaryTeam, (counts.get(p.primaryTeam) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([team, count]) => ({ team, count }))
    .sort((a, b) => b.count - a.count || a.team.localeCompare(b.team));
}

/**
 * How many rows draw High effort from each discipline — the closest
 * thing OIT's structure gives to a capacity signal.
 */
export function highEffortCounts(): {
  key: keyof OitEffortProfile;
  label: string;
  count: number;
}[] {
  return OIT_EFFORT_DISCIPLINES.map(({ key, label }) => ({
    key,
    label,
    count: OIT_EA_PROJECTS.filter((p) => p.effort[key] === "High").length,
  }));
}
