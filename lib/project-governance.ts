// Project-level governance fields that cut across the portfolio, registry,
// and public project detail pages.
//
// Deployment values follow the two OIT discussion drafts tracked in
// lib/oit-pathway.ts. The drafts allow Azure, OCI OKE, or on-prem Kubernetes
// for OIT-managed production. `oit-hosted` records the governance decision
// before OIT and the product team select one of those concrete platforms.

export const DEPLOYMENT_ENVIRONMENTS = [
  {
    value: "oit-hosted",
    label: "OIT-hosted infrastructure (platform TBD)",
    description:
      "OIT-managed production is proposed; Azure, OCI OKE, or on-prem Kubernetes has not yet been selected.",
  },
  {
    value: "oit-azure",
    label: "OIT-managed Azure",
    description: "OIT-managed production deployment on Microsoft Azure.",
  },
  {
    value: "oit-oci-oke",
    label: "OIT-managed OCI OKE",
    description:
      "An OIT-provisioned product-team namespace on the Oracle Cloud Infrastructure Kubernetes platform.",
  },
  {
    value: "oit-on-prem-kubernetes",
    label: "OIT-managed on-prem Kubernetes",
    description:
      "An OIT-provisioned product-team namespace on the university's on-premises Kubernetes platform.",
  },
  {
    value: "iids-hosted",
    label: "IIDS-hosted infrastructure",
    description:
      "Hosted and operated on IIDS infrastructure outside the emerging OIT hosted-environment pathway.",
  },
  {
    value: "external-hosted",
    label: "External or partner-hosted",
    description:
      "Hosted by an external partner or vendor rather than on University of Idaho infrastructure.",
  },
  {
    value: "not-applicable",
    label: "Not applicable",
    description:
      "The project is a scaffold, reference asset, or other deliverable without its own deployment target.",
  },
  {
    value: "to-be-determined",
    label: "To be determined",
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
