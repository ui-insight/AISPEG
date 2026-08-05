// ============================================================
// UTR Landscape — the destination-harmonized activity model
// ============================================================
// ADR 0008, PR 3: one read model joining the two activity populations
// (projects in flight, open requests) against the five-target supply
// model, plus the computed mismatch ledger the surface leads with.
//
// Pure by design: `buildUtrLandscape()` takes its sources as arguments
// and touches no I/O, so the page composes it from lib/work.ts +
// lib/requests.ts while scripts and tests can feed it lib/portfolio.ts
// entries or fixtures directly (lib/work.ts is server-only; this module
// must not be).
//
// Honesty rules (ADR 0008 §5), enforced structurally here:
// - Maturity language comes only from lib/deployment-targets.ts.
// - Every count in a finding is computed from the sources at build
//   time; a finding whose condition doesn't hold is not emitted.
// - A request's inferred target never loses its 'inferred' marking.
// - Activities with no classification land in an explicit unclassified
//   pool — never silently dropped.

import {
  OPERATIONAL_LABEL,
  type ProjectStatus,
} from "./portfolio";
import type { DeploymentEnvironment } from "./project-governance";
import {
  DEPLOYMENT_TARGETS,
  type DeploymentTargetProfile,
  type DeploymentTarget,
} from "./deployment-targets";
import { REQUEST_ORIGIN_LABEL } from "./utr";
import type { TechRequest } from "./requests";

// ---- Sources ----------------------------------------------------------
// Structural subsets: lib/portfolio.ts `Project` and lib/work.ts
// `Application` both satisfy LandscapeProjectSource, so either side of
// the typed-shadow/Postgres seam can feed the builder.

export interface LandscapeProjectSource {
  slug: string;
  name: string;
  homeUnits: string[];
  operationalOwners: { name: string; title?: string }[];
  status: ProjectStatus;
  proposedDeploymentEnvironment: DeploymentEnvironment;
  currentDeploymentEnvironment?: DeploymentEnvironment;
  trackingOnly?: boolean;
}

export type LandscapeRequestSource = Pick<
  TechRequest,
  | "id"
  | "title"
  | "origin"
  | "disposition"
  | "requestorName"
  | "requestorUnit"
  | "proposedDeploymentTarget"
  | "targetConfidence"
  | "targetInferenceRationale"
>;

// ---- Activities -------------------------------------------------------

/**
 * How a target classification is known. Projects are 'authored' — the
 * entry is owner-reviewed in lib/portfolio.ts. Requests are 'inferred'
 * (machine proposal, provenance recorded) until triage confirms.
 */
export type TargetProvenance = "authored" | "inferred" | "confirmed";

export interface LandscapeActivity {
  kind: "project" | "request";
  /** Portfolio slug or tech_request id. */
  ref: string;
  /** Where the site tells this activity's full story (one-story rule:
   *  the Landscape is a projection, never a second detail view). */
  href: string;
  name: string;
  unit: string | null;
  ownerName: string | null;
  /** Human-readable position: operational status or request origin. */
  position: string;
  currentTarget: DeploymentEnvironment | null;
  proposedTarget: DeploymentEnvironment | null;
  provenance: TargetProvenance | null;
  /** The one-line machine rationale, present on inferred requests. */
  inferenceRationale: string | null;
}

function projectActivity(p: LandscapeProjectSource): LandscapeActivity {
  return {
    kind: "project",
    ref: p.slug,
    href: `/portfolio/${p.slug}`,
    name: p.name,
    unit: p.homeUnits[0] ?? null,
    ownerName: p.operationalOwners[0]?.name ?? null,
    position: OPERATIONAL_LABEL[p.status],
    currentTarget: p.currentDeploymentEnvironment ?? null,
    proposedTarget: p.proposedDeploymentEnvironment,
    provenance: "authored",
    inferenceRationale: null,
  };
}

