import ActionPlanDashboard, {
  type ActionPlanDashboardMilestone,
  type ActionPlanDashboardSynthesis,
  type ActionPlanDashboardWorkstream,
  type ActionPlanResolvedIssue,
} from "@/components/ActionPlanDashboard";
import {
  actionPlanMilestones,
  actionPlanSynthesis,
  actionPlanTracker,
  actionPlanWorkstreams,
  type ActionPlanIssueRef,
} from "@/lib/action-plan";
import { fetchIssues, getPriorityLabel, type GitHubIssue } from "@/lib/github";

export const dynamic = "force-dynamic";

function resolveIssue(
  ref: ActionPlanIssueRef,
  issueMap: Map<number, GitHubIssue>
): ActionPlanResolvedIssue {
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

  const milestones: ActionPlanDashboardMilestone[] = actionPlanMilestones.map(
    (milestone) => ({
      ...milestone,
      issues: milestone.issueNumbers.map((number) =>
        resolveIssue({ number, title: `Issue #${number}` }, issueMap)
      ),
    })
  );

  const workstreams: ActionPlanDashboardWorkstream[] = actionPlanWorkstreams.map(
    (workstream) => ({
      ...workstream,
      epic: resolveIssue(workstream.epic, issueMap),
      existingIssues: workstream.existingIssues.map((issue) =>
        resolveIssue(issue, issueMap)
      ),
      executionIssues: workstream.executionIssues.map((issue) =>
        resolveIssue(issue, issueMap)
      ),
    })
  );

  const synthesis: ActionPlanDashboardSynthesis = {
    ...actionPlanSynthesis,
    issue: resolveIssue(actionPlanSynthesis.issue, issueMap),
    inputIssues: actionPlanSynthesis.inputIssues.map((issue) =>
      resolveIssue(issue, issueMap)
    ),
  };

  return (
    <ActionPlanDashboard
      trackerIssue={trackerIssue}
      trackedIssues={trackedIssues}
      milestones={milestones}
      workstreams={workstreams}
      synthesis={synthesis}
    />
  );
}
