// ============================================================
// Governance Profile — Intake Crosswalk data model
// ============================================================
// Maps each AI project in the inventory onto the fields the University's
// Unified Technology Request captures, so the Chief AI and Data Science
// Officer's office can read our work in the vocabulary of its own intake
// process:
//   business need · buy-vs-build track · data touched + classification ·
//   AI involvement · integrations · funding · owners · ROI.
//
// Reference: the office's intake process —
// https://bhunter-uidaho.github.io/UnifiedTechnologyRequest/
//
// Two layers:
//   1. DERIVED — computed from the existing portfolio entry (owners,
//      build type, intake track, integrations, funding, strategic
//      alignment). No new source of truth; portfolio.ts stays canonical.
//   2. OVERRIDE — `governanceOverrides`, a sparse per-slug record for
//      the intake-only fields that aren't in the portfolio entry. Data
//      classification and ROI are governance *decisions* the office
//      makes, so they ship empty and render "pending" until curated.
//      `dataDomains` (a factual "what data it touches" list) is seeded
//      from each project's description.
// ============================================================

import {
  type Project,
  type ProjectStatus,
  type PublicStage,
  projects,
  getProjectBySlug,
  computePublicStage,
} from "./portfolio";
import { projects as governanceCatalog } from "./governance/catalog";
import type { RoiAssessment } from "./roi-rubric";

// ---- Intake vocabulary (mirrors the Unified Technology Request) -------

export type BuildType = "built-in-house" | "bought" | "hybrid";

// Fast Lane / Track A / B / C from the request routing, plus `external`
// for work tracked in the inventory that predates (or sits outside) the
// IIDS build pipeline.
export type IntakeTrack =
  | "fast-lane"
  | "track-a"
  | "track-b"
  | "track-c"
  | "external";

// Provisional — reconcile with APM 30.11 data classification when the
// office confirms its tiers. Ships unused (classification is pending).
export type DataClassification = "public" | "internal" | "sensitive" | "high-risk";

// The office's AI-risk split: routine use vs. material institutional or
// reputational exposure. A governance decision — ships unused.
export type AiRiskTier = "standard" | "elevated" | "material-exposure";

export interface GovernanceOverride {
  buildType?: BuildType;
  intakeTrack?: IntakeTrack;
  /** Plain-language "what data it touches". Factual; seeded below. */
  dataDomains?: string[];
  /** Governance decision — leave empty until the office classifies. */
  dataClassification?: DataClassification;
  /** Governance decision — leave empty until the office reviews. */
  aiRiskTier?: AiRiskTier;
  /** Override the integrations derived from `relatedSlugs`. */
  integrations?: string[];
  /** Override the funding derived from the portfolio `funding` field. */
  fundingSource?: string;
  /** Pending the CADSO ROI rubric. See lib/roi-rubric.ts. */
  roi?: RoiAssessment;
}

// ---- Manual overlay, keyed by portfolio slug --------------------------
// Sparse by design. `dataDomains` is seeded (factual). classification,
// aiRiskTier, and roi are intentionally omitted — they are the office's
// calls and render as "pending" until curated here.
export const governanceOverrides: Record<string, GovernanceOverride> = {
  stratplan: {
    dataDomains: ["Strategic-plan tactics", "Per-unit alignment declarations"],
  },
  "audit-dashboard": {
    dataDomains: [
      "Internal audit observations",
      "Corrective-action items",
      "Responsible-party assignments",
      "Audit report PDFs",
    ],
  },
  "ucm-daily-register": {
    dataDomains: ["Editorial submissions", "Newsletter content", "AP/UI style rules"],
  },
  vandalizer: {
    dataDomains: [
      "Research-admin documents (RFAs, awards, contracts)",
      "Extracted structured fields",
      "Compliance filings",
    ],
  },
  processmapping: {
    dataDomains: ["Research-admin process maps", "Interview transcripts", "Workflow definitions"],
  },
  openera: {
    dataDomains: [
      "Sponsored-research proposals",
      "Awards",
      "Compliance records",
      "Reporting data",
    ],
  },
  execord: {
    dataDomains: [
      "Federal Executive Orders",
      "Applicability assessments",
      "Required-action deadlines",
    ],
  },
  "sem-experiential": {
    dataDomains: [
      "Student engagement records",
      "Event attendance",
      "Student organizations",
    ],
  },
  "rfd-career": {
    dataDomains: ["CAREER Club workbook responses", "Cohort progress data"],
  },
  universo: {
    dataDomains: ["Researcher profiles", "Research projects & outputs", "Vector embeddings"],
  },
  mindrouter: {
    dataDomains: ["LLM prompts & responses (audit log)", "Usage telemetry", "SSO identities"],
  },
  "dgx-stack": {
    dataDomains: ["Model inference payloads", "OCR document images"],
  },
  "template-app": {
    dataDomains: ["None — development scaffold; carries no institutional data"],
  },
  "oit-data-modernization": {
    dataDomains: ["Enterprise institutional data (scope to be confirmed)"],
  },
  nexus: {
    dataDomains: ["Hosted application-module data (varies by module)"],
  },
};

// ---- Derivation -------------------------------------------------------

const COMMERCIAL_VENDORS = ["Huron Consulting"];

function deriveBuildType(project: Project): BuildType {
  const vendorLed = project.buildParticipants.some((p) =>
    COMMERCIAL_VENDORS.includes(p),
  );
  if (vendorLed) return "hybrid";
  return "built-in-house";
}

// Which Unified Technology Request track this project would route to if
// it entered the process today. `tracked` (externally owned) work sits
// outside the pipeline → `external`.
function deriveIntakeTrack(project: Project, buildType: BuildType): IntakeTrack {
  if (project.status === "tracked") return "external";
  if (buildType === "bought") return "track-a";
  if (project.status === "idea" || project.status === "approved") return "track-c";
  return "track-b";
}