function requestActivity(r: LandscapeRequestSource): LandscapeActivity {
  return {
    kind: "request",
    ref: r.id,
    href: "/portfolio/pipeline",
    name: r.title,
    unit: r.requestorUnit,
    ownerName: r.requestorName,
    position: `Open request · ${REQUEST_ORIGIN_LABEL[r.origin]}`,
    currentTarget: null,
    proposedTarget: r.proposedDeploymentTarget,
    provenance: r.targetConfidence,
    inferenceRationale:
      r.targetConfidence === "inferred" ? r.targetInferenceRationale : null,
  };
}

// ---- Bands and pools --------------------------------------------------

export interface TargetBand {
  profile: DeploymentTargetProfile;
  /** Projects whose current environment is this target. */
  running: LandscapeActivity[];
  /** Projects proposed here that don't run here yet. */
  headed: LandscapeActivity[];
  /** Open requests classified to this target. */
  queued: LandscapeActivity[];
}

/**
 * Activity that classifies outside the five targets. Each pool is a
 * deliberate bucket, not a leftover: vendor-hosted demand shapes the
 * Track A story, `oit-managed-tbd` records a made decision awaiting a
 * platform pick, `noDeployment` is request substance that never
 * deploys, `platforms` are the entries that ARE supply, and
 * `unclassified` is the honesty pool the ADR requires.
 */
export interface LandscapePools {
  externalHosted: LandscapeActivity[];
  oitManagedTbd: LandscapeActivity[];
  noDeployment: LandscapeActivity[];
  platforms: LandscapeActivity[];
  unclassified: LandscapeActivity[];
}

// ---- Findings (the mismatch ledger) -----------------------------------

export type LandscapeFindingKind =
  | "transitional-load"
  | "gate-concentration"
  | "demand-on-aspirational-supply"
  | "unproven-supply"
  | "vendor-demand"
  | "unclassified-pool";

export interface LandscapeFinding {
  kind: LandscapeFindingKind;
  /** The ledger sentence — every number computed from the sources. */
  headline: string;
  /** Supporting sentence(s); may carry typed context (e.g. the survey
   *  evidence behind the Databricks understatement). */
  detail: string;
  /** Where a reader verifies the claim. */
  evidence: { label: string; href: string }[];
  /** The raw numbers behind the headline, for rendering emphasis. */
  counts: Record<string, number>;
}

export interface UtrLandscape {
  bands: TargetBand[];
  pools: LandscapePools;
  findings: LandscapeFinding[];
  totals: {
    projects: number;
    openRequests: number;
    classifiedOpenRequests: number;
  };
}

// ---- Builder ----------------------------------------------------------

const OIT_MANAGED_NEXT_HOMES: DeploymentEnvironment[] = [
  "databricks-dashboard",
  "nexus-module",
  "standalone-oci",
  "standalone-oit-k8s",
  "oit-managed-tbd",
];

function plural(n: number, singular: string, pluralForm?: string): string {
  return n === 1 ? singular : (pluralForm ?? `${singular}s`);
}

