"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  OPERATIONAL_LABEL,
  PUBLIC_STAGE_LABEL,
  PUBLIC_STAGE_ORDER,
  STAGE_OPERATIONAL_ROLLUP,
  publicStageFromStatus,
  type ProjectStatus,
  type PublicStage,
} from "@/lib/portfolio";

// Pure URL-state filter chip group. The portfolio page builds the option
// lists from the unfiltered data and passes them in; clicking a pill
// updates the searchParams via plain anchor navigation, which re-renders
// the server component with the new filter applied.
//
// Layout follows the IA from #209: Stage stays default-visible (it's the
// most-asked-about facet from ADR 0001). Home Unit and Category collapse
// behind native <details> disclosures that auto-open whenever a filter
// inside is active, so the active state is never hidden. Sort moves to a
// native <select> aligned with the result-count line.

interface FilterOption {
  label: string;
  value: string;
  count: number;
}

interface StageFilterOption {
  stage: PublicStage;
  count: number;
}

interface OperationalFilterOption {
  status: ProjectStatus;
  count: number;
}

export interface PortfolioFiltersProps {
  homeUnits: FilterOption[];
  stageOptions: StageFilterOption[];
  operationalOptions: OperationalFilterOption[];
  categories: FilterOption[];
  totalCount: number;
  filteredCount: number;
  blockerCount: number;
  selected: {
    unit: string | null;
    stage: PublicStage | null;
    status: ProjectStatus | null;
    category: string | null;
    blockers: boolean;
    sort: "default" | "name" | "blockers";
  };
}

function buildHref(params: Record<string, string | null>): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value && value.length > 0) sp.set(key, value);
  }
  const qs = sp.toString();
  return qs ? `/portfolio?${qs}` : "/portfolio";
}

