"use client";

import Link from "next/link";
import {
  OPERATIONAL_LABEL,
  PUBLIC_STAGE_LABEL,
  PUBLIC_STAGE_ORDER,
  STAGE_OPERATIONAL_ROLLUP,
  publicStageFromStatus,
} from "@/lib/lifecycle-display";
import type { ProjectStatus, PublicStage } from "@/lib/portfolio";

// Pure URL-state filter chip group. The portfolio page builds the option
// lists from the unfiltered data and passes them in; clicking a pill
// updates the searchParams via plain anchor navigation, which re-renders
// the server component with the new filter applied.

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
          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      {label}
      {typeof count === "number" && (
        <span
          className={`rounded-full px-1.5 py-0 text-[10px] font-semibold ${
            active ? "bg-brand-black/10 text-brand-black" : "bg-gray-100 text-gray-500"
          }`}
        >
          {count}
        </span>
      )}
    </Link>
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

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-gray-500">
            Filter &amp; sort
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Showing {filteredCount} of {totalCount} interventions
            {blockerCount > 0 && (
              <span className="ml-2 text-amber-700">
                · {blockerCount} active blocker{blockerCount === 1 ? "" : "s"}
              </span>
            )}
          </p>
        </div>
        {filtersActive && (
          <Link
            href="/portfolio"
            className="text-xs font-medium text-brand-black hover:underline"
          >
            Clear filters &times;
          </Link>
        )}
      </div>

      {/* Home unit pills */}
      <div className="mt-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          Home unit
        </p>
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
      </div>

      {/* Category pills */}
      <div className="mt-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          Category
        </p>
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
      </div>

      {/* Stage pills (top tier) — public stage rollup from ADR 0001 */}
      <div className="mt-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
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
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
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

      {/* Blocker toggle + sort */}
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Show only
          </p>
          <Chip
            label="With active blockers"
            count={blockerCount}
            active={selected.blockers}
            href={buildHref({
              ...baseParams,
              blockers: selected.blockers ? null : "1",
            })}
          />
        </div>
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Sort by
          </p>
          <div className="flex flex-wrap gap-1.5">
            <Chip
              label="Home unit"
              active={selected.sort === "default"}
              href={buildHref({ ...baseParams, sort: null })}
            />
            <Chip
              label="Name"
              active={selected.sort === "name"}
              href={buildHref({ ...baseParams, sort: "name" })}
            />
            <Chip
              label="Most blockers"
              active={selected.sort === "blockers"}
              href={buildHref({ ...baseParams, sort: "blockers" })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
