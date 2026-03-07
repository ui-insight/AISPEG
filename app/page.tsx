import Link from "next/link";
import IssueCard from "@/components/IssueCard";
import { actionPlanWorkstreams } from "@/lib/action-plan";
import {
  fetchIssues,
  getStrategicIssues,
  getTechnicalIssues,
  getOpenCount,
  getClosedCount,
} from "@/lib/github";
import {
  institutionalQuestion,
  strategicTakeaways,
  principles,
  lessons,
  knowledgeArticles,
  playbookItems,
  projects,
  presentations,
} from "@/lib/data";

/* ---------------------------------------------------------- */
/* Navigation cards data                                       */
/* ---------------------------------------------------------- */
const navCards = [
  {
    href: "/action-plan",
    label: "Action Plan",
    count: `${actionPlanWorkstreams.length} workstreams`,
    icon: "🎯",
  },
  {
    href: "/principles",
    label: "Strategic Principles",
    count: `${principles.length} principles`,
    icon: "💡",
  },
  {
    href: "/lessons",
    label: "Lessons Learned",
    count: `${lessons.length} lessons`,
    icon: "📖",
  },
  {
    href: "/playbook",
    label: "Agent Playbook",
    count: `${playbookItems.length} entries`,
    icon: "📋",
  },
  {
    href: "/projects",
    label: "Projects & Metrics",
    count: `${projects.length} repositories`,
    icon: "📊",
  },
  {
    href: "/reports",
    label: "Reports & Briefs",
    count: `${presentations.length} documents`,
    icon: "📄",
  },
  {
    href: "/knowledge",
    label: "Knowledge Base",
    count: `${knowledgeArticles.length} articles`,
    icon: "🔍",
  },
  {
    href: "/roadmap",
    label: "Planning & Roadmap",
    count: "4 phases",
    icon: "🗺️",
  },
];

export const dynamic = "force-dynamic";

/* ---------------------------------------------------------- */
/* Page                                                        */
/* ---------------------------------------------------------- */
export default async function Home() {
  const allIssues = await fetchIssues();
  const strategic = getStrategicIssues(allIssues);
  const technical = getTechnicalIssues(allIssues);

  return (
    <div className="space-y-10">
      {/* Header + Mission */}
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">
          AI Strategic Planning &amp; Evaluation Group
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

      {/* Current Phase Summary */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-lg font-semibold text-ui-charcoal">
            Phase 1: Foundation
          </h2>
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
            In Progress
          </span>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Connecting agent tools to secure on-prem models, building initial
          internal AI applications, evaluating repo-scale agent collaboration,
          and establishing this collaborative hub. The foundation phase proves
          the model works before scaling across the institution.
        </p>
        <Link
          href="/roadmap"
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-ui-gold-dark hover:text-ui-gold transition-colors"
        >
          View full roadmap
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* GitHub Issues — Strategic Action Items */}
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold text-ui-charcoal">
            Strategic Action Items
          </h2>
          <span className="text-sm text-gray-500">
            {getOpenCount(strategic)} open &middot;{" "}
            {getClosedCount(strategic)} closed
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
      </div>

      {/* GitHub Issues — Technical Improvements */}
      <div>
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
      </div>

      {/* Quick Navigation Cards */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-ui-charcoal">
          Explore
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {navCards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="group flex items-start gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:border-ui-gold/40 hover:shadow-md"
            >
              <span className="text-2xl">{card.icon}</span>
              <div>
                <p className="text-sm font-semibold text-ui-charcoal group-hover:text-ui-gold-dark transition-colors">
                  {card.label}
                </p>
                <p className="mt-0.5 text-xs text-gray-500">{card.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Strategic Takeaways */}
      <div className="rounded-xl bg-ui-charcoal p-6 text-white">
        <h2 className="text-lg font-semibold text-ui-gold">
          Strategic Takeaways
        </h2>
        <ul className="mt-4 space-y-2">
          {strategicTakeaways.map((item, i) => (
            <li
              key={i}
              className="flex items-start gap-3 text-sm text-white/80"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ui-gold/20 text-xs font-bold text-ui-gold">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
