import { buildProjectMapGraph } from "@/lib/project-map-graph";
import ProjectMapView from "@/components/ProjectMapView";

export const metadata = {
  title: "Strategic Plan Coverage Map — Standards",
  description:
    "Network view of University of Idaho strategic-plan priorities, the AI projects that advance them, and the kinds of work they support — drawn as a single mesh, with uncovered priorities visible as gaps.",
};

const PILLAR_BG: Record<string, string> = {
  A: "bg-pillar-a",
  B: "bg-pillar-b",
  C: "bg-pillar-c",
  D: "bg-pillar-d",
  E: "bg-pillar-e",
};

interface PillarSummary {
  code: string;
  name: string;
  priorityCount: number;
  uncoveredPriorityCount: number;
  projectCount: number;
}

function buildPillarSummary(): PillarSummary[] {
  const graph = buildProjectMapGraph("public");

  const byPillar = new Map<
    string,
    {
      name: string;
      priorities: Set<string>;
      uncovered: Set<string>;
      projects: Set<string>;
    }
  >();
  graph.priorities.forEach((p) => {
    if (!byPillar.has(p.pillar)) {
      byPillar.set(p.pillar, {
        name: p.pillarName,
        priorities: new Set(),
        uncovered: new Set(),
        projects: new Set(),
      });
    }
    byPillar.get(p.pillar)!.priorities.add(p.code);
  });

  const priorityToPillar = new Map<string, string>();
  graph.priorities.forEach((p) => priorityToPillar.set(p.code, p.pillar));

  const linkedPriorities = new Set<string>();
  for (const link of graph.links) {
    if (link.side !== "left") continue;
    linkedPriorities.add(link.target);
    const pillar = priorityToPillar.get(link.target);
    if (!pillar) continue;
    byPillar.get(pillar)?.projects.add(link.project);
  }

  byPillar.forEach((entry) => {
    entry.priorities.forEach((code) => {
      if (!linkedPriorities.has(code)) entry.uncovered.add(code);
    });
  });

  return Array.from(byPillar.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, entry]) => ({
      code,
      name: entry.name,
      priorityCount: entry.priorities.size,
      uncoveredPriorityCount: entry.uncovered.size,
      projectCount: entry.projects.size,
    }));
}

export default function StrategicPlanMapPage() {
  const summary = buildPillarSummary();
  const totalUncovered = summary.reduce(
    (acc, s) => acc + s.uncoveredPriorityCount,
    0,
  );

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-black leading-tight tracking-tight text-brand-black sm:text-4xl">
          The whole mesh: priorities, projects, and work categories
        </h1>
        <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-muted">
          Every project, every strategic priority it advances, and every kind
          of work it supports &mdash; drawn as a single network. Sparse seats
          are signal: they show where the strategic plan has thin coverage
          today.
        </p>
      </header>

      <section aria-label="Project Map" className="space-y-6">
        <PillarLegend summary={summary} totalUncovered={totalUncovered} />
        <ProjectMapView />
        <p className="max-w-prose text-sm text-ink-muted">
          Each curve links a project to a strategic priority it advances or a
          work category it supports. Hover or tab to a node to highlight its
          connections; click to open its detail page. Press{" "}
          <kbd className="rounded border border-hairline bg-surface-alt px-1.5 py-0.5 text-[11px] font-medium text-brand-black">
            Esc
          </kbd>{" "}
          to clear focus.
        </p>
      </section>
    </div>
  );
}

function PillarLegend({
  summary,
  totalUncovered,
}: {
  summary: PillarSummary[];
  totalUncovered: number;
}) {
  return (
    <div className="space-y-3">
      <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {summary.map((s) => (
          <li
            key={s.code}
            className="flex items-baseline gap-3 border-l-4 pl-3"
            style={{
              borderColor: `var(--color-pillar-${s.code.toLowerCase()})`,
            }}
          >
            <span
              aria-hidden="true"
              className={`inline-block h-2.5 w-2.5 shrink-0 translate-y-px rounded-full ${PILLAR_BG[s.code] ?? "bg-ink-muted"}`}
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-brand-black">
                <span className="tabular-nums">{s.code}.</span> {s.name}
              </p>
              <p className="text-xs text-ink-muted">
                <span className="font-semibold tabular-nums text-brand-black">
                  {s.projectCount}
                </span>{" "}
                project{s.projectCount === 1 ? "" : "s"} ·{" "}
                <span className="tabular-nums">{s.priorityCount}</span>{" "}
                priorit{s.priorityCount === 1 ? "y" : "ies"}
                {s.uncoveredPriorityCount > 0 && (
                  <>
                    {" "}
                    ·{" "}
                    <span className="text-brand-black">
                      <span className="font-semibold tabular-nums">
                        {s.uncoveredPriorityCount}
                      </span>{" "}
                      uncovered
                    </span>
                  </>
                )}
              </p>
            </div>
          </li>
        ))}
      </ul>
      {totalUncovered > 0 && (
        <p className="text-sm text-ink-muted">
          <span className="font-semibold tabular-nums text-brand-black">
            {totalUncovered}
          </span>{" "}
          {totalUncovered === 1 ? "priority has" : "priorities have"} no
          aligned projects yet — they show on the arc as gaps.
        </p>
      )}
    </div>
  );
}
