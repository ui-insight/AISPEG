// get_project_status — the freshest status narrative for one project,
// synced from the IIDS-AI4UI ClickUp space (ADR 0004). Complements
// lookup_portfolio_entry (static registry record) with the dated,
// generated status summary, the ROI estimate, and projected completion.
//
// Public-safe by construction: only the MindRouter-generated summary is
// passed through — the verbatim comment timeline (`updates`) is
// internal-only and never reaches the model here.

import "server-only";
import { getProjectStatusBySlug, getLastSync } from "@/lib/clickup-data";
import type { ToolHandler, ToolResult } from "./registry";

function pickString(args: Record<string, unknown>, key: string): string | undefined {
  const v = args[key];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

export const getProjectStatusTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "get_project_status",
      description:
        "Fetch the latest synced status for a single project: a dated public status summary, the estimated capacity returned (ROI in FTE), projected completion, and sync freshness. Sourced from the IIDS project-management workspace, so it is fresher than the registry description. Use for 'what's the latest on X', 'how is X going', 'when will X be done', or 'what's the ROI estimate for X'. Not every project is tracked there — a not-found result means no synced status exists, not that the project doesn't exist (fall back to lookup_portfolio_entry).",
      parameters: {
        type: "object",
        properties: {
          slug: {
            type: "string",
            description:
              "The project's URL slug (e.g. 'invoice-processing', 'openera'). Use the slug returned by search_portfolio.",
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
      return { data: { error: "slug is required" }, canonicalUrl: "/portfolio" };
    }
    const [status, lastSync] = await Promise.all([
      getProjectStatusBySlug(slug),
      getLastSync(),
    ]);
    if (!status) {
      return {
        data: {
          found: false,
          slug,
          note: "No synced project-management status for this slug. The registry record (lookup_portfolio_entry) may still exist.",
        },
        canonicalUrl: `/portfolio/${slug}`,
      };
    }
    return {
      data: {
        found: true,
        slug: status.slug,
        statusSummary: status.statusSummary,
        statusSummaryAt: status.statusSummaryAt,
        roiFte: status.roiFte,
        roiExplanation: status.roiExplanation,
        projectedCompletion: status.projectedCompletion,
        businessUnit: status.businessUnit,
        syncedAt: status.syncedAt,
        lastSyncAt: lastSync?.finishedAt ?? null,
      },
      canonicalUrl: `/portfolio/${status.slug}`,
    };
  },
};
