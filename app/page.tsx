import Link from "next/link";
import IssueCard from "@/components/IssueCard";
import {
  fetchIssues,
  getStrategicIssues,
  getTechnicalIssues,
  getOpenCount,
  getClosedCount,
} from "@/lib/github";
import { getPubliclyVisible } from "@/lib/portfolio";

export const dynamic = "force-dynamic";

export default async function Home() {
  const allIssues = await fetchIssues();
  const strategic = getStrategicIssues(allIssues);
  const technical = getTechnicalIssues(allIssues);
  const visibleCount = getPubliclyVisible().length;

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section>
        <p className="text-xs font-semibold uppercase tracking-wider text-ui-gold-dark">
          Institutional AI Initiative · University of Idaho
        </p>
        <h1 className="mt-2 text-4xl font-black leading-tight tracking-tight text-ui-charcoal">
          What IIDS shipped, what&rsquo;s stalled,
          <br />
          and why.
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-gray-600">
          A coordination nexus for the University of Idaho&rsquo;s institutional
          AI work. Operated by the Institute for Interdisciplinary Data Sciences
          under sponsorship of the AI Strategic Plan Execution Group. Every
          project names an operational owner; every blocker names a date.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 rounded-lg bg-ui-charcoal px-4 py-2 text-sm font-medium text-white hover:bg-ui-charcoal/90"
          >
            See the work &rarr;
          </Link>
          <Link
            href="/standards"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-ui-charcoal hover:border-ui-gold/40"
          >
            Standards Watch &rarr;
          </Link>
          <Link
            href="/builder-guide"
            className="inline-flex items-center gap-2 rounded-lg bg-ui-gold px-4 py-2 text-sm font-medium text-ui-charcoal hover:bg-ui-gold/90"
          >
            Submit a project &rarr;
          </Link>
        </div>
      </section>

      {/* Portfolio teaser */}
      <section>
        <Link
          href="/portfolio"
          className="group block rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-ui-gold/40 hover:shadow-md"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-ui-gold-dark">
            The Work
          </p>
          <h2 className="mt-2 text-xl font-semibold text-ui-charcoal group-hover:text-ui-gold-dark">
            {visibleCount} AI interventions in the institutional portfolio
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-gray-600">
            IIDS-led work and AI4RA-built tools the University deploys.
            Grouped by home unit; each entry names an operational owner
            accountable for the outcome and surfaces blockers with the date
            they began.
          </p>
          <p className="mt-3 text-sm font-medium text-ui-gold-dark group-hover:underline">
            Explore the portfolio &rarr;
          </p>
        </Link>
      </section>

      {/* GitHub Strategic Action Items */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-ui-charcoal">
            Strategic Action Items
          </h2>
          <span className="text-sm text-gray-500">
            {getOpenCount(strategic)} open · {getClosedCount(strategic)} closed
          </span>
        </div>
        {strategic.length > 0 ? (
          <div className="grid gap-3 md:grid-cols-2">
            {strategic.map((issue) => (
              <IssueCard key={issue.number} issue={issue} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white/50 p-6 text-center">
            <p className="text-sm text-gray-500">
              No strategic issues found. Issues labeled{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
                strategic
              </code>{" "}
              will appear here.
            </p>
          </div>
        )}
      </section>

      {/* GitHub Technical Improvements */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-ui-charcoal">
            Technical Improvements
          </h2>
          <span className="text-sm text-gray-500">
            {getClosedCount(technical)} of {technical.length} complete
          </span>
        </div>
        {technical.length > 0 ? (
          <div className="space-y-2">
            {technical.map((issue) => (
              <a
                key={issue.number}
                href={issue.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 rounded-lg border border-gray-100 bg-white px-4 py-3 text-sm transition-colors hover:border-gray-200 hover:bg-gray-50"
              >
                {issue.state === "closed" ? (
                  <svg className="h-5 w-5 shrink-0 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5 shrink-0 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="9" strokeWidth={2} />
                  </svg>
                )}
                <span
                  className={`flex-1 ${
                    issue.state === "closed"
                      ? "text-gray-400 line-through"
                      : "text-ui-charcoal"
                  }`}
                >
                  {issue.title}
                </span>
                <span className="text-xs text-gray-400">#{issue.number}</span>
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-white/50 p-6 text-center">
            <p className="text-sm text-gray-500">
              No technical issues found. Issues labeled{" "}
              <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
                technical
              </code>{" "}
              will appear here.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
