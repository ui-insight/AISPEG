// get_issue — fetch one GitHub issue by number, including its body.

import "server-only";
import { fetchIssue } from "@/lib/github";
import type { ToolHandler, ToolResult } from "./registry";

const BODY_EXCERPT_CHARS = 1500;

export const getIssueTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "get_issue",
      description:
        "Fetch one GitHub issue by number from the IIDS site repository (ui-insight/AISPEG). Returns title, state, labels, milestone, body excerpt, and the canonical GitHub URL.",
      parameters: {
        type: "object",
        properties: {
          number: {
            type: "integer",
            description: "The issue number (positive integer).",
          },
        },
        required: ["number"],
        additionalProperties: false,
      },
    },
  },
  async execute(rawArgs): Promise<ToolResult> {
    const numberRaw = rawArgs.number;
    const number =
      typeof numberRaw === "number"
        ? numberRaw
        : typeof numberRaw === "string"
          ? Number.parseInt(numberRaw, 10)
          : NaN;
    if (!Number.isFinite(number) || number <= 0) {
      return {
        data: { error: "number is required and must be a positive integer" },
        canonicalUrl: "https://github.com/ui-insight/AISPEG/issues",
      };
    }

    const issue = await fetchIssue(number);
    if (!issue) {
      return {
        data: { found: false, number },
        canonicalUrl: `https://github.com/ui-insight/AISPEG/issues/${number}`,
      };
    }
    const body = issue.body ?? null;
    return {
      data: {
        found: true,
        number: issue.number,
        title: issue.title,
        state: issue.state,
        labels: issue.labels.map((l) => l.name),
        milestone: issue.milestone?.title ?? null,
        createdAt: issue.created_at,
        bodyExcerpt:
          body && body.length > BODY_EXCERPT_CHARS
            ? body.slice(0, BODY_EXCERPT_CHARS) + "…"
            : body,
        url: issue.html_url,
      },
      canonicalUrl: issue.html_url,
    };
  },
};
