import Link from "next/link";
import { Callout } from "@/components/Callout";
import PortfolioCard from "@/components/PortfolioCard";
import PortfolioFilters from "@/components/PortfolioFilters";
import {
  listApplications,
  groupByHomeUnit,
  type ApplicationWithBlockers,
} from "@/lib/work";
import {
  WORK_CATEGORIES,
  WORK_CATEGORY_LABELS,
  type WorkCategory,
} from "@/lib/work-categories";
import {
  PUBLIC_STAGE_LABEL,
  PUBLIC_STAGE_ORDER,
  STAGE_OPERATIONAL_ROLLUP,
  isProjectStatus,
  publicStageFromStatus,
  type ProjectStatus,
  type PublicStage,
} from "@/lib/portfolio";

export const dynamic = "force-dynamic";

type SortMode = "default" | "name" | "blockers";

interface PortfolioSearchParams {
  unit?: string;
  stage?: string;
  status?: string;
  category?: string;
  blockers?: string;
  sort?: string;
}

function isWorkCategory(v: string | undefined): v is WorkCategory {
  return !!v && (WORK_CATEGORIES as readonly string[]).includes(v);
}

function isPublicStage(v: string | undefined): v is PublicStage {
  return !!v && (PUBLIC_STAGE_ORDER as readonly string[]).includes(v);
}

function isSortMode(v: string | undefined): v is SortMode {
  return v === "default" || v === "name" || v === "blockers";
}

function severityWeight(s: "low" | "medium" | "high"): number {
  return s === "high" ? 3 : s === "medium" ? 2 : 1;
}

function sortFor(mode: SortMode) {
  if (mode === "name") {
    return (a: ApplicationWithBlockers, b: ApplicationWithBlockers) =>
      a.name.localeCompare(b.name);
  }
  if (mode === "blockers") {
    return (a: ApplicationWithBlockers, b: ApplicationWithBlockers) => {
      const aw = a.activeBlockers.reduce(
        (sum, x) => sum + severityWeight(x.severity),
        0
      );
      const bw = b.activeBlockers.reduce(
        (sum, x) => sum + severityWeight(x.severity),
        0
      );
      if (aw !== bw) return bw - aw;
      return a.name.localeCompare(b.name);
    };
  }
  return null; // "default" — keep home-unit grouping
}

