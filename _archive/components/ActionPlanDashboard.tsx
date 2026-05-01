"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type IssueState = "open" | "closed" | "unknown";
type IssuePriority = "high" | "medium" | "low" | null;

export interface ActionPlanResolvedIssue {
  number: number;
  title: string;
  url: string;
  state: IssueState;
  milestone: string | null;
  priority: IssuePriority;
}

export interface ActionPlanDashboardMilestone {
  title: string;
  window: string;
  description: string;
  issues: ActionPlanResolvedIssue[];
}

export interface ActionPlanDashboardWorkstream {
  name: string;
  ownerRole: string;
  goal: string;
  epic: ActionPlanResolvedIssue;
  existingIssues: ActionPlanResolvedIssue[];
  executionIssues: ActionPlanResolvedIssue[];
}

export interface ActionPlanDashboardSynthesis {
  ownerRole: string;
  issue: ActionPlanResolvedIssue;
  goal: string;
  inputIssues: ActionPlanResolvedIssue[];
}

function IssueStateBadge({ state }: { state: IssueState }) {
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

function PriorityBadge({ priority }: { priority: IssuePriority }) {
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

function IssueRow({ issue }: { issue: ActionPlanResolvedIssue }) {
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

function matchesMilestone(
  issue: ActionPlanResolvedIssue,
  selectedMilestone: string
) {
  return selectedMilestone === "All" || issue.milestone === selectedMilestone;
}

export default function ActionPlanDashboard({
  trackerIssue,
  trackedIssues,
  milestones,
  workstreams,
  synthesis,
}: {
  trackerIssue: ActionPlanResolvedIssue;
  trackedIssues: ActionPlanResolvedIssue[];
  milestones: ActionPlanDashboardMilestone[];
  workstreams: ActionPlanDashboardWorkstream[];
  synthesis: ActionPlanDashboardSynthesis;
}) {
  const [selectedMilestone, setSelectedMilestone] = useState("All");

  const visibleTrackedIssues = useMemo(() => {
    return trackedIssues.filter((issue) => matchesMilestone(issue, selectedMilestone));
  }, [selectedMilestone, trackedIssues]);

  const openTrackedIssues = visibleTrackedIssues.filter(
    (issue) => issue.state === "open"
  ).length;
  const closedTrackedIssues = visibleTrackedIssues.filter(
    (issue) => issue.state === "closed"
  ).length;

  const filteredWorkstreams = useMemo(() => {
    return workstreams
      .map((workstream) => {
        const existingIssues = workstream.existingIssues.filter((issue) =>
          matchesMilestone(issue, selectedMilestone)
        );
        const executionIssues = workstream.executionIssues.filter((issue) =>
          matchesMilestone(issue, selectedMilestone)
        );
        const epicMatches =
          selectedMilestone === "All" ||
          workstream.epic.milestone === selectedMilestone;

        if (!epicMatches && existingIssues.length === 0 && executionIssues.length === 0) {
          return null;
        }

        return {
          ...workstream,
          existingIssues,
          executionIssues,
        };
      })
      .filter(Boolean) as ActionPlanDashboardWorkstream[];
  }, [selectedMilestone, workstreams]);

  const showSynthesis =
    selectedMilestone === "All" || synthesis.issue.milestone === selectedMilestone;

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

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSelectedMilestone("All")}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              selectedMilestone === "All"
                ? "bg-ui-gold text-ui-black"
                : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
            }`}
          >
            All milestones
          </button>
          {milestones.map((milestone) => (
            <button
              key={milestone.title}
              type="button"
              onClick={() => setSelectedMilestone(milestone.title)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                selectedMilestone === milestone.title
                  ? "bg-ui-gold text-ui-black"
                  : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
              }`}
            >
              {milestone.window}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs uppercase tracking-wide text-white/50">
              Visible Issues
            </p>
            <p className="mt-2 text-3xl font-bold">{visibleTrackedIssues.length}</p>
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
              Active Filter
            </p>
            <p className="mt-2 text-lg font-bold">
              {selectedMilestone === "All" ? "All milestones" : selectedMilestone}
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-ui-charcoal">Milestone Windows</h2>
            <p className="text-sm text-gray-500">
              Click a milestone to filter the issue view below by quarter or annual scope.
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
          {milestones.map((milestone) => {
            const openCount = milestone.issues.filter(
              (issue) => issue.state === "open"
            ).length;
            const closedCount = milestone.issues.filter(
              (issue) => issue.state === "closed"
            ).length;
            const completion = milestone.issues.length
              ? Math.round((closedCount / milestone.issues.length) * 100)
              : 0;
            const active = selectedMilestone === milestone.title;

            return (
              <button
                key={milestone.title}
                type="button"
                onClick={() =>
                  setSelectedMilestone((current) =>
                    current === milestone.title ? "All" : milestone.title
                  )
                }
                className={`rounded-xl border bg-white p-5 text-left shadow-sm transition-colors ${
                  active
                    ? "border-ui-gold bg-ui-gold/5"
                    : "border-gray-200 hover:border-ui-gold/40"
                }`}
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
                      {milestone.issues.length}
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
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-ui-charcoal">Workstreams</h2>
          <p className="text-sm text-gray-500">
            The selected milestone filters the issue lists below, so you can review one delivery
            window without losing the workstream structure.
          </p>
        </div>

        <div className="space-y-6">
          {filteredWorkstreams.map((workstream) => (
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
                    <IssueStateBadge state={workstream.epic.state} />
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-ui-charcoal">
                    {workstream.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">{workstream.goal}</p>
                </div>
                <a
                  href={workstream.epic.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center rounded-full border border-ui-gold/30 bg-ui-gold/10 px-3 py-1.5 text-sm font-medium text-ui-gold-dark hover:bg-ui-gold/20"
                >
                  Epic #{workstream.epic.number}
                </a>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Existing Issues Already In Scope
                  </p>
                  <div className="mt-3 space-y-3">
                    {workstream.existingIssues.length > 0 ? (
                      workstream.existingIssues.map((issue) => (
                        <IssueRow key={issue.number} issue={issue} />
                      ))
                    ) : (
                      <p className="rounded-lg border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-400">
                        No existing issues in the selected milestone.
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    New Execution Issues
                  </p>
                  <div className="mt-3 space-y-3">
                    {workstream.executionIssues.length > 0 ? (
                      workstream.executionIssues.map((issue) => (
                        <IssueRow key={issue.number} issue={issue} />
                      ))
                    ) : (
                      <p className="rounded-lg border border-dashed border-gray-200 px-4 py-3 text-sm text-gray-400">
                        No new execution issues in the selected milestone.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}

          {filteredWorkstreams.length === 0 && (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white/60 p-8 text-center">
              <p className="text-sm text-gray-500">
                No workstreams match the current milestone filter.
              </p>
            </div>
          )}
        </div>
      </section>

      {showSynthesis && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-wide text-ui-gold-dark">
                {synthesis.ownerRole}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-ui-charcoal">
                Roadmap Synthesis Layer
              </h2>
              <p className="mt-2 text-sm text-gray-600">{synthesis.goal}</p>
            </div>
            <a
              href={synthesis.issue.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-full border border-ui-gold/30 bg-ui-gold/10 px-3 py-1.5 text-sm font-medium text-ui-gold-dark hover:bg-ui-gold/20"
            >
              Synthesis issue #{synthesis.issue.number}
            </a>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Inputs Waiting For Synthesis
              </p>
              <div className="mt-3 space-y-3">
                {synthesis.inputIssues.map((issue) => (
                  <IssueRow key={issue.number} issue={issue} />
                ))}
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 p-4 lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                How To Use This Page
              </p>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li>Use milestone chips or cards to isolate one delivery window.</li>
                <li>Review filtered workstreams without losing the institutional grouping.</li>
                <li>Use synthesis to keep research inputs tied to execution instead of spawning a second roadmap.</li>
              </ul>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
