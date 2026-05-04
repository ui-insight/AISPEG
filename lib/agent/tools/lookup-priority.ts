// lookup_priority — strategic-plan priority by code (e.g. A.1, D.3).

import "server-only";
import { getPillar, getPriority, priorities } from "@/lib/strategic-plan/catalog";
import type { ToolHandler, ToolResult } from "./registry";

function pickString(args: Record<string, unknown>, key: string): string | undefined {
  const v = args[key];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

export const lookupPriorityTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "lookup_priority",
      description:
        "Fetch one University of Idaho Strategic Plan priority by code. Returns the full priority text and the parent pillar. Codes have the form 'A.1', 'B.3', etc.",
      parameters: {
        type: "object",
        properties: {
          code: {
            type: "string",
            description:
              "Priority code in the form '<letter>.<number>' (e.g. 'A.1', 'D.3').",
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
        data: {
          error: "code is required",
          availableCodes: priorities.map((p) => p.code),
        },
        canonicalUrl: "/standards/strategic-plan",
      };
    }
    const code = codeRaw.toUpperCase();
    const priority = getPriority(code);
    if (!priority) {
      return {
        data: {
          found: false,
          code,
          availableCodes: priorities.map((p) => p.code),
        },
        canonicalUrl: "/standards/strategic-plan",
      };
    }
    const parent = getPillar(priority.pillar);
    return {
      data: {
        found: true,
        code: priority.code,
        text: priority.text,
        pillar: {
          code: priority.pillar,
          name: parent?.name ?? null,
          url: `/standards/strategic-plan/pillars/${priority.pillar}`,
        },
        url: `/standards/strategic-plan/priorities/${priority.code}`,
      },
      canonicalUrl: `/standards/strategic-plan/priorities/${priority.code}`,
    };
  },
};