function Chip({
  label,
  active,
  href,
  count,
}: {
  label: string;
  active: boolean;
  href: string;
  count?: number;
}) {
  return (
    <Link
      href={href}
      className={`unstyled inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-ui-gold bg-ui-gold/15 text-brand-black"
          : "border-hairline bg-white text-ink-muted hover:border-brand-silver/40 hover:bg-surface-alt"
      }`}
    >
      {label}
      {typeof count === "number" && (
        <span
          className={`rounded-full px-1.5 py-0 text-[10px] font-semibold ${
            active ? "bg-brand-black/10 text-brand-black" : "bg-surface-alt text-ink-subtle"
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  );
}

function FilterDisclosure({
  label,
  activeLabel,
  children,
}: {
  label: string;
  activeLabel: string | null;
  children: React.ReactNode;
}) {
  // <details open={…}> only honors the prop on initial mount, which is
  // exactly what we want: opens by default when something is selected,
  // but the user can collapse it manually afterwards without React
  // forcing it back open.
  return (
    <details open={activeLabel !== null} className="group">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md px-1 py-1 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle hover:text-brand-black [&::-webkit-details-marker]:hidden">
        <svg
          aria-hidden
          className="h-3 w-3 shrink-0 transition-transform group-open:rotate-90"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span>{label}</span>
        {activeLabel !== null && (
          <span className="rounded-full border border-ui-gold bg-ui-gold/15 px-2 py-0.5 text-[10px] font-medium normal-case tracking-normal text-brand-black">
            {activeLabel}
          </span>
        )}
      </summary>
      <div className="mt-2 pl-5">{children}</div>
    </details>
  );
}

export default function PortfolioFilters({
  homeUnits,
  stageOptions,
  operationalOptions,
  categories,
  totalCount,
  filteredCount,
  blockerCount,
  selected,
}: PortfolioFiltersProps) {
  const router = useRouter();

  const filtersActive =
    !!selected.unit ||
    !!selected.stage ||
    !!selected.status ||
    !!selected.category ||
    selected.blockers ||
    selected.sort !== "default";

  // Helpers — when toggling a chip, preserve other selections.
  const baseParams = {
    unit: selected.unit,
    stage: selected.stage,
    status: selected.status,
    category: selected.category,
    blockers: selected.blockers ? "1" : null,
    sort: selected.sort === "default" ? null : selected.sort,
  };

  // The drill-in stage = either the explicitly-selected stage, or the
  // stage that the selected operational status rolls up into. This way
  // selecting "Production" auto-reveals the Live drill-in.
  const activeStage: PublicStage | null =
    selected.stage ??
    (selected.status ? publicStageFromStatus(selected.status) : null);

  // Operational chips visible in the drill-in: the rollup for the active
  // stage, with counts pulled from the page's pre-computed totals.
  const drillInOperational =
    activeStage && activeStage !== "tracked"
      ? STAGE_OPERATIONAL_ROLLUP[activeStage]
          .map((status) => {
            const opt = operationalOptions.find((o) => o.status === status);
            return opt ? { status, count: opt.count } : null;
          })
          .filter((x): x is OperationalFilterOption => x !== null)
      : [];

  const activeUnitLabel =
    selected.unit && homeUnits.find((u) => u.value === selected.unit)?.label
      ? homeUnits.find((u) => u.value === selected.unit)!.label
      : null;
  const activeCategoryLabel =
    selected.category &&
    categories.find((c) => c.value === selected.category)?.label
      ? categories.find((c) => c.value === selected.category)!.label
      : null;

  const sortOptions: { value: "default" | "name" | "blockers"; label: string }[] = [
    { value: "default", label: "Home unit" },
    { value: "name", label: "Name" },
    { value: "blockers", label: "Most blockers" },
  ];

  return (
    <div className="rounded-xl border border-hairline bg-white p-5 shadow-sm">
      {/* Top row — eyebrow, result count, blockers toggle, sort, clear. */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-subtle">
            Filter &amp; sort
          </p>
          <p className="mt-1 text-sm text-ink-muted">
            Showing {filteredCount} of {totalCount} projects
            {blockerCount > 0 && (
              <span className="ml-2 text-amber-700">
                · {blockerCount} active blocker{blockerCount === 1 ? "" : "s"}
              </span>
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Chip
            label="With active blockers"
            count={blockerCount}
            active={selected.blockers}
            href={buildHref({
              ...baseParams,
              blockers: selected.blockers ? null : "1",
            })}
          />
          <label className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
            Sort
            <select
              value={selected.sort}
              onChange={(e) => {
                const v = e.target.value as "default" | "name" | "blockers";
                router.push(
                  buildHref({
                    ...baseParams,
                    sort: v === "default" ? null : v,
                  })
                );
              }}
              className="rounded-md border border-hairline bg-white px-2 py-1 text-xs font-medium text-brand-black shadow-sm focus:border-ui-gold focus:outline-none focus:ring-1 focus:ring-ui-gold"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          {filtersActive && (
            <Link
              href="/portfolio"
              className="text-xs font-medium text-brand-black hover:underline"
            >
              Clear filters &times;
            </Link>
          )}
        </div>
      </div>

      {/* Stage pills (default-visible) — public stage rollup from ADR 0001 */}
      <div className="mt-5">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
          Stage
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Chip
            label="All"
            count={totalCount}
            active={!selected.stage && !selected.status}
            href={buildHref({ ...baseParams, stage: null, status: null })}
          />
          {PUBLIC_STAGE_ORDER.map((stage) => {
            const opt = stageOptions.find((o) => o.stage === stage);
            if (!opt) return null;
            return (
              <Chip
                key={stage}
                label={PUBLIC_STAGE_LABEL[stage]}
                count={opt.count}
                active={activeStage === stage}
                href={buildHref({
                  ...baseParams,
                  stage,
                  // Selecting a stage clears any prior operational filter —
                  // the user just zoomed back out one level.
                  status: null,
                })}
              />
            );
          })}
        </div>
      </div>

      {/* Operational drill-in (second tier) — only when a non-tracked stage is active */}
      {drillInOperational.length > 0 && (
        <div className="mt-3 rounded-lg border border-hairline bg-surface-alt/40 p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
            Operational status within {PUBLIC_STAGE_LABEL[activeStage!]}
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Chip
              label="Any"
              active={!selected.status}
              href={buildHref({ ...baseParams, status: null })}
            />
            {drillInOperational.map((o) => (
              <Chip
                key={o.status}
                label={OPERATIONAL_LABEL[o.status]}
                count={o.count}
                active={selected.status === o.status}
                href={buildHref({
                  ...baseParams,
                  // Selecting an operational status implies its stage; we
                  // null `stage` so the URL stays clean (the stage is
                  // recoverable via publicStageFromStatus).
                  stage: null,
                  status: o.status,
                })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Home unit (collapsed by default; auto-opens when active) */}
      <div className="mt-5 border-t border-hairline pt-4">
        <FilterDisclosure label="Home unit" activeLabel={activeUnitLabel}>
          <div className="flex flex-wrap gap-1.5">
            <Chip
              label="All"
              count={totalCount}
              active={!selected.unit}
              href={buildHref({ ...baseParams, unit: null })}
            />
            {homeUnits.map((u) => (
              <Chip
                key={u.value}
                label={u.label}
                count={u.count}
                active={selected.unit === u.value}
                href={buildHref({ ...baseParams, unit: u.value })}
              />
            ))}
          </div>
        </FilterDisclosure>
      </div>

      {/* Category (collapsed by default; auto-opens when active) */}
      <div className="mt-3">
        <FilterDisclosure label="Category" activeLabel={activeCategoryLabel}>
          <div className="flex flex-wrap gap-1.5">
            <Chip
              label="All"
              active={!selected.category}
              href={buildHref({ ...baseParams, category: null })}
            />
            {categories.map((c) => (
              <Chip
                key={c.value}
                label={c.label}
                count={c.count}
                active={selected.category === c.value}
                href={buildHref({ ...baseParams, category: c.value })}
              />
            ))}
          </div>
        </FilterDisclosure>
      </div>
    </div>
  );
}
