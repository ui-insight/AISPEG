import MetricCard from "@/components/MetricCard";
import { keyMetrics, institutionalQuestion, strategicTakeaways } from "@/lib/data";

export default function Home() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">
          AI Strategic Planning & Evaluation Group
        </h1>
        <p className="mt-2 max-w-2xl text-gray-600">
          A collaborative hub for planning, lessons learned, and knowledge
          sharing around agentic AI at the University of Idaho.
        </p>
      </div>

      {/* Institutional Question */}
      <div className="rounded-xl border-l-4 border-ui-gold bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-500">
          The Institutional Question
        </p>
        <p className="mt-2 text-gray-500 line-through">
          &ldquo;{institutionalQuestion.wrong}&rdquo;
        </p>
        <p className="mt-1 text-lg font-semibold text-ui-charcoal">
          &ldquo;{institutionalQuestion.right}&rdquo;
        </p>
      </div>

      {/* Key Metrics */}
      <div>
        <h2 className="text-lg font-semibold text-ui-charcoal">
          Development Activity — Feb 1-19, 2026
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Agentic development with Claude Code &middot; Prepared by Luke
          Sheneman
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            value={keyMetrics.totalCommits}
            label="Total Commits"
            sublabel={`~${keyMetrics.commitsPerDay}/day`}
          />
          <MetricCard
            value={keyMetrics.netNewLines}
            label="Net New Lines of Code"
            sublabel={`~${keyMetrics.linesPerDay.toLocaleString()}/day`}
          />
          <MetricCard
            value={keyMetrics.uniqueFiles}
            label="Unique Files Modified"
          />
          <MetricCard
            value={keyMetrics.activeRepos}
            label="Active Repositories"
          />
          <MetricCard value={keyMetrics.pullRequests} label="Pull Requests" />
          <MetricCard value={keyMetrics.issuesTracked} label="Issues Tracked" />
          <MetricCard
            value={keyMetrics.productivityMultiplier}
            label="Productivity Multiplier"
            sublabel={`Manual estimate: ${keyMetrics.manualEstimate}`}
          />
          <MetricCard
            value={`${keyMetrics.calendarDays} days`}
            label="Calendar Days"
            sublabel={`${keyMetrics.contributors} contributors`}
          />
        </div>
      </div>

      {/* Productivity Highlight */}
      <div className="rounded-xl bg-ui-charcoal p-8 text-center text-white">
        <p className="text-5xl font-bold text-ui-gold">10-15x</p>
        <p className="mt-2 text-lg font-medium">Productivity Multiplier</p>
        <p className="mt-1 text-sm text-white/60">
          Estimated manual: 6-9 months &middot; Actual: 19 days, 2-3
          contributors with agentic AI
        </p>
      </div>

      {/* Strategic Takeaways */}
      <div>
        <h2 className="text-lg font-semibold text-ui-charcoal">
          Strategic Takeaways
        </h2>
        <ul className="mt-4 space-y-3">
          {strategicTakeaways.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ui-gold/15 text-xs font-bold text-ui-gold-dark">
                {i + 1}
              </span>
              <span className="text-gray-700">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
