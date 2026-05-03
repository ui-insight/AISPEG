import Link from "next/link";
import {
  oredProjects,
  shadowApplications,
  currentConstraints,
  recommendations,
  adoptionPhases,
} from "./data";

export const metadata = {
  title: "Presidential Brief — Agentic AI · February 7, 2026",
  description:
    "Briefing for University of Idaho executive leadership on the transformative potential and organizational risks of Agentic AI.",
};

export default function PresidentialBriefPage() {
  return (
    <div className="space-y-10">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500">
        <Link href="/reports" className="hover:text-brand-black">
          Reports
        </Link>
        <span className="mx-2">/</span>
        <span className="text-ui-charcoal">Presidential Brief — Feb 2026</span>
      </nav>

      {/* Header */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-silver">
          Brief · February 7, 2026
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ui-charcoal">
          Agentic AI: Evidence of Impact, Current Constraints,
          <br />
          and Recommendations
        </h1>
        <p className="mt-3 max-w-3xl text-sm text-gray-500">
          By Barrie Robison · Audience: University of Idaho Executive
          Leadership
        </p>
        <p className="mt-4 max-w-3xl text-base leading-relaxed text-gray-700">
          This page captures the headline content from the February 7, 2026
          briefing for executive leadership: the active ORED projects
          leveraging agentic AI, force-multiplier evidence from the
          adoption phase data, the looming risk of shadow applications, and
          the constraints + recommendations the brief landed on.
        </p>
      </div>

      {/* ORED Projects */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-ui-charcoal">
          ORED Projects Leveraging Agentic AI
        </h2>
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
      </section>

      {/* Adoption Phases */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-ui-charcoal">
          Adoption Phase Velocity
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Average daily productivity by adoption phase.
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
        <div className="mt-4 rounded-lg border border-hairline bg-surface-alt px-4 py-3">
          <p className="text-sm font-semibold text-brand-black">
            28x increase in daily commit rate from pre-agentic to full team
            adoption.
          </p>
        </div>
      </section>

      {/* Shadow Applications */}
      <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-ui-charcoal">
          The Looming Shadow APPocalypse
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Applications created across the institution by non-developers
          using agentic AI tools.
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
      </section>

      {/* Constraints & Recommendations */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-base font-semibold text-ui-charcoal">
            Current Constraints
          </h2>
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
          <h2 className="text-base font-semibold text-ui-charcoal">
            Recommendations
          </h2>
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
      </section>
    </div>
  );
}