export default async function PortfolioPage({
  searchParams,
}: {
  searchParams: Promise<PortfolioSearchParams>;
}) {
  const params = await searchParams;
  const selectedUnit = params.unit?.trim() || null;
  const selectedStage: PublicStage | null = isPublicStage(params.stage?.trim())
    ? (params.stage!.trim() as PublicStage)
    : null;
  const rawStatus = params.status?.trim();
  const selectedStatus: ProjectStatus | null =
    rawStatus && isProjectStatus(rawStatus) ? rawStatus : null;
  const selectedCategory: WorkCategory | null = isWorkCategory(
    params.category?.trim()
  )
    ? (params.category!.trim() as WorkCategory)
    : null;
  const blockersOnly = params.blockers === "1";
  const sortMode: SortMode = isSortMode(params.sort) ? params.sort : "default";

  const allApps = await listApplications({ audience: "public" });

  // Build filter option lists from the unfiltered set so users see what's
  // available to filter by even after they've applied something.
  const homeUnitCounts = new Map<string, number>();
  const stageCounts = new Map<PublicStage, number>();
  const operationalCounts = new Map<ProjectStatus, number>();
  const categoryCounts = new Map<WorkCategory, number>();
  for (const app of allApps) {
    for (const unit of app.homeUnits) {
      homeUnitCounts.set(unit, (homeUnitCounts.get(unit) ?? 0) + 1);
    }
    const stage = publicStageFromStatus(app.status);
    stageCounts.set(stage, (stageCounts.get(stage) ?? 0) + 1);
    if (isProjectStatus(app.status)) {
      operationalCounts.set(
        app.status,
        (operationalCounts.get(app.status) ?? 0) + 1
      );
    }
    for (const cat of app.workCategories) {
      categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
    }
  }
  const homeUnitOptions = Array.from(homeUnitCounts.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const stageFilterOptions = PUBLIC_STAGE_ORDER.filter((s) =>
    stageCounts.has(s)
  ).map((stage) => ({ stage, count: stageCounts.get(stage)! }));
  const operationalFilterOptions = Array.from(operationalCounts.entries()).map(
    ([status, count]) => ({ status, count })
  );
  // Category options follow the canonical taxonomy order from
  // lib/work-categories.ts. Categories with zero tagged projects
  // are dropped — no point offering an empty filter.
  const categoryOptions = WORK_CATEGORIES.filter((slug) =>
    categoryCounts.has(slug)
  ).map((slug) => ({
    value: slug,
    label: WORK_CATEGORY_LABELS[slug].label,
    count: categoryCounts.get(slug) ?? 0,
  }));

  // Apply filters. Stage matches if the row's status rolls up into the
  // selected stage; an explicit operational status filter is more
  // specific and supersedes stage.
  const filtered = allApps.filter((app) => {
    if (selectedUnit && !app.homeUnits.includes(selectedUnit)) return false;
    if (selectedStatus && app.status !== selectedStatus) return false;
    if (selectedStage && !selectedStatus) {
      const rollup = STAGE_OPERATIONAL_ROLLUP[selectedStage] as readonly string[];
      if (!rollup.includes(app.status)) return false;
    }
    if (selectedCategory && !app.workCategories.includes(selectedCategory))
      return false;
    if (blockersOnly && app.activeBlockers.length === 0) return false;
    return true;
  });

  const blockerCount = allApps.reduce(
    (sum, a) => sum + a.activeBlockers.length,
    0
  );
  const embargoedCount = allApps.filter(
    (a) => a.visibilityTier === "embargoed"
  ).length;

  // Render either grouped or flat based on sort mode
  const sorter = sortFor(sortMode);
  const flatSorted = sorter ? [...filtered].sort(sorter) : null;
  const groups = sorter ? null : groupByHomeUnit(filtered);

  return (
    <div className="space-y-10">
      {/* Header */}
      <header className="space-y-5">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
            Projects
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-black">
            AI Projects for Operational Excellence
          </h1>
        </div>

        {/* Stat-strip lede — the page's headline answer per ADR 0001 */}
        <div>
          <p className="text-2xl font-black tracking-tight text-brand-black md:text-3xl">
            <span className="tabular-nums">{allApps.length}</span> projects
            across{" "}
            <span className="tabular-nums">{homeUnitOptions.length}</span>{" "}
            home units
          </p>
          <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-base font-medium text-ink-muted">
            {PUBLIC_STAGE_ORDER.filter((s) => (stageCounts.get(s) ?? 0) > 0).map(
              (stage, idx) => (
                <span key={stage} className="inline-flex items-baseline">
                  {idx > 0 && (
                    <span aria-hidden className="mr-2 text-brand-silver">
                      ·
                    </span>
                  )}
                  <span className="tabular-nums font-semibold text-brand-black">
                    {stageCounts.get(stage)}
                  </span>
                  <span className="ml-1.5">
                    {PUBLIC_STAGE_LABEL[stage].toLowerCase()}
                  </span>
                </span>
              )
            )}
            {blockerCount > 0 && (
              <span className="inline-flex items-baseline">
                <span aria-hidden className="mr-2 text-brand-silver">
                  ·
                </span>
                <span className="tabular-nums font-semibold text-amber-700">
                  {blockerCount}
                </span>
                <span className="ml-1.5 text-amber-700">
                  active blocker{blockerCount === 1 ? "" : "s"}
                </span>
              </span>
            )}
          </p>
        </div>

        {/* Caption + secondary embargo signal */}
        <p className="max-w-3xl text-sm leading-relaxed text-ink-muted">
          A growing inventory of AI-powered efforts across University of Idaho
          units &mdash; some built by IIDS, others led by partner units. Each
          entry names a{" "}
          <span className="font-medium text-brand-black">UI home unit</span>{" "}
          and{" "}
          <span className="font-medium text-brand-black">
            operational owner
          </span>
          .
          {embargoedCount > 0 && (
            <>
              {" "}
              <span className="tabular-nums font-medium text-brand-black">
                {embargoedCount}
              </span>{" "}
              entr{embargoedCount === 1 ? "y has" : "ies have"} deployment
              detail embargoed.
            </>
          )}
        </p>

        {/* CTA — gold-bordered, the only Pride Gold moment in the header */}
        <div>
          <Link
            href="/builder-guide"
            className="unstyled inline-flex items-center gap-1.5 rounded-md border-2 border-ui-gold bg-ui-gold/10 px-3.5 py-1.5 text-sm font-semibold text-brand-black transition-colors hover:bg-ui-gold/25"
          >
            Submit a new AI project &rarr;
          </Link>
        </div>
      </header>

      {/* Browse-by-problem entry strip — categories are also reachable
          via filter chips inside PortfolioFilters in spirit, but cold
          visitors need a discoverable announcement that the by-problem
          axis exists. ADR 0003 designated /portfolio's chips as the
          home for this browse; this strip makes the claim visible.
          Refinement (composing with stage/unit/blockers) lives in the
          filter component below. Per #260. */}
      <section aria-labelledby="browse-by-problem-heading">
        <p
          id="browse-by-problem-heading"
          className="text-xs font-medium uppercase tracking-wider text-brand-silver"
        >
          Browse by problem
        </p>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">
          The kinds of operational work AI is helping with at UI &mdash;
          pick a category to filter the projects below.
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {(() => {
            const categoryHref = (cat: string | null) => {
              const sp = new URLSearchParams();
              if (selectedUnit) sp.set("unit", selectedUnit);
              if (selectedStage) sp.set("stage", selectedStage);
              if (selectedStatus) sp.set("status", selectedStatus);
              if (cat) sp.set("category", cat);
              if (blockersOnly) sp.set("blockers", "1");
              if (sortMode !== "default") sp.set("sort", sortMode);
              const qs = sp.toString();
              return qs ? `/portfolio?${qs}` : "/portfolio";
            };
            const allActive = !selectedCategory;
            return (
              <>
                <Link
                  href={categoryHref(null)}
                  className={`unstyled inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                    allActive
                      ? "border-ui-gold bg-ui-gold/15 text-brand-black"
                      : "border-hairline bg-white text-ink-muted hover:border-brand-silver/40 hover:bg-surface-alt"
                  }`}
                >
                  All categories
                  <span className="rounded-full bg-surface-alt px-1.5 py-0 text-[10px] font-semibold text-ink-subtle">
                    {allApps.length}
                  </span>
                </Link>
                {categoryOptions.map((c) => {
                  const active = selectedCategory === c.value;
                  return (
                    <Link
                      key={c.value}
                      href={categoryHref(c.value)}
                      className={`unstyled inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                        active
                          ? "border-ui-gold bg-ui-gold/15 text-brand-black"
                          : "border-hairline bg-white text-ink-muted hover:border-brand-silver/40 hover:bg-surface-alt"
                      }`}
                    >
                      {c.label}
                      <span
                        className={`rounded-full px-1.5 py-0 text-[10px] font-semibold ${
                          active
                            ? "bg-brand-black/10 text-brand-black"
                            : "bg-surface-alt text-ink-subtle"
                        }`}
                      >
                        {c.count}
                      </span>
                    </Link>
                  );
                })}
              </>
            );
          })()}
        </div>
      </section>

      {/* Filter / sort UI */}
      <PortfolioFilters
        homeUnits={homeUnitOptions}
        stageOptions={stageFilterOptions}
        operationalOptions={operationalFilterOptions}
        totalCount={allApps.length}
        filteredCount={filtered.length}
        blockerCount={blockerCount}
        selected={{
          unit: selectedUnit,
          stage: selectedStage,
          status: selectedStatus,
          category: selectedCategory,
          blockers: blockersOnly,
          sort: sortMode,
        }}
      />

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-brand-silver/40 bg-white/50 p-8 text-center">
          <p className="text-sm text-ink-subtle">
            No projects match the current filters.{" "}
            <Link
              href="/portfolio"
              className="text-brand-black hover:underline"
            >
              Clear filters
            </Link>
            .
          </p>
        </div>
      )}

      {/* Sorted-flat view */}
      {flatSorted && flatSorted.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {flatSorted.map((app) => (
            <PortfolioCard key={app.id} app={app} audience="public" />
          ))}
        </div>
      )}

      {/* Grouped-by-home-unit view */}
      {groups &&
        groups.length > 0 &&
        groups.map(({ unit, items }) => (
          <section key={unit} className="space-y-4">
            <div className="flex items-baseline gap-3">
              <h2 className="text-xl font-black tracking-tight text-brand-black">{unit}</h2>
              <span className="text-sm text-ink-subtle">
                {items.length}{" "}
                {items.length === 1 ? "project" : "projects"}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((app) => (
                <PortfolioCard key={app.id} app={app} audience="public" />
              ))}
            </div>
          </section>
        ))}

      {/* AI4RA pointer — uses subtle Callout surface so it doesn't read
          as a 15th project card. */}
      <Callout tone="subtle" eyebrow="About AI4RA">
        <p className="text-sm leading-relaxed">
          <span className="font-semibold text-brand-black">AI4RA</span> is a
          UI + Southern Utah University NSF GRANTED partnership producing
          open-source reference tools for research administration. Its
          projects &mdash; the UDM spec, prompt library, evaluation harness
          &mdash; are reference material, not UI projects.
        </p>
        <p className="mt-3 text-sm">
          <Link
            href="/ai4ra-ecosystem"
            className="font-medium text-brand-black hover:underline"
          >
            See the AI4RA ecosystem &rarr;
          </Link>
        </p>
      </Callout>
    </div>
  );
}
