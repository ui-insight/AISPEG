// get_standard — full detail for one ledger item by id (e.g. 'i-1', 'ii-7').

import "server-only";
import { daysSince, standardsWatch } from "@/lib/standards-watch";
import type { ToolHandler, ToolResult } from "./registry";

function pickString(args: Record<string, unknown>, key: string): string | undefined {
  const v = args[key];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

export const getStandardTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "get_standard",
      description:
        "Fetch the full text of one standards-ledger item by id. Returns title, full bullet-point detail, status, date requested, and days open. Use after list_standards has surfaced relevant ids.",
      parameters: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description:
              "The ledger id (e.g. 'i-1' for the first Agenda I item, 'ii-3' for the third Agenda II item).",
          },
        },
        required: ["id"],
        additionalProperties: false,
      },
    },
  },
  async execute(rawArgs): Promise<ToolResult> {
    const id = pickString(rawArgs, "id");
    if (!id) {
      return {
        data: { error: "id is required" },
        canonicalUrl: "/standards",
      };
    }
    const item = standardsWatch.find((s) => s.id === id);
    if (!item) {
      return {
        data: { found: false, id },
        canonicalUrl: "/standards",
      };
    }
    return {
      data: {
        found: true,
        id: item.id,
        agenda: item.agenda,
        title: item.title,
        details: item.details,
        status: item.status,
        dateRequested: item.dateRequested,
        daysOpen: daysSince(item.dateRequested),
        responseUrl: item.responseUrl ?? null,
        responseNote: item.responseNote ?? null,
      },
      canonicalUrl: "/standards",
    };
  },
};
