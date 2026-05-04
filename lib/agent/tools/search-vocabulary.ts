// search_vocabulary — find controlled-vocabulary groups by domain or
// by value. Returns matching groups with their values and canonical URLs.

import "server-only";
import { vocabularyGroups } from "@/lib/governance/vocabularies";
import type { ToolHandler, ToolResult } from "./registry";

const MAX_RESULTS = 10;

function pickString(args: Record<string, unknown>, key: string): string | undefined {
  const v = args[key];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

function matches(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

export const searchVocabularyTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "search_vocabulary",
      description:
        "Search controlled-vocabulary groups across the AI4RA Unified Data Model. Match by domain (e.g. 'audit', 'openera'), group name, or value code/label. Returns matching groups with all their values and the canonical /standards/data-model/vocabularies URL.",
      parameters: {
        type: "object",
        properties: {
          domain: {
            type: "string",
            description:
              "Substring match against the vocabulary's domain (e.g. 'audit', 'openera', 'ucm').",
          },
          group: {
            type: "string",
            description:
              "Substring match against the group name (e.g. 'ReportType', 'ObservationStatus').",
          },
          value: {
            type: "string",
            description:
              "Substring match against any value's code or label inside the group.",
          },
        },
        additionalProperties: false,
      },
    },
  },
  async execute(rawArgs): Promise<ToolResult> {
    const domain = pickString(rawArgs, "domain");
    const group = pickString(rawArgs, "group");
    const value = pickString(rawArgs, "value");

    if (!domain && !group && !value) {
      return {
        data: {
          error:
            "At least one of domain, group, or value is required to avoid dumping the entire vocabulary catalog.",
        },
        canonicalUrl: "/standards/data-model/vocabularies",
      };
    }

    const matched = vocabularyGroups.filter((g) => {
      if (domain && !matches(g.domain, domain)) return false;
      if (group && !matches(g.group, group)) return false;
      if (value) {
        const hit = g.values.some(
          (v) => matches(v.code, value) || matches(v.label, value)
        );
        if (!hit) return false;
      }
      return true;
    });

    const trimmed = matched.slice(0, MAX_RESULTS);

    return {
      data: {
        totalMatched: matched.length,
        returned: trimmed.length,
        groups: trimmed.map((g) => ({
          domain: g.domain,
          application: g.application,
          group: g.group,
          description: g.description ?? null,
          values: g.values,
          url: `/standards/data-model/vocabularies/${g.domain}/${g.group}`,
        })),
      },
      canonicalUrl: "/standards/data-model/vocabularies",
      links: trimmed.map((g) => ({
        label: `${g.domain}/${g.group}`,
        url: `/standards/data-model/vocabularies/${g.domain}/${g.group}`,
      })),
    };
  },
};
