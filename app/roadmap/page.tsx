import Link from "next/link";

import { institutionalQuestion } from "@/lib/data";

type PhaseStatus = "in-progress" | "next" | "planned";

const sourceInputs = [
  {
    issue: "#15",
    title: "Intent engineering as a required layer for agent strategy",
    href: "https://github.com/ui-insight/AISPEG/issues/15",
    date: "February 24, 2026",
  },
  {
    issue: "#16",
    title: "Six-axis difficulty mapping for AI workflow strategy",
    href: "https://github.com/ui-insight/AISPEG/issues/16",
    date: "February 24, 2026",
  },
];

const workstreams = [
  {
    name: "Intent Engineering",
    objective:
      "Make organizational goals and tradeoffs machine-actionable for agents.",
    outputs: [
      "Intent schema (decision rights, hard boundaries, escalation triggers)",
      "Value hierarchy templates for high-stakes workflows",
      "Alignment review rubric for autonomous decisions",
    ],
  },
  {
    name: "Difficulty-Axis Taxonomy",
    objective:
      "Classify workflows by bottleneck type before assigning tools or automation levels.",
    outputs: [
      "Scoring rubric for reasoning, effort, coordination, ambiguity, and judgment",
      "Workflow decomposition template",
      "Quarterly refresh process for taxonomy drift",
    ],
  },
  {
    name: "Task-to-Model Routing",
    objective:
      "Route each workflow step to the tool class best matched to its bottleneck.",
    outputs: [
      "Routing matrix by workflow step and difficulty axis",
      "Model/tool evaluation criteria per class",
      "Re-validation cadence tied to major model releases",
    ],
  },
  {
    name: "Governance & Safety",
    objective:
      "Define what must remain human-owned and where escalation is mandatory.",
    outputs: [
      "Non-delegable decision register",
      "Escalation policy for low-confidence or high-impact cases",
      "Audit log requirements for agent actions",
    ],
  },
];

const phases: {
  name: string;
  window: string;
  status: PhaseStatus;
  goal: string;
  deliverables: string[];
}[] = [
  {
    name: "Phase 1: Baseline",
    window: "Q1 2026",
    status: "in-progress",
    goal: "Build shared language and baseline inventory for AI-enabled workflows.",
    deliverables: [
      "Top 15 workflows inventoried and scored across difficulty axes",
      "Draft intent schema with escalation and boundary fields",
      "Initial non-delegable decision register approved",
    ],
  },
  {
    name: "Phase 2: Pilot Build",
    window: "Q2 2026",
    status: "next",
    goal: "Run high-stakes pilots with explicit intent boundaries and routing policies.",
    deliverables: [
      "Three pilot workflows decomposed into task steps",
      "Routing matrix active for pilot steps",
      "Alignment scorecard running with weekly review",
    ],
  },
  {
    name: "Phase 3: Production Controls",
    window: "Q3 2026",
    status: "planned",
    goal: "Harden governance, observability, and repeatable rollout mechanics.",
    deliverables: [
      "Intent policy templates published for new workflows",
      "Quality gates for strategic alignment added to release process",
      "Drift detection and escalation monitoring dashboard live",
    ],
  },
  {
    name: "Phase 4: Scale-Out",
    window: "Q4 2026",
    status: "planned",
    goal: "Scale the operating model across teams with measurable strategic lift.",
    deliverables: [
      "10+ workflows onboarded to the taxonomy + routing model",
      "Cross-team playbook for intent-aligned automation",
      "Quarterly roadmap review tied to outcome metrics",
    ],
  },
];

const pilotWorkflows = [
  {
    workflow: "Customer-facing support triage",
    dominantAxis: "Coordination + Ambiguity",
    executionMode: "Human-in-the-loop",
    boundary: "No policy exceptions without escalation",
  },
  {
    workflow: "Contract and policy review",
    dominantAxis: "Reasoning + Domain Expertise",
    executionMode: "Augmented review",
    boundary: "Human sign-off for material obligations",
  },
  {
    workflow: "Project intake and prioritization",
    dominantAxis: "Judgment + Tradeoffs",
    executionMode: "Human-led with AI synthesis",
    boundary: "No autonomous prioritization changes",
  },
];