// Integrations proxy — the related projects/infra this one connects to
// or depends on, rendered by name.
function deriveIntegrations(project: Project): string[] {
  if (!project.relatedSlugs) return [];
  const names = project.relatedSlugs
    .map((slug) => getProjectBySlug(slug)?.name)
    .filter((n): n is string => Boolean(n));
  return Array.from(new Set(names));
}

const dataModelSlugs = new Set(governanceCatalog.map((p) => p.slug));

export interface ResolvedProfile {
  slug: string;
  name: string;
  status: ProjectStatus;
  publicStage: PublicStage;
  businessNeed: string;
  whyItExists: string;
  homeUnits: string[];
  functionalOwners: { name: string; title?: string }[];
  technicalLead: string | null;
  buildTeam: string[];
  buildType: BuildType;
  intakeTrack: IntakeTrack;
  dataDomains: string[] | null;
  dataClassification: DataClassification | null;
  aiRiskTier: AiRiskTier | null;
  integrations: string[];
  fundingSource: string | null;
  strategicPlanAlignment: string[];
  roi: RoiAssessment | null;
  /** Slug in the Data Model catalog, if this project has a schema page. */
  dataModelSlug: string | null;
}

export function resolveGovernanceProfile(project: Project): ResolvedProfile {
  const o = governanceOverrides[project.slug] ?? {};
  const buildType = o.buildType ?? deriveBuildType(project);
  const intakeTrack = o.intakeTrack ?? deriveIntakeTrack(project, buildType);
  return {
    slug: project.slug,
    name: project.name,
    status: project.status,
    publicStage: computePublicStage(project.status),
    businessNeed: project.tagline,
    whyItExists: project.operationalExcellenceOutcome,
    homeUnits: project.homeUnits,
    functionalOwners: project.operationalOwners,
    technicalLead: project.supportContact ?? project.iidsSponsor ?? null,
    buildTeam: project.buildParticipants,
    buildType,
    intakeTrack,
    dataDomains: o.dataDomains ?? null,
    dataClassification: o.dataClassification ?? null,
    aiRiskTier: o.aiRiskTier ?? null,
    integrations: o.integrations ?? deriveIntegrations(project),
    fundingSource: o.fundingSource ?? project.funding ?? null,
    strategicPlanAlignment: project.strategicPlanAlignment ?? [],
    roi: o.roi ?? null,
    dataModelSlug: dataModelSlugs.has(project.slug) ? project.slug : null,
  };
}

export function allGovernanceProfiles(): ResolvedProfile[] {
  return projects
    .filter((p) => p.visibility !== "Internal-only")
    .map(resolveGovernanceProfile);
}

// ---- Coverage summary (honesty strip) ---------------------------------

export interface GovernanceCoverage {
  total: number;
  byTrack: Record<IntakeTrack, number>;
  classificationPending: number;
  aiRiskPending: number;
  roiPending: number;
}

export function governanceCoverage(
  profiles: ResolvedProfile[],
): GovernanceCoverage {
  const byTrack: Record<IntakeTrack, number> = {
    "fast-lane": 0,
    "track-a": 0,
    "track-b": 0,
    "track-c": 0,
    external: 0,
  };
  let classificationPending = 0;
  let aiRiskPending = 0;
  let roiPending = 0;
  for (const p of profiles) {
    byTrack[p.intakeTrack] += 1;
    if (!p.dataClassification) classificationPending += 1;
    if (!p.aiRiskTier) aiRiskPending += 1;
    if (!p.roi) roiPending += 1;
  }
  return {
    total: profiles.length,
    byTrack,
    classificationPending,
    aiRiskPending,
    roiPending,
  };
}

// ---- Display labels ---------------------------------------------------

export const BUILD_TYPE_LABEL: Record<BuildType, string> = {
  "built-in-house": "Built in-house",
  bought: "Purchased",
  hybrid: "Hybrid (vendor-assisted)",
};

export const INTAKE_TRACK_LABEL: Record<IntakeTrack, string> = {
  "fast-lane": "Fast Lane",
  "track-a": "Track A · Standard software",
  "track-b": "Track B · Built in-house",
  "track-c": "Track C · Idea / concept",
  external: "External — tracked",
};

// Compact labels for the dense matrix view, where the full
// "Track B · Built in-house" string is too wide. Pair with the title
// tooltip (INTAKE_TRACK_TITLE) so the short form stays legible.
export const INTAKE_TRACK_SHORT: Record<IntakeTrack, string> = {
  "fast-lane": "Fast Lane",
  "track-a": "A",
  "track-b": "B",
  "track-c": "C",
  external: "Ext",
};

export const INTAKE_TRACK_TITLE: Record<IntakeTrack, string> = {
  "fast-lane": "Fast Lane — low-risk individual purchase, automated approval.",
  "track-a": "Track A — commercial purchase or subscription requiring governance review.",
  "track-b": "Track B — fully realized in-house application needing security and operational acceptance.",
  "track-c": "Track C — early-stage build requiring feasibility assessment and the development queue.",
  external: "External — owned outside IIDS; tracked in the inventory, not routed through the intake process.",
};

export const DATA_CLASSIFICATION_LABEL: Record<DataClassification, string> = {
  public: "Public",
  internal: "Internal",
  sensitive: "Sensitive",
  "high-risk": "High-risk",
};

export const AI_RISK_LABEL: Record<AiRiskTier, string> = {
  standard: "Standard use",
  elevated: "Elevated",
  "material-exposure": "Material exposure",
};
