// lookup_oit_portfolio — OIT's own FY2027 Enterprise Applications
// portfolio, and the rows it shares with our inventory.
//
// This answers "what is OIT working on" and "how does our work line up
// with theirs" — questions the portfolio tools cannot, because OIT's
// rows are not our projects. lib/oit-ea-portfolio.ts keeps OIT's columns
// in OIT's vocabulary (priority, owning team, TPM, effort by discipline)
// rather than folding them into ours.
//
// The crosswalk is deliberately conservative: only three of 61 rows are
// linked, each with an owner-affirmed note. Subject-matter adjacency is
// not evidence two rows are the same project (owner decision, July 2026),
// and the tool says so in-band so the model does not "helpfully" pair up
// projects that merely sound related.

import "server-only";
import {
  CROSSWALK_CONFIDENCE_LABELS,
  OIT_EA_PROJECTS,
  SOURCE_AS_OF,
  SOURCE_FISCAL_YEAR,
  crosswalkedProjects,
  priorityCounts,
  surfaceLinkedProjects,
  teamCounts,
  type OitEaProject,
} from "@/lib/oit-ea-portfolio";
import type { ToolHandler, ToolResult } from "./registry";

const CANONICAL_URL = "/coordination/oit-portfolio";

function pickString(
  args: Record<string, unknown>,
  key: string,
): string | undefined {
  const v = args[key];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

function serialise(p: OitEaProject) {
  return {
    id: p.id,
    name: p.name,
    priority: p.priority,
    category: p.category,
    primaryTeam: p.primaryTeam,
    tpmOrManager: p.tpmOrManager,
    effort: p.effort,
    notes: p.notes ?? null,
    ourProject: p.portfolioSlug
      ? {
          slug: p.portfolioSlug,
          url: `/portfolio/${p.portfolioSlug}`,
          confidence: p.crosswalkConfidence
            ? CROSSWALK_CONFIDENCE_LABELS[p.crosswalkConfidence]
            : null,
          basis: p.crosswalkNote ?? null,
        }
      : null,
  };
}

export const lookupOitPortfolioTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "lookup_oit_portfolio",
      description: `OIT's own ${SOURCE_FISCAL_YEAR} Enterprise Applications portfolio — what OIT has committed to this fiscal year, in OIT's tracking structure (priority, work category, owning team, TPM/manager, and effort split across TPM / development / administration / systems). Use for: 'what is OIT working on', 'what is OIT's committed load', 'how does our work overlap with OIT's', 'who is the TPM for X'. These are OIT's projects, NOT IIDS projects — use search_portfolio for ours. Only rows carrying an explicit crosswalk are the same work as one of our projects; shared subject matter is NOT evidence of a match, so never claim an OIT row and one of our projects are the same effort unless the row's crosswalk says so.`,
      parameters: {
        type: "object",
        properties: {
          priority: {
            type: "string",
            description:
              "Optional filter: 'Critical', 'High', 'Medium', or 'Low'.",
          },
          team: {
            type: "string",
            description:
              "Optional filter on OIT's primary team, e.g. 'Enterprise Applications', 'Development', 'Systems'.",
          },
          crosswalkedOnly: {
            type: "boolean",
            description:
              "When true, return only the rows confirmed as the same work one of our projects tracks.",
          },
          query: {
            type: "string",
            description:
              "Optional case-insensitive substring match on the OIT project name.",
          },
        },
        additionalProperties: false,
      },
    },
  },
  async execute(rawArgs): Promise<ToolResult> {
    const priority = pickString(rawArgs, "priority");
    const team = pickString(rawArgs, "team");
    const query = pickString(rawArgs, "query")?.toLowerCase();
    const crosswalkedOnly = rawArgs.crosswalkedOnly === true;

    let rows: OitEaProject[] = [...OIT_EA_PROJECTS];
    if (crosswalkedOnly) rows = rows.filter((p) => p.portfolioSlug);
    if (priority) {
      rows = rows.filter(
        (p) => p.priority.toLowerCase() === priority.toLowerCase(),
      );
    }
    if (team) {
      rows = rows.filter(
        (p) => p.primaryTeam.toLowerCase() === team.toLowerCase(),
      );
    }
    if (query) {
      rows = rows.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          (p.sourceName?.toLowerCase().includes(query) ?? false),
      );
    }

    return {
      data: {
        fiscalYear: SOURCE_FISCAL_YEAR,
        sourceAsOf: SOURCE_AS_OF,
        note: `Point-in-time transcription of OIT's ${SOURCE_FISCAL_YEAR} portfolio spreadsheet. These are OIT's commitments, not IIDS projects.`,
        crosswalkPolicy:
          "Only rows with an explicit crosswalk are the same work as one of our projects. Subject-matter adjacency is not treated as evidence of a match.",
        totalInPortfolio: OIT_EA_PROJECTS.length,
        totalCrosswalked: crosswalkedProjects().length,
        returned: rows.length,
        projects: rows.map(serialise),
        priorityBreakdown: priorityCounts(),
        teamBreakdown: teamCounts(),
        rowsTouchingOurSurfacesWithoutBeingOurProjects: surfaceLinkedProjects().map(
          (p) => ({
            name: p.name,
            surface: p.relatedSurface?.label ?? null,
            url: p.relatedSurface?.href ?? null,
            note: p.relatedSurface?.note ?? null,
          }),
        ),
      },
      canonicalUrl: CANONICAL_URL,
      links: rows
        .filter((p) => p.portfolioSlug)
        .map((p) => ({
          label: p.name,
          url: `/portfolio/${p.portfolioSlug}`,
        })),
    };
  },
};
