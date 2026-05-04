// list_active_blockers — every unresolved blocker across the portfolio.
// Public_text only; internal_text is reserved for the auth-gated agent
// in slice #109.

import "server-only";
import { listApplications } from "@/lib/work";
import type { Blocker } from "@/lib/work";
import type { ToolHandler, ToolResult } from "./registry";

export const listActiveBlockersTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "list_active_blockers",
      description:
        "Return every unresolved blocker across the IIDS portfolio, with project context. Useful for 'what's blocking IIDS work?' or 'where are we waiting?' Returns public-tier text only — sensitive internal commentary is excluded.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "integer",
            description: "Maximum blockers to return. Default 25, max 50.",
          },
        },
        additionalProperties: false,
      },
    },
  },
  async execute(rawArgs, ctx): Promise<ToolResult> {
    const limitRaw = rawArgs.limit;
    const limit =
      typeof limitRaw === "number" && Number.isFinite(limitRaw)
        ? Math.min(Math.max(1, limitRaw), 50)
        : 25;

    const apps = await listApplications({ audience: ctx.audience });
    type Row = Pick<Blocker, "category" | "severity" | "since" | "publicText"> & {
      projectSlug: string;
      projectName: string;
      projectUrl: string;
    };
    const rows: Row[] = [];
    for (const app of apps) {
      for (const b of app.activeBlockers) {
        rows.push({
          projectSlug: app.slug,
          projectName: app.name,
          projectUrl: `/portfolio/${app.slug}`,
          category: b.category,
          severity: b.severity,
          since: b.since,
          publicText: b.publicText,
        });
      }
    }

    rows.sort((a, b) => a.since.localeCompare(b.since));
    const trimmed = rows.slice(0, limit);
    const projectSlugs = Array.from(new Set(trimmed.map((r) => r.projectSlug)));

    return {
      data: {
        totalActive: rows.length,
        returned: trimmed.length,
        blockers: trimmed,
      },
      canonicalUrl: "/portfolio",
      links: projectSlugs.map((slug) => {
        const row = trimmed.find((r) => r.projectSlug === slug)!;
        return { label: row.projectName, url: row.projectUrl };
      }),
    };
  },
};
