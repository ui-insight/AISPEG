// search_portfolio — first agent tool. Reads the live Postgres portfolio
// via lib/work.ts. Public-tier only at this slice; internal-tier
// expansion is Slice #109.

import "server-only";
import { listApplications } from "@/lib/work";
import type { ToolHandler, ToolResult } from "./registry";

interface SearchArgs {
  query?: string;
  homeUnit?: string;
  status?: string;
  limit?: number;
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 25;

function matches(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function pickString(args: Record<string, unknown>, key: string): string | undefined {
  const v = args[key];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

function pickNumber(args: Record<string, unknown>, key: string): number | undefined {
  const v = args[key];
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

export const searchPortfolioTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "search_portfolio",
      description:
        "Search the live IIDS portfolio of AI projects. Returns projects with their owners, home units, status, and a link to the public project page. Use this for any question about which projects exist, who owns what, what state a project is in, or what IIDS is building.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Optional free-text search across project name, tagline, and description. Omit to list all projects.",
          },
          homeUnit: {
            type: "string",
            description:
              "Optional filter by home unit (e.g. 'IIDS', 'OIT', 'College of Engineering'). Matches case-insensitive substring.",
          },
          status: {
            type: "string",
            description:
              "Optional filter by lifecycle status. One of: idea, approved, building, prototype, piloting, production, maintained, sunsetting, archived, tracked.",
          },
          limit: {
            type: "integer",
            description: `Maximum number of projects to return. Default ${DEFAULT_LIMIT}, max ${MAX_LIMIT}.`,
          },
        },
        additionalProperties: false,
      },
    },
  },
  async execute(rawArgs, ctx): Promise<ToolResult> {
    const args: SearchArgs = {
      query: pickString(rawArgs, "query"),
      homeUnit: pickString(rawArgs, "homeUnit"),
      status: pickString(rawArgs, "status"),
      limit: pickNumber(rawArgs, "limit"),
    };

    const apps = await listApplications({ audience: ctx.audience });
    const limit = Math.min(args.limit ?? DEFAULT_LIMIT, MAX_LIMIT);

    const filtered = apps.filter((a) => {
      if (args.query) {
        const hay = `${a.name} ${a.tagline} ${a.description}`;
        if (!matches(hay, args.query)) return false;
      }
      if (args.homeUnit) {
        if (!a.homeUnits.some((u) => matches(u, args.homeUnit!))) return false;
      }
      if (args.status) {
        if (a.status !== args.status) return false;
      }
      return true;
    });

    const entries = filtered.slice(0, limit).map((a) => ({
      slug: a.slug,
      name: a.name,
      tagline: a.tagline,
      homeUnits: a.homeUnits,
      operationalOwners: a.operationalOwners.map((o) => o.name),
      status: a.status,
      iidsSponsor: a.iidsSponsor || null,
      ai4raRelationship: a.ai4raRelationship,
      url: `/portfolio/${a.slug}`,
      activeBlockerCount: a.activeBlockers.length,
    }));

    return {
      data: {
        totalMatched: filtered.length,
        returned: entries.length,
        entries,
      },
      canonicalUrl: "/portfolio",
      links: entries.map((e) => ({ label: e.name, url: e.url })),
    };
  },
};
