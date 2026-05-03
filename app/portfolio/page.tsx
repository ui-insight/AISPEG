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

export const dynamic = "force-dynamic";

type SortMode = "default" | "name" | "blockers";

interface PortfolioSearchParams {
  unit?: string;
  status?: string;
  category?: string;
  blockers?: string;
  sort?: string;
}

function isWorkCategory(v: string | undefined): v is WorkCategory {
  return !!v && (WORK_CATEGORIES as readonly string[]).includes(v);
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
  const selectedStatus = params.status?.trim() || null;
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
  const statusCounts = new Map<string, number>();
  const categoryCounts = new Map<WorkCategory, number>();
  for (const app of allApps) {
    for (const unit of app.homeUnits) {
      homeUnitCounts.set(unit, (homeUnitCounts.get(unit) ?? 0) + 1);
    }
    statusCounts.set(app.status, (statusCounts.get(app.status) ?? 0) + 1);
    for (const cat of app.workCategories) {
      categoryCounts.set(cat, (categoryCounts.get(cat) ?? 0) + 1);
    }
  }
  const homeUnitOptions = Array.from(homeUnitCounts.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const statusOptions = Array.from(statusCounts.entries())
    .map(([value, count]) => ({ value, label: value, count }))
    .sort((a, b) => b.count - a.count);
  // Category options follow the canonical taxonomy order from
  // lib/work-categories.ts. Categories with zero tagged interventions
  // are dropped — no point offering an empty filter.
  const categoryOptions = WORK_CATEGORIES.filter((slug) =>
    categoryCounts.has(slug)
  ).map((slug) => ({
    value: slug,
    label: WORK_CATEGORY_LABELS[slug].label,
    count: categoryCounts.get(slug) ?? 0,
  }));

  // Apply filters
  const filtered = allApps.filter((app) => {
    if (selectedUnit && !app.homeUnits.includes(selectedUnit)) return false;
    if (selectedStatus && app.status !== selectedStatus) return false;
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
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
          The Work
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-brand-black">
          AI Interventions for Operational Excellence
        </h1>
        <p className="mt-2 max-w-3xl text-gray-600">
          A growing inventory of AI-powered efforts across University of Idaho
          units — some built by IIDS, others led by partner units. Each entry
          names a{" "}
          <span className="font-medium text-ui-charcoal">UI home unit</span>{" "}
          and{" "}
          <span className="font-medium text-ui-charcoal">
            operational owner
          </span>{" "}
          whose work depends on the intervention — the people accountable for
          the outcome, not the code.
        </p>
        <p className="mt-3 text-sm text-gray-500">
          {allApps.length} interventions visible
          {embargoedCount > 0 &&
            ` · ${embargoedCount} with deployment detail embargoed`}
          {blockerCount > 0 &&
            ` · ${blockerCount} active blocker${blockerCount === 1 ? "" : "s"}`}
          {" · "}
          <Link href="/builder-guide" className="text-brand-black hover:underline">
            Submit a new AI project &rarr;
          </Link>
        </p>
      </div>

      {/* Filter / sort UI */}
      <PortfolioFilters
        homeUnits={homeUnitOptions}
        statuses={statusOptions}
        categories={categoryOptions}
        totalCount={allApps.length}
        filteredCount={filtered.length}
        blockerCount={blockerCount}
        selected={{
          unit: selectedUnit,
          status: selectedStatus,
          category: selectedCategory,
          blockers: blockersOnly,
          sort: sortMode,
        }}
      />

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white/50 p-8 text-center">
          <p className="text-sm text-gray-500">
            No interventions match the current filters.{" "}
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
                {items.length === 1 ? "intervention" : "interventions"}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {items.map((app) => (
                <PortfolioCard key={app.id} app={app} audience="public" />
              ))}
            </div>
          </section>
        ))}

      {/* Context callout — only shown when no filters active and no sort */}
      {!selectedUnit && !selectedStatus && !selectedCategory && !blockersOnly && sortMode === "default" && (
        <Callout eyebrow="How to read this inventory">
          <p className="text-sm leading-relaxed">
            Interventions are grouped by{" "}
            <strong>UI home unit</strong>. Each card shows the operational
            owner, current status, and any active blockers (with a counter
            of days since the block began). Tags signal relationships:{" "}
            <span className="inline-block rounded-full border border-brand-lupine/30 bg-brand-lupine/10 px-2 py-0.5 text-xs font-medium text-brand-lupine">
              AI4RA Core
            </span>{" "}
            means the work is part of the NSF-funded UI+SUU partnership and
            has a dual open-source / UI-implementation identity;{" "}
            <span className="inline-block rounded-full border border-brand-clearwater/40 bg-brand-clearwater/10 px-2 py-0.5 text-xs font-medium text-brand-clearwater">
              Capability diffusion
            </span>{" "}
            flags interventions where a non-IIDS UI unit is co-building;{" "}
            <span className="inline-block rounded-full border border-brand-huckleberry/30 bg-brand-huckleberry/10 px-2 py-0.5 text-xs font-medium text-brand-huckleberry">
              Tracked
            </span>{" "}
            means the work is in the inventory but is not built by IIDS.
          </p>
        </Callout>
      )}

      {/* AI4RA pointer (always at bottom) */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium text-gray-500">About AI4RA</p>
        <p className="mt-2 text-sm leading-relaxed text-gray-700">
          <span className="font-semibold text-ui-charcoal">AI4RA</span> is a
          UI + Southern Utah University NSF GRANTED partnership producing
          open-source reference tools for research administration. Its
          projects — the UDM spec, prompt library, evaluation harness — are
          reference material, not UI interventions.
        </p>
        <p className="mt-2 text-sm">
          <Link
            href="/ai4ra-ecosystem"
            className="font-medium text-brand-black hover:underline"
          >
            See the AI4RA ecosystem &rarr;
          </Link>
        </p>
      </div>
    </div>
  );
}
