// search_blockers — filter active blockers by category, severity, or
// named party. Public_text only.

import "server-only";
import { listApplications } from "@/lib/work";
import type {
  Blocker,
  BlockerCategory,
  BlockerSeverity,
} from "@/lib/work";
import type { ToolHandler, ToolResult } from "./registry";

const BLOCKER_CATEGORIES: BlockerCategory[] = [
  "oit-review",
  "oit-standards",
  "unit-engagement",
  "legal-embargo",
  "hardware-procurement",
  "funding",
  "data-governance",
  "compliance",
  "personnel",
  "iids-capacity",
  "inter-unit-politics",
  "communications",
  "external-partner",
  "faculty-governance",
];

const BLOCKER_SEVERITIES: BlockerSeverity[] = ["low", "medium", "high"];

function pickString(args: Record<string, unknown>, key: string): string | undefined {
  const v = args[key];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

export const searchBlockersTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "search_blockers",
      description:
        "Filter active (unresolved) blockers across the portfolio by category, severity, or named-party substring. Returns public-tier text only.",
      parameters: {
        type: "object",
        properties: {
          category: {
            type: "string",
            enum: BLOCKER_CATEGORIES,
            description:
              "Restrict to one blocker category (e.g. 'oit-review', 'data-governance', 'funding').",
          },
          severity: {
            type: "string",
            enum: BLOCKER_SEVERITIES,
            description: "Restrict to one severity level.",
          },
          namedParty: {
            type: "string",
            description:
              "Case-insensitive substring match against the named party (an office or person blocking the work).",
          },
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
    const category = pickString(rawArgs, "category");
    const severity = pickString(rawArgs, "severity");
    const namedParty = pickString(rawArgs, "namedParty");
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
      namedParty: string | null;
    };
    const rows: Row[] = [];
    for (const app of apps) {
      for (const b of app.activeBlockers) {
        if (category && b.category !== category) continue;
        if (severity && b.severity !== severity) continue;
        if (namedParty) {
          if (
            !b.namedParty ||
            !b.namedParty.toLowerCase().includes(namedParty.toLowerCase())
          ) {
            continue;
          }
        }
        rows.push({
          projectSlug: app.slug,
          projectName: app.name,
          projectUrl: `/portfolio/${app.slug}`,
          category: b.category,
          severity: b.severity,
          since: b.since,
          publicText: b.publicText,
          namedParty: b.namedParty,
        });
      }
    }

    rows.sort((a, b) => a.since.localeCompare(b.since));
    const trimmed = rows.slice(0, limit);
    const projectSlugs = Array.from(new Set(trimmed.map((r) => r.projectSlug)));

    return {
      data: {
        filters: { category, severity, namedParty },
        totalMatched: rows.length,
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
