import { strategicTakeaways, institutionalQuestion } from "@/lib/data";

const phases = [
  {
    name: "Phase 1: Foundation",
    status: "in-progress" as const,
    items: [
      "Connect agent tools to secure on-prem models",
      "Build initial internal AI applications",
      "Evaluate repo-scale agent collaboration",
      "Establish AISPEG collaborative hub",
    ],
  },
  {
    name: "Phase 2: Governance & Standards",
    status: "upcoming" as const,
    items: [
      "Define approved stacks and deployment paths",
      "Create agent playbook and guidelines",
      "Establish security and documentation patterns",
      "Build reusable primitives and patterns",
    ],
  },
  {
    name: "Phase 3: Scaling",
    status: "upcoming" as const,
    items: [
      "Expand agentic AI to additional teams",
      "Develop agent orchestrator training",
      "Redesign workflows (not just automate them)",
      "Measure and report productivity multipliers",
    ],
  },
  {
    name: "Phase 4: Institutional Integration",
    status: "future" as const,
    items: [
      "Institution-wide AI strategy alignment",
      "SaaS vendor evaluation with AI leverage",
      "Cross-department knowledge sharing",
      "Mission-aligned AI capability expansion",
    ],
  },
];

function StatusBadge({ status }: { status: "in-progress" | "upcoming" | "future" }) {
  const styles = {
    "in-progress": "bg-green-100 text-green-700",
    upcoming: "bg-ui-gold/15 text-ui-gold-dark",
    future: "bg-gray-100 text-gray-500",
  };
  const labels = {
    "in-progress": "In Progress",
    upcoming: "Upcoming",
    future: "Future",
  };
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

export default function RoadmapPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">
          Planning & Roadmap
        </h1>
        <p className="mt-2 text-gray-600">
          Strategic direction and phased approach for agentic AI adoption at the
          University of Idaho.
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

      {/* Timeline */}
      <div className="space-y-6">
        {phases.map((phase, i) => (
          <div key={i} className="relative flex gap-6">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  phase.status === "in-progress"
                    ? "bg-green-500 text-white"
                    : phase.status === "upcoming"
                    ? "bg-ui-gold text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {i + 1}
              </div>
              {i < phases.length - 1 && (
                <div className="w-0.5 flex-1 bg-gray-200" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-8">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-ui-charcoal">
                  {phase.name}
                </h3>
                <StatusBadge status={phase.status} />
              </div>
              <ul className="mt-3 space-y-2">
                {phase.items.map((item, j) => (
                  <li
                    key={j}
                    className="flex items-start gap-2 text-sm text-gray-600"
                  >
                    <div
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        phase.status === "in-progress"
                          ? "bg-green-400"
                          : "bg-gray-300"
                      }`}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Strategic Takeaways */}
      <div className="rounded-xl bg-ui-charcoal p-6 text-white">
        <h2 className="text-lg font-semibold text-ui-gold">
          Strategic Takeaways
        </h2>
        <ul className="mt-4 space-y-2">
          {strategicTakeaways.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-white/80">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ui-gold/20 text-xs font-bold text-ui-gold">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>

      {/* Closing */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-base font-medium text-ui-charcoal">
          Agentic AI changes who builds tools, how they&apos;re built, and how many
          exist.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          Treat this as research and mission amplification infrastructure.
        </p>
      </div>
    </div>
  );
}
