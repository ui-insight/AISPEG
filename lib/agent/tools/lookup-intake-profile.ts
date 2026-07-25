// lookup_intake_profile — how our projects sit against the Chief AI &
// Data Science Officer's Unified Technology Request vocabulary.
//
// The crosswalk surface (/coordination/intake-crosswalk) answers "which
// track is this on, who owns it, what data does it touch, what does it
// replace". None of that was reachable by the agent: search_portfolio
// returns our own lifecycle vocabulary, not the intake one.
//
// Two fields are deliberately empty everywhere: dataClassification and
// aiRiskTier are the CADSO office's calls to make and have not been
// made. They resolve to null rather than to a guess, and the tool
// reports the pending counts so the model says "pending" instead of
// inferring a tier from the project description.

import "server-only";
import {
  allGovernanceProfiles,
  governanceCoverage,
  BUILD_TYPE_LABEL,
  INTAKE_TRACK_LABEL,
  DATA_CLASSIFICATION_LABEL,
  AI_RISK_LABEL,
  type ResolvedProfile,
} from "@/lib/governance-profile";
import { ROI_RUBRIC_READY, formatAnnualUsd } from "@/lib/roi-rubric";
import type { ToolHandler, ToolResult } from "./registry";

const CANONICAL_URL = "/coordination/intake-crosswalk";

function pickString(
  args: Record<string, unknown>,
  key: string,
): string | undefined {
  const v = args[key];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

function serialise(p: ResolvedProfile) {
  return {
    slug: p.slug,
    name: p.name,
    url: `/portfolio/${p.slug}`,
    businessNeed: p.businessNeed,
    whyItExists: p.whyItExists,
    homeUnits: p.homeUnits,
    functionalOwners: p.functionalOwners.map((o) => o.name),
    technicalLead: p.technicalLead,
    intakeTrack: INTAKE_TRACK_LABEL[p.intakeTrack],
    buildType: BUILD_TYPE_LABEL[p.buildType],
    dataDomains: p.dataDomains,
    dataClassification: p.dataClassification
      ? DATA_CLASSIFICATION_LABEL[p.dataClassification]
      : "Pending — the CADSO office's classification call",
    aiRiskTier: p.aiRiskTier
      ? AI_RISK_LABEL[p.aiRiskTier]
      : "Pending — AI-risk review not yet completed",
    fundingSource: p.fundingSource,
    replaces: p.bottomLineRoi
      ? {
          system: p.bottomLineRoi.systemName,
          annualCost: formatAnnualUsd(p.bottomLineRoi.annualUsd),
          renewalDate: p.bottomLineRoi.renewalDate ?? null,
          status: p.enterpriseReplacementStatus,
        }
      : null,
  };
}

export const lookupIntakeProfileTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "lookup_intake_profile",
      description:
        "How our projects map onto the Chief AI & Data Science Officer's Unified Technology Request intake vocabulary: intake track (fast-lane / A / B / C / external), build type (built in-house, bought, hybrid), data domains touched, data classification, AI-risk tier, funding source, and what enterprise system the project replaces with the incumbent's annual cost and renewal date. Use for: 'what track is X on', 'which projects are fast-lane', 'what data does X touch', 'which projects replace licensed software', 'what would this cost us to keep'. Data classification and AI-risk tier are PENDING on every project — those are the CADSO office's determinations and have not been made. Report them as pending; never infer a classification or risk tier from a project description.",
      parameters: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description:
              "Optional portfolio slug for one project's full intake profile.",
          },
          track: {
            type: "string",
            description:
              "Optional filter: 'fast-lane', 'track-a', 'track-b', 'track-c', or 'external'.",
          },
          replacesEnterpriseSystem: {
            type: "boolean",
            description:
              "When true, return only projects that replace a licensed enterprise system (the hard-dollar savings cases).",
          },
        },
        additionalProperties: false,
      },
    },
  },
  async execute(rawArgs): Promise<ToolResult> {
    const slug = pickString(rawArgs, "slug");
    const track = pickString(rawArgs, "track");
    const replacesOnly = rawArgs.replacesEnterpriseSystem === true;

    const all = allGovernanceProfiles();
    const coverage = governanceCoverage(all);

    let rows = all;
    if (slug) rows = rows.filter((p) => p.slug === slug);
    if (track) rows = rows.filter((p) => p.intakeTrack === track);
    if (replacesOnly) rows = rows.filter((p) => p.bottomLineRoi !== null);

    return {
      data: {
        note: "Intake vocabulary mirrors the Unified Technology Request. Data classification and AI-risk tier are the CADSO office's calls and are pending on every project — report them as pending, do not infer them.",
        roiRubric: ROI_RUBRIC_READY
          ? "Published."
          : "Not yet published by the CADSO office. Replacement economics below are incumbent license costs on the record, not projected savings.",
        totalProfiled: coverage.total,
        returned: rows.length,
        pending: {
          dataClassification: coverage.classificationPending,
          aiRiskTier: coverage.aiRiskPending,
          roiScore: coverage.roiPending,
        },
        replacementEconomics: {
          projectsReplacingLicensedSystems: coverage.bottomLineCount,
          totalIncumbentAnnualCost: formatAnnualUsd(
            coverage.bottomLineTotalUsd,
          ),
        },
        trackBreakdown: Object.entries(coverage.byTrack).map(
          ([track, count]) => ({
            track,
            label: INTAKE_TRACK_LABEL[track as keyof typeof INTAKE_TRACK_LABEL],
            count,
          }),
        ),
        projects: rows.map(serialise),
      },
      canonicalUrl: CANONICAL_URL,
      links: rows.map((p) => ({ label: p.name, url: `/portfolio/${p.slug}` })),
    };
  },
};
