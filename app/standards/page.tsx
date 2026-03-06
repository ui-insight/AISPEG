import Link from "next/link";

import {
  standardsRoadmapSource,
  institutionalStandards,
  standardsPhases,
  standardsSuccessMetrics,
  standardDocuments,
} from "@/lib/data";

type PhaseStatus = "in-progress" | "next" | "planned";

function PhaseStatusBadge({ status }: { status: PhaseStatus }) {
  const styles = {
    "in-progress": "bg-green-100 text-green-700",
    next: "bg-ui-gold/15 text-ui-gold-dark",
    planned: "bg-gray-100 text-gray-600",
  };
  const labels = {
    "in-progress": "In Progress",
    next: "Next",
    planned: "Planned",
  };

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

function StandardStatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Strong: "bg-green-100 text-green-700",
    Moderate: "bg-yellow-100 text-yellow-700",
    Weak: "bg-orange-100 text-orange-700",
    Missing: "bg-red-100 text-red-700",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
}

export default function StandardsPage() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">Institutional Standards Roadmap</h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          Action plan for developing and enforcing institutional AI development standards across
          seven key areas, responding to OIT leadership direction.
        </p>
      </div>

      {/* Source Attribution */}
      <div className="rounded-xl border-l-4 border-ui-gold bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Source Document</p>
        <p className="mt-2 text-lg font-semibold text-ui-charcoal">
          {standardsRoadmapSource.document}
        </p>
        <p className="mt-1 text-sm text-gray-600">
          {standardsRoadmapSource.author} &middot; {standardsRoadmapSource.date}
        </p>
        <p className="mt-2 text-sm text-gray-500">{standardsRoadmapSource.description}</p>
      </div>

      {/* Standards Overview Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-ui-charcoal">Standards at a Glance</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {institutionalStandards.map((standard) => {
            const hasDoc = standardDocuments.some((d) => d.id === standard.id);
            const card = (
              <article
                className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-colors ${
                  hasDoc ? "hover:border-ui-gold" : ""
                }`}
              >
                <div className="flex items-center gap-2">
                  <StandardStatusBadge status={standard.currentStatus} />
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                    {standard.phase}
                  </span>
                </div>
                <h3 className="mt-3 text-base font-semibold text-ui-charcoal">{standard.name}</h3>
                <p className="mt-1 text-sm text-gray-600 line-clamp-2">{standard.description}</p>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-xs text-gray-400">Owner: {standard.owner}</p>
                  {hasDoc && (
                    <span className="text-xs font-medium text-ui-gold-dark">
                      View standard &rarr;
                    </span>
                  )}
                </div>
              </article>
            );

            return hasDoc ? (
              <Link key={standard.id} href={`/standards/${standard.id}`}>
                {card}
              </Link>
            ) : (
              <div key={standard.id}>{card}</div>
            );
          })}
        </div>
      </section>

      {/* Detailed Standard Cards */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-ui-charcoal">Detailed Standards Assessment</h2>
        <div className="space-y-4">
          {institutionalStandards.map((standard) => (
            <article
              key={standard.id}
              className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-semibold text-ui-charcoal">{standard.name}</h3>
                <StandardStatusBadge status={standard.currentStatus} />
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                  {standard.phase}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{standard.description}</p>

              <div className="mt-4 grid gap-6 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-700">
                    What Exists Today
                  </p>
                  <ul className="mt-2 space-y-2">
                    {standard.existsToday.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ui-gold" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-red-600">
                    Gaps to Fill
                  </p>
                  <ul className="mt-2 space-y-2">
                    {standard.gapsToFill.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gray-300" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-gray-100 pt-3 text-xs text-gray-500">
                <span>
                  <span className="font-medium text-gray-700">Owner:</span> {standard.owner}
                </span>
                <span>
                  <span className="font-medium text-gray-700">Enforcement:</span>{" "}
                  {standard.enforcement}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Phased Delivery Timeline */}
      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-ui-charcoal">Phased Delivery Plan</h2>
        {standardsPhases.map((phase, i) => (
          <article key={phase.name} className="relative flex gap-6">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  phase.status === "in-progress"
                    ? "bg-green-500 text-white"
                    : phase.status === "next"
                    ? "bg-ui-gold text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {i + 1}
              </div>
              {i < standardsPhases.length - 1 && <div className="w-0.5 flex-1 bg-gray-200" />}
            </div>

            <div className="flex-1 pb-8">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-semibold text-ui-charcoal">{phase.name}</h3>
                <PhaseStatusBadge status={phase.status} />
                <span className="text-sm text-gray-500">{phase.window}</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{phase.goal}</p>

              <div className="mt-2">
                <p className="text-xs font-medium text-gray-500">
                  Standards: {phase.standards.join(", ")}
                </p>
              </div>

              <ul className="mt-3 space-y-2">
                {phase.deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-gray-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </section>

      {/* Summary Table */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-ui-charcoal">Standards Summary</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Standard</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Enforcement</th>
                <th className="px-4 py-3">Phase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {institutionalStandards.map((standard) => (
                <tr key={standard.id}>
                  <td className="px-4 py-3 font-medium text-ui-charcoal">{standard.name}</td>
                  <td className="px-4 py-3">
                    <StandardStatusBadge status={standard.currentStatus} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">{standard.owner}</td>
                  <td className="max-w-xs px-4 py-3 text-gray-600">{standard.enforcement}</td>
                  <td className="px-4 py-3 text-gray-600">{standard.phase}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="rounded-xl bg-ui-charcoal p-6 text-white">
        <h2 className="text-lg font-semibold text-ui-gold">Success Metrics</h2>
        <ul className="mt-4 space-y-3">
          {standardsSuccessMetrics.map((item, i) => (
            <li key={item.metric} className="flex items-start gap-3 text-sm text-white/85">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ui-gold/20 text-xs font-bold text-ui-gold">
                {i + 1}
              </span>
              <span>
                <span className="font-semibold text-white">{item.metric}:</span> {item.target}
                <span className="ml-2 text-white/50">({item.measureBy})</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
