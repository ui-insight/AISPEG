import MetricCard from "@/components/MetricCard";
import ProjectTable from "@/components/ProjectTable";
import ProjectDetail from "@/components/ProjectDetail";
import {
  projects,
  projectTotals,
  keyMetrics,
  repositoryTimeline,
  methodologyNote,
} from "@/lib/data";

export default function ProjectsPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">
          Projects & Metrics
        </h1>
        <p className="mt-2 text-gray-600">
          Development activity report &mdash; February 1&ndash;19, 2026.
          Agentic development with Claude Code.
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Prepared by Luke Sheneman &middot; University of Idaho
        </p>
      </div>

      {/* Executive summary */}
      <div className="rounded-xl border-l-4 border-ui-gold bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Executive Summary</p>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          The scope and complexity of the work is notable: the repositories
          include deep learning model ensembles, reinforcement learning
          frameworks, full-stack applications with LangGraph agent pipelines,
          GPU-aware microservice orchestration, institutional budget and approval
          workflows, and AI-powered document processing. Each project represents
          production-grade software with Docker deployment, testing suites, and
          professional documentation.
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
          value={keyMetrics.totalLinesAdded}
          label="Total Lines Added"
        />
        <MetricCard
          value={keyMetrics.totalLinesDeleted}
          label="Total Lines Deleted"
        />
        <MetricCard value={keyMetrics.pullRequests} label="Pull Requests" />
        <MetricCard value={keyMetrics.issuesTracked} label="Issues Tracked" />
        <MetricCard value={keyMetrics.uniqueFiles} label="Files Modified" />
        <MetricCard
          value={keyMetrics.activeRepos}
          label="Active Repositories"
        />
      </div>

      {/* Spanning info */}
      <div className="rounded-lg bg-gray-100 px-4 py-3 text-sm text-gray-600">
        {keyMetrics.calendarDays} calendar days &middot;{" "}
        {keyMetrics.contributors} contributors &middot; ~
        {keyMetrics.commitsPerDay} commits/day &middot; ~
        {keyMetrics.linesPerDay.toLocaleString()} net lines/day &middot;
        Spanning ML/AI, full-stack web, DevOps, and research tools
      </div>

      {/* Per-project effort estimates */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-ui-charcoal">
          Per-Project Effort Estimates
        </h2>
        <ProjectTable projects={projects} totals={projectTotals} />
      </div>

      {/* Productivity highlight */}
      <div className="rounded-xl bg-ui-charcoal p-8 text-center text-white">
        <p className="text-5xl font-bold text-ui-gold">10&ndash;15x</p>
        <p className="mt-2 text-lg font-medium">Productivity Multiplier</p>
        <p className="mt-1 text-sm text-white/60">
          Estimated manual: 6&ndash;9 months &middot; Actual: 19 days, 2&ndash;3
          contributors with agentic AI
        </p>
      </div>

      {/* Repository creation timeline */}
      <div>
        <h2 className="mb-2 text-lg font-semibold text-ui-charcoal">
          Repository Creation Timeline
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          Five of seven repositories were created after February 12,
          demonstrating a burst of project initiation in the second half of the
          period.
        </p>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="px-6 py-3 font-semibold text-gray-700">
                  Repository
                </th>
                <th className="px-6 py-3 font-semibold text-gray-700">
                  First Commit
                </th>
                <th className="px-6 py-3 font-semibold text-gray-700">
                  Last Commit
                </th>
                <th className="px-6 py-3 font-semibold text-gray-700">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {repositoryTimeline.map((r) => (
                <tr
                  key={r.name}
                  className="border-b border-gray-100 hover:bg-gray-50/50"
                >
                  <td className="px-6 py-3 font-medium text-ui-charcoal">
                    {r.name}
                  </td>
                  <td className="px-6 py-3 text-gray-600">{r.firstCommit}</td>
                  <td className="px-6 py-3 text-gray-600">{r.lastCommit}</td>
                  <td className="px-6 py-3 text-gray-500">{r.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed repository analysis */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-ui-charcoal">
          Detailed Repository Analysis
        </h2>
        <div className="space-y-4">
          {projects.map((p) => (
            <ProjectDetail
              key={p.name}
              name={p.name}
              description={p.description}
              activePeriod={p.activePeriod}
              contributors={p.contributors}
              commits={p.commits}
              linesAdded={p.linesAdded}
              linesDeleted={p.linesDeleted}
              netNewLines={p.netNewLines}
              filesChanged={p.filesChanged}
              multiplier={p.multiplier}
            />
          ))}
        </div>
      </div>

      {/* Methodology */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-ui-charcoal">
          Methodology & Notes
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          {methodologyNote}
        </p>
      </div>
    </div>
  );
}
