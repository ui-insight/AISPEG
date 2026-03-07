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
  milestone?: {
    title: string;
  } | null;
}

const REPO = "ui-insight/AISPEG";
const API = `https://api.github.com/repos/${REPO}/issues`;

/**
 * Fetch all issues from the AISPEG repo.
 * Used at build time with ISR (revalidate every 5 minutes).
 * Set GITHUB_TOKEN env var for private repos.
 */
export async function fetchIssues(): Promise<GitHubIssue[]> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
    };

    // Support private repos via token
    const token = process.env.GITHUB_TOKEN;
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`${API}?state=all&per_page=100`, {
      next: { revalidate: 300 }, // 5 minutes ISR
      headers,
    });

    if (!res.ok) {
      console.error(`GitHub API error: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = await res.json();

    // Filter out pull requests (GitHub API returns PRs as issues)
    return (data as GitHubIssue[]).filter((issue) => !("pull_request" in issue));
  } catch (error) {
    console.error("Failed to fetch GitHub issues:", error);
    return [];
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
