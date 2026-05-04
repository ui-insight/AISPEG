// list_standards — the IIDS standards-watch ledger, optionally filtered
// by status. The /standards page is the canonical surface; everything
// else links into it.

import "server-only";
import {
  daysSince,
  standardsWatch,
  type StandardsWatchStatus,
} from "@/lib/standards-watch";
import type { ToolHandler, ToolResult } from "./registry";

const STATUS_VALUES: StandardsWatchStatus[] = [
  "requested",
  "acknowledged",
  "in-draft",
  "published",
];

function pickString(args: Record<string, unknown>, key: string): string | undefined {
  const v = args[key];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

export const listStandardsTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "list_standards",
      description:
        "Return the IIDS standards-watch ledger — items IIDS has formally requested from OIT, with their current status and how long they've been outstanding. Use this for questions about institutional software / UX standards, what's been requested, or what's still pending.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: STATUS_VALUES,
            description:
              "Restrict to one status (requested, acknowledged, in-draft, published). Omit to list everything.",
          },
        },
        additionalProperties: false,
      },
    },
  },
  async execute(rawArgs): Promise<ToolResult> {
    const status = pickString(rawArgs, "status");
    const filtered = status
      ? standardsWatch.filter((s) => s.status === status)
      : standardsWatch;

    return {
      data: {
        totalLedger: standardsWatch.length,
        returned: filtered.length,
        items: filtered.map((s) => ({
          id: s.id,
          agenda: s.agenda,
          title: s.title,
          status: s.status,
          dateRequested: s.dateRequested,
          daysOpen: daysSince(s.dateRequested),
          responseUrl: s.responseUrl ?? null,
        })),
      },
      canonicalUrl: "/standards",
    };
  },
};
