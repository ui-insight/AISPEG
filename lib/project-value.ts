import type { ClickUpRoi } from "./clickup-data";
import type { Project } from "./portfolio";

export const PROJECT_VALUE_LENSES = [
  {
    value: "direct-cost",
    label: "Direct cost",
    description: "Existing annual software spend this work could displace.",
  },
  {
    value: "staff-capacity",
    label: "Staff capacity",
    description: "Estimated staff time returned for higher-value work.",
  },
  {
    value: "strategic-alignment",
    label: "Strategic alignment",
    description: "University strategic-plan priorities advanced.",
  },
  {
    value: "institutional-reach",
    label: "Institutional reach",
    description: "Work spanning units or intended for institution-wide use.",
  },
  {
    value: "reuse",
    label: "Reuse beyond UI",
    description: "Open or partner-ready work designed for use beyond UI.",
  },
] as const;

export type ProjectValueLens =
  (typeof PROJECT_VALUE_LENSES)[number]["value"];

export interface ProjectValueEvidence {
  lens: ProjectValueLens;
  summary: string;
  detail: string;
  sortValue: number;
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const decimal = new Intl.NumberFormat("en-US", {
  maximumFractionDigits: 2,
});

export function isProjectValueLens(
  value: string | undefined
): value is ProjectValueLens {
  return PROJECT_VALUE_LENSES.some((lens) => lens.value === value);
}

export function projectValueEvidence(
  project: Project,
  roi: ClickUpRoi | null = null
): ProjectValueEvidence[] {
  const evidence: ProjectValueEvidence[] = [];
  const replacement = project.enterpriseSystemReplacement;

  if (replacement.status === "yes") {
    evidence.push({
      lens: "direct-cost",
      summary: `${usd.format(replacement.annualCostUsd)}/year`,
      detail: `Potential annual software cost displaced by replacing ${replacement.systemName}.`,
      sortValue: replacement.annualCostUsd,
    });
  }

  if (roi?.roiFte != null && roi.roiFte > 0) {
    evidence.push({
      lens: "staff-capacity",
      summary: `${decimal.format(roi.roiFte)} FTE`,
      detail:
        roi.roiExplanation ??
        "Estimated staff capacity returned for higher-value work.",
      sortValue: roi.roiFte,
    });
  }

  if ((project.strategicPlanAlignment?.length ?? 0) > 0) {
    const count = project.strategicPlanAlignment!.length;
    evidence.push({
      lens: "strategic-alignment",
      summary: `${count} strategic priorit${count === 1 ? "y" : "ies"}`,
      detail: "Declared alignment with the University of Idaho strategic plan.",
      sortValue: count,
    });
  }

  const hasInstitutionalReach =
    project.productionScope === "institution-wide" ||
    project.homeUnits.length > 1;
  if (hasInstitutionalReach) {
    const unitCount = project.homeUnits.length;
    evidence.push({
      lens: "institutional-reach",
      summary:
        project.productionScope === "institution-wide"
          ? "Institution-wide"
          : `${unitCount} home units`,
      detail:
        project.productionScope === "institution-wide"
          ? "Recorded for institution-wide production use."
          : "Shared ownership or use across more than one UI unit.",
      sortValue:
        project.productionScope === "institution-wide" ? 100 : unitCount,
    });
  }

  const reuseCount =
    (project.externalDeployments?.length ?? 0) +
    (project.dualDestinyPlanned ? 1 : 0);
  if (reuseCount > 0) {
    evidence.push({
      lens: "reuse",
      summary:
        (project.externalDeployments?.length ?? 0) > 0
          ? `${project.externalDeployments!.length} external deployment${
              project.externalDeployments!.length === 1 ? "" : "s"
            }`
          : "Partner-ready",
      detail: project.dualDestinyPlanned
        ? "Designed for both UI use and open-source adoption."
        : "Already deployed outside the University of Idaho.",
      sortValue: reuseCount,
    });
  }

  return evidence;
}

export function evidenceForLens(
  evidence: readonly ProjectValueEvidence[],
  lens: ProjectValueLens
): ProjectValueEvidence | null {
  return evidence.find((item) => item.lens === lens) ?? null;
}
