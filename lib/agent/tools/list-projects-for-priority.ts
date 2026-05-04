// list_projects_for_priority — reverse lookup: which portfolio projects
// have declared alignment with a given strategic-plan priority?

import "server-only";
import { getProjectsForPriority } from "@/lib/strategic-plan/project-alignment";
import { getPriority } from "@/lib/strategic-plan/catalog";
import type { ToolHandler, ToolResult } from "./registry";

function pickString(args: Record<string, unknown>, key: string): string | undefined {
  const v = args[key];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

export const listProjectsForPriorityTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "list_projects_for_priority",
      description:
        "Return the portfolio projects that have declared alignment with a given Strategic Plan priority code. Useful for 'which projects advance priority A.1?' or 'who's working on student success goals?'",
      parameters: {
        type: "object",
        properties: {
          code: {
            type: "string",
            description: "Priority code (e.g. 'A.1', 'D.3').",
          },
        },
        required: ["code"],
        additionalProperties: false,
      },
    },
  },
  async execute(rawArgs): Promise<ToolResult> {
    const codeRaw = pickString(rawArgs, "code");
    if (!codeRaw) {
      return {
        data: { error: "code is required" },
        canonicalUrl: "/standards/strategic-plan",
      };
    }
    const code = codeRaw.toUpperCase();
    const priority = getPriority(code);
    if (!priority) {
      return {
        data: { found: false, code },
        canonicalUrl: "/standards/strategic-plan",
      };
    }
    const aligned = getProjectsForPriority(code);
    const priorityUrl = `/standards/strategic-plan/priorities/${code}`;
    return {
      data: {
        found: true,
        priority: { code: priority.code, text: priority.text, pillar: priority.pillar },
        totalAligned: aligned.length,
        projects: aligned.map((p) => ({
          slug: p.slug,
          name: p.name,
          tagline: p.tagline,
          status: p.status,
          homeUnits: p.homeUnits,
          ownerNames: p.ownerNames,
          url: `/portfolio/${p.slug}`,
        })),
        priorityUrl,
      },
      canonicalUrl: priorityUrl,
      links: aligned.map((p) => ({ label: p.name, url: `/portfolio/${p.slug}` })),
    };
  },
};
