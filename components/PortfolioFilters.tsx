"use client";

import Link from "next/link";

// Pure URL-state filter chip group. The portfolio page builds the option
// lists from the unfiltered data and passes them in; clicking a pill
// updates the searchParams via plain anchor navigation, which re-renders
// the server component with the new filter applied.

interface FilterOption {
  label: string;
  value: string;
  count: number;
}

export interface PortfolioFiltersProps {
  homeUnits: FilterOption[];
  statuses: FilterOption[];
  totalCount: number;
  filteredCount: number;
  blockerCount: number;
  selected: {
    unit: string | null;
    status: string | null;
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
          ? "border-ui-gold bg-ui-gold/15 text-ui-gold-dark"
          : "border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50"
      }`}
    >
      {label}
      {typeof count === "number" && (
        <span
          className={`rounded-full px-1.5 py-0 text-[10px] font-semibold ${
            active ? "bg-ui-gold/30 text-ui-gold-dark" : "bg-gray-100 text-gray-500"
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
  statuses,
  totalCount,
  filteredCount,
  blockerCount,
  selected,
}: PortfolioFiltersProps) {
  const filtersActive =
    !!selected.unit ||
    !!selected.status ||
    selected.blockers ||
    selected.sort !== "default";

  // Helpers — when toggling a chip, preserve other selections.
  const baseParams = {
    unit: selected.unit,
    status: selected.status,
    blockers: selected.blockers ? "1" : null,
    sort: selected.sort === "default" ? null : selected.sort,
  };

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
            className="text-xs font-medium text-ui-gold-dark hover:underline"
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

      {/* Status pills */}
      <div className="mt-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
          Status
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Chip
            label="Any"
            active={!selected.status}
            href={buildHref({ ...baseParams, status: null })}
          />
          {statuses.map((s) => (
            <Chip
              key={s.value}
              label={s.label}
              count={s.count}
              active={selected.status === s.value}
              href={buildHref({ ...baseParams, status: s.value })}
            />
          ))}
        </div>
      </div>

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
