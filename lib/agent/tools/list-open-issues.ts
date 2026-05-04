// list_open_issues — open GitHub issues from the AISPEG repo, optionally
// filtered by label substring. Backed by lib/github.ts (Next ISR-cached
// 5min) so repeated calls in the same window are cheap.

import "server-only";
import { fetchIssues, type GitHubIssue } from "@/lib/github";
import type { ToolHandler, ToolResult } from "./registry";

const DEFAULT_LIMIT = 15;
const MAX_LIMIT = 50;

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

export const listOpenIssuesTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "list_open_issues",
      description:
        "Return open GitHub issues from the IIDS site repository (ui-insight/AISPEG). Optionally filter by label substring. Use for 'what's tracked as open work?' or 'what bugs are open?'",
      parameters: {
        type: "object",
        properties: {
          label: {
            type: "string",
            description:
              "Optional case-insensitive substring match against label names (e.g. 'bug', 'agent', 'priority-medium').",
          },
          limit: {
            type: "integer",
            description: `Maximum issues to return. Default ${DEFAULT_LIMIT}, max ${MAX_LIMIT}.`,
          },
        },
        additionalProperties: false,
      },
    },
  },
  async execute(rawArgs): Promise<ToolResult> {
    const label = pickString(rawArgs, "label");
    const limitRaw = rawArgs.limit;
    const limit =
      typeof limitRaw === "number" && Number.isFinite(limitRaw)
        ? Math.min(Math.max(1, limitRaw), MAX_LIMIT)
        : DEFAULT_LIMIT;

    const all = await fetchIssues();
    const open = all.filter((i) => i.state === "open");
    const matched = label
      ? open.filter((i) =>
          i.labels.some((l) => l.name.toLowerCase().includes(label.toLowerCase()))
        )
      : open;
    const trimmed = matched.slice(0, limit);

    return {
      data: {
        repo: "ui-insight/AISPEG",
        totalOpen: open.length,
        totalMatched: matched.length,
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
