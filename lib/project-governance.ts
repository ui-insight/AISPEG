// Project-level governance fields that cut across the portfolio, registry,
// and public project detail pages.
//
// Deployment values follow the five-target model settled in the
// 2026-08-05 definitional session (superseding the hosting-only
// vocabulary from Migration 012): two platform-hosted form factors
// (Databricks dashboard, Nexus module) plus three standalone-app
// hosting locations (OCI, OIT on-prem Kubernetes, RCDS VM). The RCDS VM
// is transitional — a staging home until a project enters the OIT
// pathway, not a destination. Per-target characteristics live in
// lib/deployment-targets.ts; Azure was dropped with zero uses and can
// be re-added the day OIT actually lands something there.
//
// `oitManaged` drives ADR 0001 sub-decision #5: production operated on
// an OIT-managed environment satisfies the accessibility rule even
// without an anonymous URL (lib/portfolio-verification.ts).

export const DEPLOYMENT_ENVIRONMENTS = [
  // ---- The five targets ----------------------------------------------
  {
    value: "databricks-dashboard",
    label: "Databricks dashboard (OIT lakehouse)",
    oitManaged: true,
    description:
      "A dashboard delivered inside OIT's Databricks lakehouse workspace (medallion architecture with data marts). OIT controls the workspace entirely; the service is aspirational until OIT's implementation completes. Distinct from the IIDS lakehouse pilot, which serves AI4RA.",
  },
  {
    value: "nexus-module",
    label: "Nexus module",
    oitManaged: true,
    description:
      "A module inside Nexus, the shared React + FastAPI application platform on OIT-managed secure infrastructure. Reached through the six-stage Builder Guide pathway.",
  },
  {
    value: "standalone-oci",
    label: "Standalone app — OIT-managed OCI",
    oitManaged: true,
    description:
      "A containerized standalone application on Oracle Cloud Infrastructure, deployed and operated by OIT DevOps per the OIT pathway.",
  },
  {
    value: "standalone-oit-k8s",
    label: "Standalone app — OIT on-prem Kubernetes",
    oitManaged: true,
    description:
      "A containerized standalone application in an OIT-provisioned namespace on the university's on-premises Kubernetes platform.",
  },
  {
    value: "rcds-vm",
    label: "Standalone app — RCDS VM (transitional)",
    oitManaged: false,
    description:
      "A Docker-composed application on an IIDS/RCDS self-managed VM (the insight.uidaho.edu class). Staging and pilot hosting, not a long-term destination — projects here are pre-pathway.",
  },
  // ---- Rollup + meta values ------------------------------------------
  {
    value: "oit-managed-tbd",
    label: "OIT-managed (target TBD)",
    oitManaged: true,
    description:
      "OIT-managed production is the governance decision; which of the OIT targets has not yet been selected.",
  },
  {
    value: "platform",
    label: "Platform / shared infrastructure",
    oitManaged: false,
    description:
      "This entry is itself a deployment platform or shared infrastructure (e.g. Nexus, MindRouter); workload target classification does not apply.",
  },
  {
    value: "external-hosted",
    label: "External or partner-hosted",
    oitManaged: false,
    description:
      "Hosted by an external partner or vendor rather than on University of Idaho infrastructure.",
  },
  {
    value: "not-applicable",
    label: "Not applicable",
    oitManaged: false,
    description:
      "The project is a scaffold, reference asset, or other deliverable without its own deployment target.",
  },
  {
    value: "to-be-determined",
    label: "To be determined",
    oitManaged: false,
    description:
      "The proposed production environment has not yet been documented.",
  },
] as const;

export type DeploymentEnvironment =
  (typeof DEPLOYMENT_ENVIRONMENTS)[number]["value"];

export const DEPLOYMENT_ENVIRONMENT_LABELS: Record<
  DeploymentEnvironment,
  string
> = Object.fromEntries(
  DEPLOYMENT_ENVIRONMENTS.map(({ value, label }) => [value, label])
) as Record<DeploymentEnvironment, string>;

export const DEPLOYMENT_ENVIRONMENT_DESCRIPTIONS: Record<
  DeploymentEnvironment,
  string
> = Object.fromEntries(
  DEPLOYMENT_ENVIRONMENTS.map(({ value, description }) => [value, description])
) as Record<DeploymentEnvironment, string>;

export function isDeploymentEnvironment(
  value: unknown
): value is DeploymentEnvironment {
  return DEPLOYMENT_ENVIRONMENTS.some((item) => item.value === value);
}

/**
 * ADR 0001 sub-decision #5: production operated on an OIT-managed
 * environment satisfies the accessibility rule. Encoded as a vocabulary
 * flag rather than a value-name prefix so renames can't silently break
 * the verifier.
 */
export function isOitManagedEnvironment(value: DeploymentEnvironment): boolean {
  return (
    DEPLOYMENT_ENVIRONMENTS.find((item) => item.value === value)?.oitManaged ??
    false
  );
}

export const ENTERPRISE_REPLACEMENT_STATUSES = [
  "yes",
  "no",
  "to-be-determined",
] as const;

export type EnterpriseReplacementStatus =
  (typeof ENTERPRISE_REPLACEMENT_STATUSES)[number];

// A discriminated union prevents a project from claiming that it replaces an
// enterprise system without naming that system and recording its annual cost.
export type EnterpriseSystemReplacement =
  | {
      status: "yes";
      systemName: string;
      annualCostUsd: number;
      renewalDate?: string; // ISO date when the current contract renews
    }
  | { status: "no" }
  | { status: "to-be-determined" };

export function isEnterpriseReplacementStatus(
  value: unknown
): value is EnterpriseReplacementStatus {
  return ENTERPRISE_REPLACEMENT_STATUSES.includes(
    value as EnterpriseReplacementStatus
  );
}
