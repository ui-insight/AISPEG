// list_requested_projects — the scored intake backlog: project requests
// awaiting a start decision, each scored on the public 11-criterion
// rubric (ADR 0004; rendered at /portfolio/pipeline). Lets the agent
// answer "what has been requested", "what's in the queue", and "how are
// requests prioritized".
//
// Submitter names are deliberately omitted — the pipeline surface shows
// unit and category, not individuals, and the tool mirrors the surface.

import "server-only";
import {
  listScoredRequests,
  getLastSync,
  type RequestStatus,
} from "@/lib/clickup-data";
import type { ToolHandler, ToolResult } from "./registry";

const STATUSES: RequestStatus[] = ["pending", "active", "rejected", "complete"];

function pickString(args: Record<string, unknown>, key: string): string | undefined {
  const v = args[key];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

export const listRequestedProjectsTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "list_requested_projects",
      description:
        "List requested AI projects in the intake backlog, scored on the public 11-criterion prioritization rubric (strategic impact, feasibility/effort, urgency/buy-in; weighted 0-100). Use for 'what projects have been requested', 'what's waiting to start', 'what's the highest-priority request', or 'has anyone asked for X'. Statuses: pending (in review), active (promoted to a project), rejected (not pursued), complete.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            description:
              "Optional filter. One of: pending, active, rejected, complete. Omit to return all, grouped by status.",
          },
        },
        additionalProperties: false,
      },
    },
  },
  async execute(rawArgs): Promise<ToolResult> {
    const statusFilter = pickString(rawArgs, "status") as RequestStatus | undefined;
    const [requests, lastSync] = await Promise.all([
      listScoredRequests(),
      getLastSync(),
    ]);

    const filtered =
      statusFilter && STATUSES.includes(statusFilter)
        ? requests.filter((r) => r.status === statusFilter)
        : requests;

    const rows = [...filtered]
      .sort((a, b) => (b.weightedScore ?? -1) - (a.weightedScore ?? -1))
      .map((r) => ({
        name: r.name,
        status: r.status,
        unit: r.unit,
        category: r.category,
        feasibility: r.feasibility,
        weightedScore: r.weightedScore,
        requested: r.dateCreated,
      }));

    const countsByStatus: Record<RequestStatus, number> = {
      pending: 0,
      active: 0,
      rejected: 0,
      complete: 0,
    };
    for (const r of requests) countsByStatus[r.status] += 1;

    return {
      data: {
        total: requests.length,
        countsByStatus,
        returned: rows.length,
        requests: rows,
        lastSyncAt: lastSync?.finishedAt ?? null,
      },
      canonicalUrl: "/portfolio/pipeline",
    };
  },
};
