import Link from "next/link";

import {
  actionPlanMilestones,
  actionPlanSynthesis,
  actionPlanTracker,
  actionPlanWorkstreams,
  type ActionPlanIssueRef,
} from "@/lib/action-plan";
import { fetchIssues, getPriorityLabel, type GitHubIssue } from "@/lib/github";

type ResolvedIssue = {
  number: number;
  title: string;
  url: string;
  state: "open" | "closed" | "unknown";
  milestone: string | null;
  priority: "high" | "medium" | "low" | null;
};

function resolveIssue(
  ref: ActionPlanIssueRef,
  issueMap: Map<number, GitHubIssue>
): ResolvedIssue {
  const liveIssue = issueMap.get(ref.number);

  return {
    number: ref.number,
    title: liveIssue?.title ?? ref.title,
    url:
      liveIssue?.html_url ??
      `https://github.com/ui-insight/AISPEG/issues/${ref.number}`,
    state: liveIssue?.state ?? "unknown",
    milestone: liveIssue?.milestone?.title ?? null,
    priority: liveIssue ? getPriorityLabel(liveIssue) : null,
  };
}

function uniqueNumbers(numbers: number[]) {
  return Array.from(new Set(numbers));
}

function IssueStateBadge({ state }: { state: ResolvedIssue["state"] }) {
  if (state === "closed") {
    return (
      <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
        Closed
      </span>
    );
  }

  if (state === "open") {
    return (
      <span className="rounded-full bg-ui-gold/15 px-2.5 py-0.5 text-xs font-medium text-ui-gold-dark">
        Open
      </span>
    );
  }

  return (
    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-500">
      Not loaded
    </span>
  );
}