export function buildUtrLandscape(
  projectSources: LandscapeProjectSource[],
  requestSources: LandscapeRequestSource[]
): UtrLandscape {
  // Archived entries are history, not landscape. Everything else —
  // including paused and tracked work — is honestly part of the map.
  const projects = projectSources
    .filter((p) => p.status !== "archived")
    .map(projectActivity);
  const openRequests = requestSources
    .filter((r) => r.disposition === "open")
    .map(requestActivity);

  const bands: TargetBand[] = DEPLOYMENT_TARGETS.map((profile) => ({
    profile,
    running: projects.filter((a) => a.currentTarget === profile.value),
    headed: projects.filter(
      (a) =>
        a.proposedTarget === profile.value &&
        a.currentTarget !== profile.value
    ),
    queued: openRequests.filter((a) => a.proposedTarget === profile.value),
  }));

  const pools: LandscapePools = {
    externalHosted: [...projects, ...openRequests].filter(
      (a) => a.proposedTarget === "external-hosted"
    ),
    oitManagedTbd: [...projects, ...openRequests].filter(
      (a) => a.proposedTarget === "oit-managed-tbd"
    ),
    noDeployment: openRequests.filter(
      (a) => a.proposedTarget === "not-applicable"
    ),
    platforms: projects.filter((a) => a.proposedTarget === "platform"),
    unclassified: [
      ...projects.filter((a) => a.proposedTarget === "to-be-determined"),
      ...openRequests.filter((a) => a.proposedTarget === null),
    ],
  };

  const classifiedOpenRequests = openRequests.filter(
    (a) => a.proposedTarget !== null
  );

  const findings = computeFindings(bands, pools, openRequests.length, classifiedOpenRequests.length);

  return {
    bands,
    pools,
    findings,
    totals: {
      projects: projects.length,
      openRequests: openRequests.length,
      classifiedOpenRequests: classifiedOpenRequests.length,
    },
  };
}

function band(bands: TargetBand[], value: DeploymentTarget): TargetBand {
  const found = bands.find((b) => b.profile.value === value);
  if (!found) throw new Error(`Missing target band: ${value}`);
  return found;
}

