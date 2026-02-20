import type { GitHubIssue } from "@/lib/github";
import { getPriorityLabel } from "@/lib/github";

function PriorityBadge({ priority }: { priority: "high" | "medium" | "low" | null }) {
  if (!priority) return null;
  const styles = {
    high: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-blue-100 text-blue-700",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[priority]}`}>
      {priority}
    </span>
  );
}

function StateBadge({ state }: { state: "open" | "closed" }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        state === "open"
          ? "bg-green-100 text-green-700"
          : "bg-purple-100 text-purple-700"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          state === "open" ? "bg-green-500" : "bg-purple-500"
        }`}
      />
      {state === "open" ? "Open" : "Closed"}
    </span>
  );
}

export default function IssueCard({ issue }: { issue: GitHubIssue }) {
  const priority = getPriorityLabel(issue);

  return (
    <a
      href={issue.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-gray-400">#{issue.number}</span>
          <StateBadge state={issue.state} />
          <PriorityBadge priority={priority} />
        </div>
        <p className="mt-1 text-sm font-medium text-ui-charcoal leading-snug">
          {issue.title}
        </p>
      </div>
      <svg
        className="mt-1 h-4 w-4 shrink-0 text-gray-300"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
        />
      </svg>
    </a>
  );
}
