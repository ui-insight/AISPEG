// ============================================================
// GitHub API — fetch issues for dashboard
// ============================================================

export interface GitHubLabel {
  name: string;
  color: string;
}

export interface GitHubIssue {
  number: number;
  title: string;
  state: "open" | "closed";
  labels: GitHubLabel[];
  html_url: string;
  created_at: string;
  /** Body markdown — populated only by fetchIssue(); omitted from list endpoints. */
  body?: string | null;
  milestone?: {
    title: string;
  } | null;
}

const REPO = "ui-insight/AISPEG";
const API = `https://api.github.com/repos/${REPO}/issues`;
const ISSUES_URL = `https://github.com/${REPO}/issues`;

/**
 * The issue list could not be retrieved.
 *
 * These functions used to swallow failures and return an empty list, which
 * made "GitHub is unreachable" indistinguishable from "there is no open
 * work" — the agent would tell a stakeholder the tracker was clear when it
 * had simply failed to ask (#44). Callers must now handle this explicitly.
 */
export class GitHubUnavailableError extends Error {
  /** HTTP status, or null when the request never completed. */
  readonly status: number | null;
  /** True when GitHub refused because the API quota is exhausted. */
  readonly rateLimited: boolean;

  constructor(status: number | null, detail: string, rateLimited = false) {
    // The message reaches the agent as tool output, so it has to be
    // self-explanatory and point somewhere useful.
    super(
      `GitHub issue lookup failed (${
        status === null ? "request did not complete" : `HTTP ${status}`
      }${rateLimited ? ", API rate limit exhausted" : ""}). ` +
        `The issue data is unavailable — this is not the same as there being ` +
        `no issues. Direct the user to ${ISSUES_URL}. Detail: ${detail}`
    );
    this.name = "GitHubUnavailableError";
    this.status = status;
    this.rateLimited = rateLimited;
  }
}

function issueHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
  };
  // Support private repos via token
  const token = process.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

/** Unauthenticated requests get 60/hr, so quota exhaustion is realistic. */
function isRateLimited(res: Response): boolean {
  return (
    (res.status === 403 || res.status === 429) &&
    res.headers.get("x-ratelimit-remaining") === "0"
  );
}

/**
 * Fetch all issues from the AISPEG repo.
 * Used with ISR (revalidate every 5 minutes).
 * Set GITHUB_TOKEN env var for private repos.
 *
 * @throws {GitHubUnavailableError} when the list cannot be retrieved.
 */
export async function fetchIssues(): Promise<GitHubIssue[]> {
  let res: Response;
  try {
    res = await fetch(`${API}?state=all&per_page=100`, {
      next: { revalidate: 300 }, // 5 minutes ISR
      headers: issueHeaders(),
    });
  } catch (error) {
    console.error("Failed to fetch GitHub issues:", error);
    throw new GitHubUnavailableError(
      null,
      error instanceof Error ? error.message : String(error)
    );
  }

  if (!res.ok) {
    const rateLimited = isRateLimited(res);
    console.error(
      `GitHub API error: ${res.status} ${res.statusText}` +
        (rateLimited ? " (rate limit exhausted)" : "")
    );
    throw new GitHubUnavailableError(res.status, res.statusText, rateLimited);
  }

  try {
    const data = await res.json();
    // Filter out pull requests (GitHub API returns PRs as issues)
    return (data as GitHubIssue[]).filter((issue) => !("pull_request" in issue));
  } catch (error) {
    console.error("Failed to parse GitHub issues response:", error);
    throw new GitHubUnavailableError(res.status, "response was not valid JSON");
  }
}

/**
 * Fetch a single issue by number, including its body. Used by the
 * conversational agent's get_issue tool. Same 5-minute ISR cache.
 *
 * Returns null only when the issue genuinely isn't there (404, or the
 * number belongs to a pull request). Any other failure throws, so callers
 * can't report a real issue as missing.
 *
 * @throws {GitHubUnavailableError} when the lookup cannot be completed.
 */
export async function fetchIssue(
  number: number
): Promise<GitHubIssue | null> {
  let res: Response;
  try {
    res = await fetch(`${API}/${number}`, {
      next: { revalidate: 300 },
      headers: issueHeaders(),
    });
  } catch (error) {
    console.error(`Failed to fetch GitHub issue #${number}:`, error);
    throw new GitHubUnavailableError(
      null,
      error instanceof Error ? error.message : String(error)
    );
  }

  if (res.status === 404) return null;

  if (!res.ok) {
    const rateLimited = isRateLimited(res);
    console.error(
      `GitHub API error: ${res.status} ${res.statusText}` +
        (rateLimited ? " (rate limit exhausted)" : "")
    );
    throw new GitHubUnavailableError(res.status, res.statusText, rateLimited);
  }

  try {
    const data = (await res.json()) as GitHubIssue & { pull_request?: unknown };
    if ("pull_request" in data && data.pull_request) return null;
    return data;
  } catch (error) {
    console.error(`Failed to parse GitHub issue #${number}:`, error);
    throw new GitHubUnavailableError(res.status, "response was not valid JSON");
  }
}

/**
 * Helpers for categorizing issues by label.
 */
export function getStrategicIssues(issues: GitHubIssue[]): GitHubIssue[] {
  return issues.filter((i) => i.labels.some((l) => l.name === "strategic"));
}

export function getTechnicalIssues(issues: GitHubIssue[]): GitHubIssue[] {
  return issues.filter((i) => i.labels.some((l) => l.name === "technical"));
}

export function getOpenCount(issues: GitHubIssue[]): number {
  return issues.filter((i) => i.state === "open").length;
}

export function getClosedCount(issues: GitHubIssue[]): number {
  return issues.filter((i) => i.state === "closed").length;
}

export function getPriorityLabel(
  issue: GitHubIssue
): "high" | "medium" | "low" | null {
  for (const l of issue.labels) {
    if (l.name === "priority-high") return "high";
    if (l.name === "priority-medium") return "medium";
    if (l.name === "priority-low") return "low";
  }
  return null;
}
