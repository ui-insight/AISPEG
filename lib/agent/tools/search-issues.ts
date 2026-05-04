// search_issues — case-insensitive substring search across GitHub issue
// titles in the AISPEG repo. Uses the same cached fetchIssues() backing
// list_open_issues / get_issue.

import "server-only";
import { fetchIssues, type GitHubIssue } from "@/lib/github";
import type { ToolHandler, ToolResult } from "./registry";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 30;

function pickString(args: Record<string, unknown>, key: string): string | undefined {
  const v = args[key];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

function summarize(issue: GitHubIssue) {
  return {
    number: issue.number,
    title: issue.title,
    state: issue.state,
    labels: issue.labels.map((l) => l.name),
    milestone: issue.milestone?.title ?? null,
    createdAt: issue.created_at,
    url: issue.html_url,
  };
}

export const searchIssuesTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "search_issues",
      description:
        "Search GitHub issues in the IIDS site repository (ui-insight/AISPEG) by title substring. Includes both open and closed issues by default; restrict with the `state` filter.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Required. Case-insensitive substring matched against issue titles.",
          },
          state: {
            type: "string",
            enum: ["open", "closed", "all"],
            description: "Restrict by issue state. Defaults to 'all'.",
          },
          limit: {
            type: "integer",
            description: `Maximum issues to return. Default ${DEFAULT_LIMIT}, max ${MAX_LIMIT}.`,
          },
        },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },
  async execute(rawArgs): Promise<ToolResult> {
    const query = pickString(rawArgs, "query");
    if (!query) {
      return {
        data: { error: "query is required" },
        canonicalUrl: "https://github.com/ui-insight/AISPEG/issues",
      };
    }
    const stateRaw = pickString(rawArgs, "state");
    const state = stateRaw === "open" || stateRaw === "closed" ? stateRaw : "all";
    const limitRaw = rawArgs.limit;
    const limit =
      typeof limitRaw === "number" && Number.isFinite(limitRaw)
        ? Math.min(Math.max(1, limitRaw), MAX_LIMIT)
        : DEFAULT_LIMIT;

    const all = await fetchIssues();
    const filtered = all.filter((i) => {
      if (state !== "all" && i.state !== state) return false;
      return i.title.toLowerCase().includes(query.toLowerCase());
    });
    const trimmed = filtered.slice(0, limit);

    return {
      data: {
        query,
        state,
        totalMatched: filtered.length,
        returned: trimmed.length,
        issues: trimmed.map(summarize),
      },
      canonicalUrl: "https://github.com/ui-insight/AISPEG/issues",
      links: trimmed.map((i) => ({
        label: `#${i.number} ${i.title.slice(0, 60)}`,
        url: i.html_url,
      })),
    };
  },
};
