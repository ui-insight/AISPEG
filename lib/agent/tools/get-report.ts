// get_report — full detail (incl. abstract) for one artifact by slug.

import "server-only";
import { artifacts } from "@/lib/artifacts";
import type { ToolHandler, ToolResult } from "./registry";

function pickString(args: Record<string, unknown>, key: string): string | undefined {
  const v = args[key];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

export const getReportTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "get_report",
      description:
        "Fetch full detail for one report or artifact by slug — includes title, abstract, audience, author, date, and the canonical URL. Use after list_reports has surfaced a relevant slug.",
      parameters: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description:
              "The artifact slug (e.g. 'dev-activity-report-feb-2026', 'presidential-brief-feb-2026', 'lovable-vibe-coding-2026').",
          },
        },
        required: ["slug"],
        additionalProperties: false,
      },
    },
  },
  async execute(rawArgs): Promise<ToolResult> {
    const slug = pickString(rawArgs, "slug");
    if (!slug) {
      return {
        data: { error: "slug is required" },
        canonicalUrl: "/reports",
      };
    }
    const item = artifacts.find((a) => a.slug === slug);
    if (!item) {
      return {
        data: { found: false, slug },
        canonicalUrl: "/reports",
      };
    }
    return {
      data: {
        found: true,
        slug: item.slug,
        kind: item.kind,
        title: item.title,
        subtitle: item.subtitle ?? null,
        audience: item.audience,
        dateLabel: item.dateLabel,
        dateIso: item.dateIso,
        author: item.author,
        abstract: item.abstract,
        duration: item.duration ?? null,
        tags: item.tags ?? [],
        url: item.href,
        external: item.external ?? false,
      },
      canonicalUrl: item.href.startsWith("/") ? item.href : "/reports",
    };
  },
};
