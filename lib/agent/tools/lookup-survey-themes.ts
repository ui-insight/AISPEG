// lookup_survey_themes — the Operational Excellence survey (October
// 2025): what faculty/staff and students actually asked for, as
// question-clusters with summaries and sub-themes. Everything returned
// here is already published on /coordination/operational-excellence —
// verbatims pass through the same privacy handling as the page
// (withheld responses never enter the module; featured quotes are
// hand-curated).

import "server-only";
import {
  OPERATIONAL_EXCELLENCE_META,
  clustersFor,
  getCluster,
  featuredFor,
  responseCount,
} from "@/lib/surveys/operational-excellence";
import type { SurveyAudience, SurveyClusterKey } from "@/lib/surveys/types";
import type { ToolHandler, ToolResult } from "./registry";

const CANONICAL_URL = "/coordination/operational-excellence";
const AUDIENCES: SurveyAudience[] = ["faculty", "student"];

function pickString(args: Record<string, unknown>, key: string): string | undefined {
  const v = args[key];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

export const lookupSurveyThemesTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "lookup_survey_themes",
      description:
        "The Operational Excellence survey (fielded October 2025; 113 faculty/staff + 54 student respondents): the questions asked, summarized themes, and sub-themes per question-cluster. Use for 'what did the faculty/staff survey say', 'what are people asking for', 'what are the biggest pain points'. Call with no arguments for the full theme map; pass audience + cluster for one cluster's detail including representative verbatim quotes. For which PROJECTS the survey demand points at, use list_survey_candidate_projects instead.",
      parameters: {
        type: "object",
        properties: {
          audience: {
            type: "string",
            description: "Optional: 'faculty' (includes staff) or 'student'.",
          },
          cluster: {
            type: "string",
            description:
              "Optional cluster key for one cluster's full detail (requires audience). Faculty: processes, data-tools, talent, collaboration, additional. Student: processes, data-access, technology, collaboration, additional.",
          },
        },
        additionalProperties: false,
      },
    },
  },
  async execute(rawArgs): Promise<ToolResult> {
    const audience = pickString(rawArgs, "audience") as SurveyAudience | undefined;
    const clusterKey = pickString(rawArgs, "cluster") as SurveyClusterKey | undefined;

    if (audience && clusterKey) {
      const cluster = getCluster(audience, clusterKey);
      if (!cluster) {
        return {
          data: { found: false, audience, cluster: clusterKey },
          canonicalUrl: CANONICAL_URL,
        };
      }
      return {
        data: {
          found: true,
          audience,
          cluster: cluster.key,
          label: cluster.label,
          question: cluster.question,
          summary: cluster.summary,
          subThemes: cluster.subThemes,
          responseCount: responseCount(audience, clusterKey),
          featuredVerbatims: featuredFor(audience, clusterKey).map((r) => r.text),
        },
        canonicalUrl: CANONICAL_URL,
      };
    }

    const audiences = audience ? [audience] : AUDIENCES;
    return {
      data: {
        survey: OPERATIONAL_EXCELLENCE_META,
        clusters: audiences.flatMap((a) =>
          clustersFor(a).map((c) => ({
            audience: a,
            cluster: c.key,
            label: c.label,
            question: c.question,
            summary: c.summary,
            subThemes: c.subThemes.map((s) => s.label),
            responseCount: responseCount(a, c.key),
          }))
        ),
      },
      canonicalUrl: CANONICAL_URL,
    };
  },
};