function PriorityBadge({
  priority,
}: {
  priority: ResolvedIssue["priority"];
}) {
  if (!priority) return null;

  const styles = {
    high: "bg-red-100 text-red-700",
    medium: "bg-yellow-100 text-yellow-700",
    low: "bg-gray-100 text-gray-600",
  };

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[priority]}`}>
      {priority}
    </span>
  );
}

function IssueRow({ issue }: { issue: ResolvedIssue }) {
  return (
    <a
      href={issue.url}
      target="_blank"
      rel="noreferrer"
      className="flex items-start justify-between gap-3 rounded-lg border border-gray-100 bg-gray-50 px-4 py-3 transition-colors hover:border-gray-200 hover:bg-white"
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            #{issue.number}
          </span>
          <IssueStateBadge state={issue.state} />
          <PriorityBadge priority={issue.priority} />
        </div>
        <p className="mt-1 text-sm font-medium text-ui-charcoal">{issue.title}</p>
        {issue.milestone && (
          <p className="mt-1 text-xs text-gray-500">Milestone: {issue.milestone}</p>
        )}
      </div>
      <span className="text-sm font-medium text-ui-gold-dark">Open</span>
    </a>
  );
}

export default async function ActionPlanPage() {
  const issues = await fetchIssues();
  const issueMap = new Map(issues.map((issue) => [issue.number, issue]));

  const trackerIssue = resolveIssue(actionPlanTracker, issueMap);
  const trackedIssueNumbers = uniqueNumbers([
    ...actionPlanMilestones.flatMap((milestone) => milestone.issueNumbers),
    ...actionPlanSynthesis.inputIssues.map((issue) => issue.number),
  ]);
  const trackedIssues = trackedIssueNumbers.map((number) =>
    resolveIssue(
      {
        number,
        title: `Issue #${number}`,
      },
      issueMap
    )
  );
  const openTrackedIssues = trackedIssues.filter(
    (issue) => issue.state === "open"
  ).length;
  const closedTrackedIssues = trackedIssues.filter(
    (issue) => issue.state === "closed"
  ).length;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">Action Plan</h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Execution view for the March 2026 OIT AI Next Steps directive,
          anchored in GitHub issues and milestone windows rather than narrative
          notes alone.
        </p>
      </div>

      <section className="rounded-2xl bg-ui-charcoal p-6 text-white shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-sm font-medium text-ui-gold">Top-Level Tracker</p>
            <h2 className="mt-2 text-2xl font-semibold">{trackerIssue.title}</h2>
            <p className="mt-2 text-sm text-white/70">
              Five execution epics, one synthesis issue, and quarter-based
              milestones now organize the institutional work.
            </p>
          </div>
          <a
            href={trackerIssue.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full bg-ui-gold px-4 py-2 text-sm font-semibold text-ui-black transition-colors hover:bg-ui-gold-light"
          >
            View issue #{trackerIssue.number}
          </a>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50">
              Tracked Issues
            </p>
            <p className="mt-2 text-3xl font-bold">{trackedIssueNumbers.length}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50">
              Open Issues
            </p>
            <p className="mt-2 text-3xl font-bold">{openTrackedIssues}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50">
              Closed Issues
            </p>
            <p className="mt-2 text-3xl font-bold">{closedTrackedIssues}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50">
              Milestones
            </p>
            <p className="mt-2 text-3xl font-bold">{actionPlanMilestones.length}</p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-ui-charcoal">Milestone Windows</h2>
            <p className="text-sm text-gray-500">
              Quarterly grouping for review, sequencing, and delivery pressure.
            </p>
          </div>
          <Link
            href="/roadmap"
            className="text-sm font-medium text-ui-gold-dark hover:underline"
          >
            Compare with roadmap
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {actionPlanMilestones.map((milestone) => {
            const milestoneIssues = milestone.issueNumbers.map((number) =>
              resolveIssue({ number, title: `Issue #${number}` }, issueMap)
            );
            const openCount = milestoneIssues.filter(
              (issue) => issue.state === "open"
            ).length;
            const closedCount = milestoneIssues.filter(
              (issue) => issue.state === "closed"
            ).length;
            const completion = milestoneIssues.length
              ? Math.round((closedCount / milestoneIssues.length) * 100)
              : 0;

            return (
              <article
                key={milestone.title}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-ui-gold-dark">
                      {milestone.window}
                    </p>
                    <h3 className="mt-1 text-lg font-semibold text-ui-charcoal">
                      {milestone.title}
                    </h3>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    {completion}% complete
                  </span>
                </div>
                <p className="mt-2 text-sm text-gray-600">{milestone.description}</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-ui-gold"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-500">
                  <span>
                    <span className="font-semibold text-ui-charcoal">
                      {milestoneIssues.length}
                    </span>{" "}
                    issues
                  </span>
                  <span>
                    <span className="font-semibold text-ui-charcoal">{openCount}</span>{" "}
                    open
                  </span>
                  <span>
                    <span className="font-semibold text-ui-charcoal">{closedCount}</span>{" "}
                    closed
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-ui-charcoal">Workstreams</h2>
          <p className="text-sm text-gray-500">
            Each workstream combines one epic, the older issues already in scope,
            and the execution issues created to close remaining gaps.
          </p>
        </div>

        <div className="space-y-6">
          {actionPlanWorkstreams.map((workstream) => {
            const epic = resolveIssue(workstream.epic, issueMap);

            return (
              <article
                key={workstream.name}
                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-ui-charcoal px-2.5 py-0.5 text-xs font-medium text-white">
                        {workstream.ownerRole}
                      </span>
                      <IssueStateBadge state={epic.state} />
                    </div>
                    <h3 className="mt-3 text-xl font-semibold text-ui-charcoal">
                      {workstream.name}
                    </h3>
                    <p className="mt-2 text-sm text-gray-600">{workstream.goal}</p>
                  </div>
                  <a
                    href={epic.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-full border border-ui-gold/30 bg-ui-gold/10 px-3 py-1.5 text-sm font-medium text-ui-gold-dark hover:bg-ui-gold/20"
                  >
                    Epic #{epic.number}
                  </a>
                </div>

                <div className="mt-6 grid gap-6 xl:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      Existing Issues Already In Scope
                    </p>
                    <div className="mt-3 space-y-3">
                      {workstream.existingIssues.map((issue) => (
                        <IssueRow
                          key={issue.number}
                          issue={resolveIssue(issue, issueMap)}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                      New Execution Issues
                    </p>
                    <div className="mt-3 space-y-3">
                      {workstream.executionIssues.map((issue) => (
                        <IssueRow
                          key={issue.number}
                          issue={resolveIssue(issue, issueMap)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-ui-gold-dark">
              {actionPlanSynthesis.ownerRole}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ui-charcoal">
              Roadmap Synthesis Layer
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {actionPlanSynthesis.goal}
            </p>
          </div>
          <a
            href={`https://github.com/ui-insight/AISPEG/issues/${actionPlanSynthesis.issue.number}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full border border-ui-gold/30 bg-ui-gold/10 px-3 py-1.5 text-sm font-medium text-ui-gold-dark hover:bg-ui-gold/20"
          >
            Synthesis issue #{actionPlanSynthesis.issue.number}
          </a>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <div className="rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Inputs Waiting For Synthesis
            </p>
            <div className="mt-3 space-y-3">
              {actionPlanSynthesis.inputIssues.map((issue) => (
                <IssueRow key={issue.number} issue={resolveIssue(issue, issueMap)} />
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-gray-50 p-4 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              How To Use This Page
            </p>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>Use the milestone cards to review quarter sequencing and load.</li>
              <li>Use the workstream cards to see which older issues were folded into each epic.</li>
              <li>Use the synthesis layer to keep research inputs from becoming a second roadmap.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
