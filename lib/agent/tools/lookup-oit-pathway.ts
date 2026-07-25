// lookup_oit_pathway — the OIT deployment process for teams building
// outside OIT, and which of our projects have entered it.
//
// This is the "has this been through OIT's process?" tool. The pathway
// data (lib/oit-pathway.ts) is a typed reading of two OIT wiki drafts:
// the Enterprise AI Development Framework (tech standards) and the
// AI-Assisted Builder Guide (the six-stage process). Before this tool
// existed the agent had no way to answer pathway questions and refused
// them — the data was only reachable by browsing /coordination/oit-pathway.
//
// Positions are stated as "entering Stage N", never as approvals. The
// source module is careful about that distinction and so is this tool:
// a project on the pathway has not been blessed by OIT, it has entered
// a process with gates it has not yet passed.

import "server-only";
import {
  IN_SCOPE_TRIGGERS,
  OIT_SOURCE_DOCS,
  OUT_OF_SCOPE_EXAMPLES,
  PATHWAY_MILESTONES,
  PATHWAY_PROJECTS,
  PATHWAY_RULES,
  PATHWAY_STAGES,
} from "@/lib/oit-pathway";
import type { ToolHandler, ToolResult } from "./registry";

const CANONICAL_URL = "/coordination/oit-pathway";

function pickString(
  args: Record<string, unknown>,
  key: string,
): string | undefined {
  const v = args[key];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

export const lookupOitPathwayTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "lookup_oit_pathway",
      description:
        "The OIT deployment pathway for teams building outside OIT, and which IIDS projects have entered it. Use for: 'what projects have been initiated within OIT's process', 'has X gone through OIT', 'what does OIT require before deployment', 'what are the stages/gates', 'is X in scope for the framework'. Returns the six-stage lifecycle with its gates, the six standing rules, the scope triggers that pull a project in, and each project's position with the questions its gates will ask. IMPORTANT: a project on the pathway has ENTERED a process, not passed it — never describe a position as an approval, and never assert a project has cleared a gate unless the position says so.",
      parameters: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description:
              "Optional portfolio slug (e.g. 'openera', 'ucm-daily-register') to return just that project's pathway position and gate questions. Omit for the whole pathway plus every project on it.",
          },
        },
        additionalProperties: false,
      },
    },
  },
  async execute(rawArgs): Promise<ToolResult> {
    const slug = pickString(rawArgs, "slug");

    const projects = slug
      ? PATHWAY_PROJECTS.filter((p) => p.slug === slug)
      : PATHWAY_PROJECTS;

    const projectPayload = projects.map((p) => ({
      slug: p.slug,
      name: p.name,
      portfolioUrl: `/portfolio/${p.slug}`,
      whyInScope: p.scopeTrigger,
      position: p.position,
      standingFacts: p.standingFacts,
      questionsItsGatesWillAsk: p.gateQuestions,
    }));

    // A slug lookup that matches nothing is a real answer ("that project
    // is not on the pathway"), not an error — the model needs the full
    // roster to say so accurately.
    const notOnPathway = slug !== undefined && projects.length === 0;

    return {
      data: {
        note: "Positions describe entry into a process with gates, not approval. No project below has cleared its gates.",
        projectsOnPathway: projectPayload,
        ...(notOnPathway
          ? {
              lookupResult: `No project with slug "${slug}" has entered the OIT pathway.`,
              projectsCurrentlyOnPathway: PATHWAY_PROJECTS.map((p) => p.slug),
            }
          : {}),
        totalProjectsOnPathway: PATHWAY_PROJECTS.length,
        lifecycle: PATHWAY_STAGES.map((s) => ({
          stage: s.number,
          name: s.name,
          ledBy: s.ledBy,
          summary: s.summary,
          gate: s.gate ?? null,
        })),
        operatingMilestones: PATHWAY_MILESTONES.map((m) => ({
          id: m.id,
          stage: m.stage,
          name: m.name,
          ledBy: m.ledBy,
          summary: m.summary,
          completeWhen: m.completeWhen,
          boundary: m.boundary,
          openQuestions: m.openQuestions ?? [],
        })),
        standingRules: PATHWAY_RULES,
        inScopeTriggers: IN_SCOPE_TRIGGERS,
        outOfScopeExamples: OUT_OF_SCOPE_EXAMPLES,
        sourceDocuments: OIT_SOURCE_DOCS,
      },
      canonicalUrl: CANONICAL_URL,
      links: projects.map((p) => ({
        label: p.name,
        url: `/portfolio/${p.slug}`,
      })),
    };
  },
};