const successMetrics = [
  {
    metric: "Roadmap coverage",
    target: "All AI initiatives tagged to a difficulty axis and delegation mode",
  },
  {
    metric: "Intent completeness",
    target: "100% of pilot workflows include explicit boundaries and escalation rules",
  },
  {
    metric: "Alignment quality",
    target: "Weekly scorecard shows strategic alignment in addition to speed/cost",
  },
  {
    metric: "Scale readiness",
    target: "At least one pilot meets go/no-go criteria for broader rollout",
  },
];

function StatusBadge({ status }: { status: PhaseStatus }) {
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

export default function RoadmapPage() {
  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">Planning & Roadmap</h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          2026 roadmap synthesized from external strategy inputs on intent engineering and
          difficulty-axis workflow design.
        </p>
      </div>

      <div className="rounded-xl border-l-4 border-ui-gold bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-500">Strategic Reframe</p>
        <p className="mt-2 text-gray-500 line-through">&ldquo;{institutionalQuestion.wrong}&rdquo;</p>
        <p className="mt-1 text-lg font-semibold text-ui-charcoal">
          &ldquo;{institutionalQuestion.right}&rdquo;
        </p>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-semibold text-ui-charcoal">Source Inputs</h2>
          <p className="text-sm text-gray-500">Roadmap Input Issues</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {sourceInputs.map((item) => (
            <article key={item.issue} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-ui-gold-dark">{item.issue}</p>
              <h3 className="mt-1 text-base font-semibold text-ui-charcoal">{item.title}</h3>
              <p className="mt-1 text-sm text-gray-500">Captured: {item.date}</p>
              <Link
                href={item.href}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-flex text-sm font-medium text-ui-gold-dark hover:underline"
              >
                Open issue
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-ui-charcoal">Core Workstreams</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          {workstreams.map((stream) => (
            <article key={stream.name} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-base font-semibold text-ui-charcoal">{stream.name}</h3>
              <p className="mt-2 text-sm text-gray-600">{stream.objective}</p>
              <ul className="mt-3 space-y-2">
                {stream.outputs.map((output) => (
                  <li key={output} className="flex items-start gap-2 text-sm text-gray-600">
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-ui-gold" />
                    {output}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-xl font-semibold text-ui-charcoal">Phased Delivery Plan</h2>
        {phases.map((phase, i) => (
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
              {i < phases.length - 1 && <div className="w-0.5 flex-1 bg-gray-200" />}
            </div>

            <div className="flex-1 pb-8">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-lg font-semibold text-ui-charcoal">{phase.name}</h3>
                <StatusBadge status={phase.status} />
                <span className="text-sm text-gray-500">{phase.window}</span>
              </div>
              <p className="mt-2 text-sm text-gray-600">{phase.goal}</p>
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

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-ui-charcoal">Pilot Workflow Matrix</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Workflow</th>
                <th className="px-4 py-3">Dominant Axis</th>
                <th className="px-4 py-3">Execution Mode</th>
                <th className="px-4 py-3">Hard Boundary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pilotWorkflows.map((row) => (
                <tr key={row.workflow}>
                  <td className="px-4 py-3 font-medium text-ui-charcoal">{row.workflow}</td>
                  <td className="px-4 py-3 text-gray-600">{row.dominantAxis}</td>
                  <td className="px-4 py-3 text-gray-600">{row.executionMode}</td>
                  <td className="px-4 py-3 text-gray-600">{row.boundary}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl bg-ui-charcoal p-6 text-white">
        <h2 className="text-lg font-semibold text-ui-gold">Success Metrics</h2>
        <ul className="mt-4 space-y-3">
          {successMetrics.map((item, i) => (
            <li key={item.metric} className="flex items-start gap-3 text-sm text-white/85">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-ui-gold/20 text-xs font-bold text-ui-gold">
                {i + 1}
              </span>
              <span>
                <span className="font-semibold text-white">{item.metric}:</span> {item.target}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
