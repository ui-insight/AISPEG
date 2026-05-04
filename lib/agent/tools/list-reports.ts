// list_reports — reverse-chronological feed of artifacts on /reports.
// Covers activity reports, briefs, and external presentations.

import "server-only";
import { artifacts, type ArtifactKind } from "@/lib/artifacts";
import type { ToolHandler, ToolResult } from "./registry";

const KINDS: ArtifactKind[] = ["activity-report", "brief", "presentation"];

function pickString(args: Record<string, unknown>, key: string): string | undefined {
  const v = args[key];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

export const listReportsTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "list_reports",
      description:
        "Return the reverse-chronological feed of public reports — written briefs, activity reports, and external presentations. Use this for 'what has IIDS published?', 'what's the latest report?', or 'show me the activity reports'.",
      parameters: {
        type: "object",
        properties: {
          kind: {
            type: "string",
            enum: KINDS,
            description:
              "Restrict to one kind (activity-report, brief, presentation). Omit to include all.",
          },
          limit: {
            type: "integer",
            description: "Maximum reports to return. Default 10, max 30.",
          },
        },
        additionalProperties: false,
      },
    },
  },
  async execute(rawArgs): Promise<ToolResult> {
    const kind = pickString(rawArgs, "kind");
    const limitRaw = rawArgs.limit;
    const limit =
      typeof limitRaw === "number" && Number.isFinite(limitRaw)
        ? Math.min(Math.max(1, limitRaw), 30)
        : 10;

    const filtered = kind ? artifacts.filter((a) => a.kind === kind) : artifacts;
    const sorted = [...filtered].sort((a, b) => b.dateIso.localeCompare(a.dateIso));
    const trimmed = sorted.slice(0, limit);

    return {
      data: {
        totalMatched: filtered.length,
        returned: trimmed.length,
        reports: trimmed.map((a) => ({
          slug: a.slug,
          kind: a.kind,
          title: a.title,
          subtitle: a.subtitle ?? null,
          audience: a.audience,
          dateLabel: a.dateLabel,
          dateIso: a.dateIso,
          author: a.author,
          tags: a.tags ?? [],
          url: a.href,
          external: a.external ?? false,
        })),
      },
      canonicalUrl: "/reports",
      links: trimmed
        .filter((a) => a.href.startsWith("/"))
        .map((a) => ({ label: a.title, url: a.href })),
    };
  },
};
