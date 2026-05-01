import Link from "next/link";
import {
  presentations,
  oredProjects,
  shadowApplications,
  currentConstraints,
  recommendations,
  adoptionPhases,
} from "@/lib/data";

export default function ReportsPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">
          Reports &amp; Briefs
        </h1>
        <p className="mt-2 text-gray-600">
          Written briefings, activity reports, and documents produced by IIDS
          and partner leadership.
        </p>
      </div>

      {/* Feb 2026 activity report — featured origin-story */}
      <Link
        href="/reports/feb-2026"
        className="group block rounded-xl border border-gray-200 bg-gradient-to-br from-ui-charcoal to-ui-charcoal/90 p-6 text-white shadow-sm transition-all hover:border-ui-gold/40 hover:shadow-md"
      >
        <p className="text-xs font-medium uppercase tracking-wider text-ui-gold">
          Origin story
        </p>
        <h2 className="mt-1 text-xl font-semibold">
          Development Activity Report &mdash; February 1&ndash;26, 2026
        </h2>
        <p className="mt-2 text-sm text-white/70">
          The 26-day sprint that proved agentic development could work at
          institutional scale. 830 commits, 237,900 net new lines, 11 active
          repos, 10&ndash;16x productivity multiplier.
        </p>
        <p className="mt-3 text-sm font-medium text-ui-gold group-hover:underline">
          Read the full report &rarr;
        </p>
      </Link>

      {/* Presentations list */}
      <div className="space-y-6">
        {presentations.map((pres) => (
          <div
            key={pres.id}
            className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-block rounded-full bg-ui-gold/15 px-2.5 py-0.5 text-xs font-medium text-ui-gold-dark">
                    {pres.type}
                  </span>
                  <span className="text-xs text-gray-400">{pres.date}</span>
                </div>
                <h2 className="mt-2 text-lg font-semibold text-ui-charcoal">
                  {pres.title}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  By {pres.author} &middot; Audience: {pres.audience}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-gray-600">
                  {pres.description}
                </p>
              </div>
              <div className="hidden shrink-0 sm:block">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-ui-charcoal text-ui-gold">
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sections */}
            <div className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                Sections
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {pres.sections.map((section) => (
                  <span
                    key={section}
                    className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                  >
                    {section}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Presidential Brief Key Content */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-ui-charcoal">
          Presidential Brief Highlights
        </h2>
        <p className="mb-6 text-sm text-gray-500">
          Key content from the February 7, 2026 presidential briefing on Agentic
          AI.
        </p>

        {/* ORED Projects */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-ui-charcoal">
            ORED Projects Leveraging Agentic AI
          </h3>
          <div className="mt-4 space-y-3">
            {oredProjects.map((proj) => (
              <div
                key={proj.name}
                className={`flex items-center justify-between rounded-lg px-4 py-3 ${
                  proj.featured
                    ? "bg-ui-charcoal text-white"
                    : "bg-gray-50 text-gray-500"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`font-medium ${
                      proj.featured ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {proj.name}
                  </span>
                  {proj.featured && (
                    <span className="rounded bg-ui-gold/20 px-1.5 py-0.5 text-xs text-ui-gold">
                      Featured
                    </span>
                  )}
                </div>
                <div className="text-right text-sm">
                  <span>{proj.lead}</span>
                  <span
                    className={`ml-2 ${
                      proj.featured ? "text-white/60" : "text-gray-400"
                    }`}
                  >
                    {proj.unit}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Adoption Phases */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-ui-charcoal">
            Adoption Phase Velocity
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Average daily productivity by adoption phase
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-4 py-2 font-semibold text-gray-700">
                    Adoption Phase
                  </th>
                  <th className="px-4 py-2 text-right font-semibold text-gray-700">
                    Avg Commits/Day
                  </th>
                  <th className="px-4 py-2 text-right font-semibold text-gray-700">
                    Avg Net LOC/Day
                  </th>
                </tr>
              </thead>
              <tbody>
                {adoptionPhases.map((phase) => (
                  <tr
                    key={phase.phase}
                    className="border-b border-gray-100 hover:bg-gray-50/50"
                  >
                    <td className="px-4 py-2">
                      <span className="font-medium text-ui-charcoal">
                        {phase.phase}
                      </span>
                      <span className="ml-2 text-xs text-gray-400">
                        ({phase.period})
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-gray-700">
                      {phase.avgCommitsPerDay}
                    </td>
                    <td className="px-4 py-2 text-right font-mono text-gray-700">
                      {phase.avgNetLOCPerDay.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-lg bg-ui-gold/10 px-4 py-3">
            <p className="text-sm font-medium text-ui-gold-dark">
              28x increase in daily commit rate from pre-agentic to full team
              adoption
            </p>
          </div>
        </div>

        {/* Shadow Applications */}
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-base font-semibold text-ui-charcoal">
            The Looming Shadow APPocalypse
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Applications created across the institution by non-developers using
            agentic AI tools
          </p>
          <div className="mt-4 space-y-2">
            {shadowApplications.map((app, i) => (
              <div
                key={app.name}
                className="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-2.5"
              >
                <span className="text-sm font-medium text-ui-charcoal">
                  {i + 1}. {app.name}
                </span>
                <span className="text-sm text-gray-500">{app.owner}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Constraints & Recommendations */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-ui-charcoal">
              Current Constraints
            </h3>
            <div className="mt-4 space-y-3">
              {currentConstraints.map((constraint, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg bg-red-50 px-4 py-3"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold text-red-600">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700">{constraint}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h3 className="text-base font-semibold text-ui-charcoal">
              Recommendations
            </h3>
            <div className="mt-4 space-y-3">
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg bg-green-50 px-4 py-3"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-bold text-green-700">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ui-charcoal">
                      {rec.title}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-600">
                      {rec.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-gray-300 bg-white/50 p-8 text-center">
        <p className="text-sm text-gray-500">
          Add new presentations and reports by updating the{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
            presentations
          </code>{" "}
          array in{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
            lib/data.ts
          </code>
        </p>
      </div>
    </div>
  );
}
