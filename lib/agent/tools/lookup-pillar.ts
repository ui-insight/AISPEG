// lookup_pillar — strategic-plan pillar by code (A, B, C, D, E).
// Sourced from the vendored strategic-plan catalog.

import "server-only";
import { pillars, getPillar } from "@/lib/strategic-plan/catalog";
import type { ToolHandler, ToolResult } from "./registry";

function pickString(args: Record<string, unknown>, key: string): string | undefined {
  const v = args[key];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

export const lookupPillarTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "lookup_pillar",
      description:
        "Fetch one University of Idaho Strategic Plan pillar by code. Returns name and the priorities it contains. Codes are single letters: A (Ignite Student Success), B, C, D, E. Use list_site_areas if you don't know the codes.",
      parameters: {
        type: "object",
        properties: {
          code: {
            type: "string",
            description: "Pillar code: a single uppercase letter A through E.",
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
          availableCodes: pillars.map((p) => p.code),
        },
        canonicalUrl: "/standards/strategic-plan",
      };
    }
    const code = codeRaw.toUpperCase();
    const pillar = getPillar(code);
    if (!pillar) {
      return {
        data: {
          found: false,
          code,
          availableCodes: pillars.map((p) => p.code),
        },
        canonicalUrl: "/standards/strategic-plan",
      };
    }
    return {
      data: {
        found: true,
        code: pillar.code,
        name: pillar.name,
        priorities: pillar.priorities,
        url: `/standards/strategic-plan/pillars/${pillar.code}`,
      },
      canonicalUrl: `/standards/strategic-plan/pillars/${pillar.code}`,
    };
  },
};