function computeFindings(
  bands: TargetBand[],
  pools: LandscapePools,
  openRequestCount: number,
  classifiedCount: number
): LandscapeFinding[] {
  const findings: LandscapeFinding[] = [];

  // 1 — Transitional load: workloads on the RCDS VM, and how many have
  // no confirmed next home (proposed is TBD or the VM itself).
  const rcds = band(bands, "rcds-vm");
  if (rcds.running.length > 0) {
    const noNextHome = rcds.running.filter(
      (a) =>
        a.proposedTarget === null ||
        !OIT_MANAGED_NEXT_HOMES.includes(a.proposedTarget)
    );
    findings.push({
      kind: "transitional-load",
      headline: `${rcds.running.length} ${plural(rcds.running.length, "workload")} run on the RCDS VM — transitional by decision — and ${noNextHome.length} of them ${noNextHome.length === 1 ? "has" : "have"} no confirmed next home.`,
      detail:
        "The RCDS VM is staging, not a destination. Every workload here eventually needs a pathway plan to an OIT-managed target or an explicit decision to stay.",
      evidence: [
        { label: "RCDS VM band", href: "/utr-landscape/rcds-vm" },
        { label: "Projects", href: "/portfolio" },
      ],
      counts: {
        running: rcds.running.length,
        noNextHome: noNextHome.length,
      },
    });
  }

  // 2 — Gate concentration: everything pointed at Nexus vs. how many
  // workloads have actually completed the pathway.
  const nexus = band(bands, "nexus-module");
  const nexusDemand = nexus.headed.length + nexus.queued.length;
  if (nexusDemand > 0) {
    findings.push({
      kind: "gate-concentration",
      headline: `${nexusDemand} ${plural(nexusDemand, "activity", "activities")} point at Nexus — ${nexus.headed.length} ${plural(nexus.headed.length, "project")} in flight and ${nexus.queued.length} open ${plural(nexus.queued.length, "request")} — while ${nexus.running.length} ${nexus.running.length === 1 ? "workload has" : "workloads have"} completed the pathway to date.`,
      detail: nexus.profile.timeToDeploy,
      evidence: [
        { label: "Nexus band", href: "/utr-landscape/nexus-module" },
        { label: "OIT pathway", href: "/coordination/oit-pathway" },
      ],
      counts: {
        headed: nexus.headed.length,
        queued: nexus.queued.length,
        running: nexus.running.length,
      },
    });
  }

  // 3 — Demand on aspirational supply: requests classified to
  // Databricks while the service is not yet offered. The request count
  // understates this demand: the reconciliation theme in the
  // Operational Excellence survey is dashboard-on-lakehouse shaped but
  // never entered the request queue.
  const databricks = band(bands, "databricks-dashboard");
  if (
    databricks.profile.maturity === "aspirational" &&
    databricks.queued.length > 0
  ) {
    findings.push({
      kind: "demand-on-aspirational-supply",
      headline: `${databricks.queued.length} open ${plural(databricks.queued.length, "request")} ${databricks.queued.length === 1 ? "classifies" : "classify"} to the Databricks dashboard target, which cannot receive them: ${databricks.profile.maturityNote}`,
      detail:
        "The request count understates report-shaped demand — the Operational Excellence survey's reconciliation theme (numbers that don't agree across Banner, Slate, Argos, Sunapsis) is dashboard-on-lakehouse shaped and never entered the request queue.",
      evidence: [
        {
          label: "Databricks band",
          href: "/utr-landscape/databricks-dashboard",
        },
        {
          label: "Op Excellence survey",
          href: "/coordination/operational-excellence",
        },
      ],
      counts: { queued: databricks.queued.length },
    });
  }

  // 4 — Unproven supply: activity pointed at sanctioned targets nothing
  // has landed on.
  const oci = band(bands, "standalone-oci");
  const k8s = band(bands, "standalone-oit-k8s");
  const unprovenDemand =
    oci.headed.length + oci.queued.length + k8s.headed.length + k8s.queued.length;
  const unprovenLanded = oci.running.length + k8s.running.length;
  if (unprovenDemand > 0 && unprovenLanded === 0) {
    findings.push({
      kind: "unproven-supply",
      headline: `${unprovenDemand} ${plural(unprovenDemand, "activity", "activities")} point at the standalone OIT targets (OCI, on-prem Kubernetes) — no workload has ever landed on either.`,
      detail:
        "Both targets are named in the OIT drafts as approved platforms. The first landing will set the real timeline for everything behind it.",
      evidence: [
        { label: "OCI band", href: "/utr-landscape/standalone-oci" },
        { label: "OIT K8s band", href: "/utr-landscape/standalone-oit-k8s" },
      ],
      counts: { demand: unprovenDemand },
    });
  }

  // 5 — Vendor demand: the share of classified open requests that are
  // purchase-shaped and land on vendor infrastructure.
  const vendorRequests = pools.externalHosted.filter(
    (a) => a.kind === "request"
  );
  if (vendorRequests.length > 0 && classifiedCount > 0) {
    const share = Math.round((vendorRequests.length / classifiedCount) * 100);
    findings.push({
      kind: "vendor-demand",
      headline: `${share}% of classified open demand (${vendorRequests.length} of ${classifiedCount} requests) is purchase-shaped — it lands on vendor infrastructure, not a university target.`,
      detail:
        "The institutional build capacity question is smaller than the raw queue suggests; most of the queue is a Track A governance question, not a deployment question.",
      evidence: [
        { label: "Request queue", href: "/portfolio/pipeline" },
      ],
      counts: {
        vendor: vendorRequests.length,
        classified: classifiedCount,
      },
    });
  }

  // 6 — The honesty pool: what the model doesn't cover yet.
  const unclassifiedRequests = pools.unclassified.filter(
    (a) => a.kind === "request"
  ).length;
  const undeterminedProjects = pools.unclassified.filter(
    (a) => a.kind === "project"
  ).length;
  if (unclassifiedRequests + undeterminedProjects > 0) {
    findings.push({
      kind: "unclassified-pool",
      headline: `${undeterminedProjects} ${plural(undeterminedProjects, "project")} and ${unclassifiedRequests} open ${plural(unclassifiedRequests, "request")} carry no destination yet.`,
      detail:
        "Unclassified is a state, not an omission — these rows are the working queue for target triage.",
      evidence: [
        { label: "Unclassified pool", href: "/utr-landscape#unclassified" },
      ],
      counts: {
        projects: undeterminedProjects,
        requests: unclassifiedRequests,
      },
    });
  }

  return findings;
}
