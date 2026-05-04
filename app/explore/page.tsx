import Link from "next/link";
import {
  getPubliclyVisible,
  PUBLIC_STAGE_LABEL,
  stageBreakdown,
  type Project,
  type PublicStage,
} from "@/lib/portfolio";
import {
  WORK_CATEGORIES,
  WORK_CATEGORY_LABELS,
  type WorkCategory,
} from "@/lib/work-categories";
import { buildProjectMapGraph } from "@/lib/project-map-graph";
import ExploreViewToggle from "@/components/ExploreViewToggle";
import ProjectMapView from "@/components/ProjectMapView";

// Pillar code → Tailwind utility for the legend swatch. Mirrors the
// palette in components/ProjectMap.tsx; if you change one, change both.
// Keeping the mapping local rather than re-exporting from the client
// component avoids pulling the d3-shape bundle into this server file.
const PILLAR_BG: Record<string, string> = {
  A: "bg-pillar-a",
  B: "bg-pillar-b",
  C: "bg-pillar-c",
  D: "bg-pillar-d",
  E: "bg-pillar-e",
};

export const metadata = {
  title: "Explore | UI AI Initiative",
  description:
    "Browse AI projects at the University of Idaho by the kind of operational work they help with, or as a network of priorities, projects, and work categories.",
};

interface CategoryTile {
  slug: WorkCategory;
  label: string;
  description: string;
  count: number;
  representatives: string[];
  // Public-stage breakdown for this category. Suppressed when the
  // entire category sits in a single stage (avoids "4 live" tautology).
  stageBreakdown: Array<{ stage: PublicStage; count: number }>;
}

function buildTiles(projects: Project[]): CategoryTile[] {
  return WORK_CATEGORIES.map((slug) => {
    const matches = projects.filter((i) =>
      (i.workCategories ?? []).includes(slug)
    );
    const stages = stageBreakdown(matches);
    return {
      slug,
      label: WORK_CATEGORY_LABELS[slug].label,
      description: WORK_CATEGORY_LABELS[slug].description,
      count: matches.length,
      representatives: matches.slice(0, 2).map((i) => i.name),
      stageBreakdown: stages.length > 1 ? stages : [],
    };
  });
}

type View = "tiles" | "map";

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  const params = await searchParams;
  const view: View = params.view === "map" ? "map" : "tiles";

  const projects = getPubliclyVisible();
  const tiles = buildTiles(projects);

  return (
    <div className="space-y-10">
      <section>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
          Explore
        </p>
        <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">
          {view === "map"
            ? "The whole mesh: priorities, projects, and work categories"
            : "Browse projects by the kind of work they help with"}
        </h1>
        <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-muted">
          {view === "map" ? (
            <>
              Every project, every strategic priority it advances, and
              every kind of work it supports — drawn as a single network.
              Sparse seats are signal: they show where the strategic plan
              has thin coverage today.
            </>
          ) : (
            <>
              Find AI work tackling problems like yours &mdash; documents,
              processes, coordination, reconciliation, and more. Each tile
              counts the projects tagged with that kind of work and links
              straight into a filtered view of{" "}
              <Link href="/portfolio" className="font-medium text-brand-black hover:underline">
                Projects
              </Link>
              .
            </>
          )}
        </p>
        <div className="mt-6">
          <ExploreViewToggle view={view} />
        </div>
      </section>

      {view === "map" ? <MapSection /> : <TilesSection tiles={tiles} />}
    </div>
  );
}

function TilesSection({ tiles }: { tiles: CategoryTile[] }) {
  return (
    <section
      aria-label="Categories"
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
    >
      {tiles.map((tile) => (
        <CategoryTileCard key={tile.slug} tile={tile} />
      ))}
    </section>
  );
}

interface PillarSummary {
  code: string;
  name: string;
  priorityCount: number;
  uncoveredPriorityCount: number;
  projectCount: number;
}

function buildPillarSummary(): PillarSummary[] {
  // Reuse the typed graph adapter the map renders from so the legend
  // and the chart can never disagree about which priorities exist or
  // which projects align to them.
  const graph = buildProjectMapGraph("public");

  // Map: pillar code -> { name, set of priority codes, set of uncovered priority codes, set of project slugs }
  const byPillar = new Map<
    string,
    { name: string; priorities: Set<string>; uncovered: Set<string>; projects: Set<string> }
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

  // Compute uncovered priorities per pillar (priorities with zero project links).
  byPillar.forEach((entry) => {
    entry.priorities.forEach((code) => {
      if (!linkedPriorities.has(code)) entry.uncovered.add(code);
    });
  });

  // Sort by pillar code so the legend reads in the canonical order.
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

function MapSection() {
  const summary = buildPillarSummary();
  const totalUncovered = summary.reduce(
    (acc, s) => acc + s.uncoveredPriorityCount,
    0,
  );

  return (
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
            style={{ borderColor: `var(--color-pillar-${s.code.toLowerCase()})` }}
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
          <span className="font-semibold text-brand-black tabular-nums">
            {totalUncovered}
          </span>{" "}
          {totalUncovered === 1 ? "priority has" : "priorities have"} no
          aligned projects yet — they show on the arc as gaps.
        </p>
      )}
    </div>
  );
}

function CategoryTileCard({ tile }: { tile: CategoryTile }) {
  const isEmpty = tile.count === 0;

  // Empty categories render as a non-interactive tile so the taxonomy
  // stays visible (a Dean scanning for "knowledge retrieval" should see
  // it even before something is tagged) without offering a dead link.
  if (isEmpty) {
    return (
      <div
        id={`category-${tile.slug}`}
        className="flex h-full scroll-mt-12 flex-col rounded-xl border border-hairline bg-white p-5 opacity-70"
      >
        <h2 className="text-base font-semibold text-brand-black">
          {tile.label}
        </h2>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
          {tile.description}
        </p>
        <p className="mt-4 text-xs font-medium text-ink-muted">
          No projects tagged here yet
        </p>
      </div>
    );
  }

  return (
    <Link
      id={`category-${tile.slug}`}
      href={`/portfolio?category=${tile.slug}`}
      className="group flex h-full scroll-mt-12 flex-col rounded-xl border border-hairline bg-white p-5 transition-shadow hover:shadow-md"
    >
      <h2 className="text-base font-semibold text-brand-black">
        {tile.label}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink-muted">
        {tile.description}
      </p>
      <p className="mt-3 text-sm text-ink-muted">
        <span className="font-bold tabular-nums text-brand-black">
          {tile.count}
        </span>{" "}
        project{tile.count === 1 ? "" : "s"}
        {tile.representatives.length > 0 && (
          <>
            {" "}
            &middot;{" "}
            <span className="text-brand-black">
              {tile.representatives.join(", ")}
            </span>
          </>
        )}
      </p>
      {tile.stageBreakdown.length > 0 && (
        <p className="mt-1 flex-1 text-xs text-ink-muted">
          {tile.stageBreakdown.map((s, idx) => (
            <span key={s.stage}>
              {idx > 0 && (
                <span aria-hidden className="text-brand-silver">
                  {" · "}
                </span>
              )}
              <span className="font-semibold tabular-nums text-brand-black">
                {s.count}
              </span>{" "}
              {PUBLIC_STAGE_LABEL[s.stage].toLowerCase()}
            </span>
          ))}
        </p>
      )}
      {tile.stageBreakdown.length === 0 && <div className="flex-1" />}
      <p className="mt-4 text-sm font-medium text-brand-black group-hover:underline">
        View &rarr;
      </p>
    </Link>
  );
}
