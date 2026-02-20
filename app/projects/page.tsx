import MetricCard from "@/components/MetricCard";
import ProjectTable from "@/components/ProjectTable";
import { projects, projectTotals, keyMetrics } from "@/lib/data";

export default function ProjectsPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">
          Projects & Metrics
        </h1>
        <p className="mt-2 text-gray-600">
          Development activity report — February 1-19, 2026. Agentic
          development with Claude Code.
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Prepared by Luke Sheneman
        </p>
      </div>

      {/* Summary metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          value={keyMetrics.totalCommits}
          label="Total Commits"
          sublabel={`~${keyMetrics.commitsPerDay}/day`}
        />
        <MetricCard
          value={keyMetrics.netNewLines}
          label="Net New Lines"
          sublabel={`~${keyMetrics.linesPerDay.toLocaleString()}/day`}
        />
        <MetricCard
          value={keyMetrics.pullRequests}
          label="Pull Requests"
        />
        <MetricCard
          value={keyMetrics.issuesTracked}
          label="Issues Tracked"
        />
      </div>

      {/* Spanning info */}
      <div className="rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-600">
        {keyMetrics.calendarDays} calendar days &middot; {keyMetrics.contributors}{" "}
        contributors &middot; ~{keyMetrics.commitsPerDay} commits/day &middot; ~
        {keyMetrics.linesPerDay.toLocaleString()} net lines/day &middot; Spanning
        ML/AI, full-stack web, DevOps, and research tools
      </div>

      {/* Repository breakdown */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-ui-charcoal">
          Per-Project Effort Estimates
        </h2>
        <ProjectTable projects={projects} totals={projectTotals} />
      </div>

      {/* Productivity highlight */}
      <div className="rounded-xl bg-ui-charcoal p-8 text-center text-white">
        <p className="text-5xl font-bold text-ui-gold">10-15x</p>
        <p className="mt-2 text-lg font-medium">Productivity Multiplier</p>
        <p className="mt-1 text-sm text-white/60">
          Estimated manual: 6-9 months &middot; Actual: 19 days, 2-3
          contributors with agentic AI
        </p>
      </div>

      {/* Repo list */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-ui-charcoal">
          Repository Summary
        </h2>
        <p className="text-sm text-gray-600">
          7 Repositories &middot; 142,095 Lines &middot; 19 Days
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {projects.map((p) => (
            <span
              key={p.name}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-ui-charcoal"
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
