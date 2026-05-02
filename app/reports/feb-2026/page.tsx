import Link from "next/link";
import { Callout } from "@/components/Callout";
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

export default function FebReportPage() {
  return (
    <div className="space-y-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href="/reports" className="hover:text-ui-gold-dark">
          Reports &amp; Briefs
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ui-charcoal">Feb 2026 Activity Report</span>
      </nav>

      <div>
        <p className="text-sm font-medium uppercase tracking-wider text-ui-gold-dark">
          Origin story
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-brand-black">
          Development Activity Report &mdash; February 1&ndash;26, 2026
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          A snapshot of the 26-day sprint that proved agentic development could
          work at institutional scale. These metrics are a point-in-time proof
          of concept &mdash; for the current portfolio of active projects, see{" "}
          <Link href="/portfolio" className="text-ui-gold-dark hover:underline">
            Portfolio
          </Link>
          .
        </p>
        <p className="mt-1 text-sm text-gray-400">
          Prepared by Barrie Robison &middot; University of Idaho
        </p>
      </div>

      {/* Executive summary */}
      <Callout eyebrow="Executive Summary">
        <p className="text-sm leading-relaxed">
          Analysis of software development activity across 11 GitHub
          repositories during 26 days. The repositories span electronic
          research administration, data lakehouse ETL, strategic planning
          analytics, GPU-aware microservice orchestration, AI-powered proposal
          generation, document intelligence, water rights processing, wildlife
          video analysis, agricultural pest classification, and more. Each
          project represents production-grade software with modern
          architecture, testing, and documentation.
        </p>
      </Callout>

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
        <p className="text-5xl font-bold text-ui-gold">10&ndash;16x</p>
        <p className="mt-2 text-lg font-medium">Productivity Multiplier</p>
        <p className="mt-1 text-sm text-white/60">
          Estimated traditional: 1,586&ndash;2,379 developer-days (72&ndash;108
          months) &middot; Actual: 152 developer-days (8 contributors &times; 19
          working days)
        </p>
      </div>

      {/* Repository creation timeline */}
      <div>
        <h2 className="mb-2 text-lg font-semibold text-ui-charcoal">
          Repository Creation Timeline
        </h2>
        <p className="mb-4 text-sm text-gray-500">
          12 repositories tracked across the reporting period, with three key
          inflection points shaping adoption: Feb 6 (tools released), Feb 12
          (early adopters), Feb 20 (full team access).
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
          Methodology &amp; Notes
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          {methodologyNote}
        </p>
      </div>
    </div>
  );
}
