"use client";

// The landscape activity table — every project and open request in one
// filterable view. Client-side filtering over rows the server page
// computes from buildUtrLandscape(); the table is a projection, so the
// name cell links each row to its full story (one-story rule).
//
// Honesty markers carry through from the model: a project destination
// that is proposed rather than running is marked "proposed", and a
// request classification from the machine pass keeps its "inferred"
// marking (title carries the rationale).

import { useMemo, useState } from "react";
import Link from "next/link";
import type { LandscapeActivity } from "@/lib/utr-landscape";
import {
  INGESTION_SOURCE_LABEL,
  INGESTION_SOURCE_ORDER,
  type IngestionSource,
} from "@/lib/ingestion-sources";
import { DEPLOYMENT_ENVIRONMENT_LABELS } from "@/lib/project-governance";

const linkCls =
  "font-medium text-brand-black underline decoration-brand-clearwater decoration-1 underline-offset-4 hover:decoration-2";

type KindFilter = "all" | "project" | "request";

/** Normalized destination key: where it runs, else where it's headed,
 *  else the explicit unclassified bucket. An authored "to-be-determined"
 *  and an unclassified request are the same fact — no destination yet —
 *  so they share the bucket (matching the model's unclassified pool). */
function destinationKey(a: LandscapeActivity): string {
  const key = a.currentTarget ?? a.proposedTarget ?? "unclassified";
  return key === "to-be-determined" ? "unclassified" : key;
}

function destinationLabel(key: string): string {
  return key === "unclassified"
    ? "Not yet targeted"
    : (DEPLOYMENT_ENVIRONMENT_LABELS[
        key as keyof typeof DEPLOYMENT_ENVIRONMENT_LABELS
      ] ?? key);
}

interface FacetOption {
  value: string;
  label: string;
  count: number;
}

function facetOptions(
  rows: LandscapeActivity[],
  key: (a: LandscapeActivity) => string | null,
  label: (value: string) => string,
  order?: (a: FacetOption, b: FacetOption) => number
): FacetOption[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const value = key(row);
    if (value === null) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  const options = [...counts.entries()].map(([value, count]) => ({
    value,
    label: label(value),
    count,
  }));
  options.sort(order ?? ((a, b) => a.label.localeCompare(b.label)));
  return options;
}

const selectCls =
  "w-full rounded-md border border-hairline bg-white px-2 py-1.5 text-xs font-medium text-brand-black shadow-sm focus:border-ui-gold focus:outline-none focus:ring-1 focus:ring-ui-gold";

function FacetSelect({
  label,
  value,
  options,
  allLabel,
  onChange,
}: {
  label: string;
  value: string;
  options: FacetOption[];
  allLabel: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block min-w-36 flex-1">
      <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={selectCls}
      >
        <option value="all">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label} ({o.count})
          </option>
        ))}
      </select>
    </label>
  );
}

function DestinationCell({ activity }: { activity: LandscapeActivity }) {
  const key = destinationKey(activity);
  const proposedOnly =
    activity.kind === "project" &&
    activity.currentTarget === null &&
    activity.proposedTarget !== null &&
    key !== "unclassified";
  const inferred =
    activity.kind === "request" && activity.provenance === "inferred";
  return (
    <span className="inline-flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
      <span className={key === "unclassified" ? "text-ink-subtle" : undefined}>
        {destinationLabel(key)}
      </span>
      {proposedOnly && (
        <span className="text-[10px] font-medium uppercase tracking-wider text-ink-subtle">
          proposed
        </span>
      )}
      {inferred && (
        <span
          title={activity.inferenceRationale ?? undefined}
          className="inline-flex items-center rounded-full border border-hairline bg-surface-alt px-1.5 py-0.5 text-[10px] font-medium text-ink-muted"
        >
          Inferred
        </span>
      )}
    </span>
  );
}

export default function ActivityTable({
  rows,
}: {
  rows: LandscapeActivity[];
}) {
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState<KindFilter>("all");
  const [source, setSource] = useState("all");
  const [status, setStatus] = useState("all");
  const [unit, setUnit] = useState("all");
  const [destination, setDestination] = useState("all");

  const sorted = useMemo(
    () =>
      [...rows].sort(
        (a, b) =>
          (a.kind === b.kind ? 0 : a.kind === "project" ? -1 : 1) ||
          a.name.localeCompare(b.name)
      ),
    [rows]
  );

  const sourceOptions = useMemo(
    () =>
      facetOptions(
        sorted,
        (a) => a.source,
        (v) => INGESTION_SOURCE_LABEL[v as IngestionSource] ?? v,
        (a, b) =>
          INGESTION_SOURCE_ORDER.indexOf(a.value as IngestionSource) -
          INGESTION_SOURCE_ORDER.indexOf(b.value as IngestionSource)
      ),
    [sorted]
  );
  const statusOptions = useMemo(
    () => facetOptions(sorted, (a) => a.statusLabel, (v) => v),
    [sorted]
  );
  const unitOptions = useMemo(
    () => facetOptions(sorted, (a) => a.unit, (v) => v),
    [sorted]
  );
  const destinationOptions = useMemo(
    () =>
      facetOptions(sorted, destinationKey, destinationLabel, (a, b) =>
        a.value === "unclassified"
          ? 1
          : b.value === "unclassified"
            ? -1
            : b.count - a.count
      ),
    [sorted]
  );

  const q = query.trim().toLowerCase();
  const filtered = sorted.filter(
    (a) =>
      (kind === "all" || a.kind === kind) &&
      (source === "all" || a.source === source) &&
      (status === "all" || a.statusLabel === status) &&
      (unit === "all" || a.unit === unit) &&
      (destination === "all" || destinationKey(a) === destination) &&
      (q === "" ||
        a.name.toLowerCase().includes(q) ||
        (a.ownerName?.toLowerCase().includes(q) ?? false) ||
        (a.unit?.toLowerCase().includes(q) ?? false))
  );

  const filtersActive =
    q !== "" ||
    kind !== "all" ||
    source !== "all" ||
    status !== "all" ||
    unit !== "all" ||
    destination !== "all";

  const projectCount = filtered.filter((a) => a.kind === "project").length;
  const requestCount = filtered.length - projectCount;

  return (
    <div className="rounded-xl border border-hairline bg-white p-5 shadow-sm">
      {/* Filter row */}
      <div className="flex flex-wrap items-end gap-3">
        <label className="block min-w-48 flex-[2]">
          <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-ink-subtle">
            Search
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Name, owner, or unit"
            className={selectCls}
          />
        </label>
        <FacetSelect
          label="Kind"
          value={kind}
          allLabel="All activity"
          options={[
            { value: "project", label: "Projects", count: sorted.filter((a) => a.kind === "project").length },
            { value: "request", label: "Open requests", count: sorted.filter((a) => a.kind === "request").length },
          ]}
          onChange={(v) => setKind(v as KindFilter)}
        />
        <FacetSelect
          label="Ingestion source"
          value={source}
          allLabel="All sources"
          options={sourceOptions}
          onChange={setSource}
        />
        <FacetSelect
          label="Status"
          value={status}
          allLabel="All statuses"
          options={statusOptions}
          onChange={setStatus}
        />
        <FacetSelect
          label="Unit"
          value={unit}
          allLabel="All units"
          options={unitOptions}
          onChange={setUnit}
        />
        <FacetSelect
          label="Hosting destination"
          value={destination}
          allLabel="All destinations"
          options={destinationOptions}
          onChange={setDestination}
        />
      </div>

      {/* Count line */}
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-hairline pt-3">
        <p className="text-sm text-ink-muted">
          Showing{" "}
          <span className="font-semibold text-brand-black">
            {filtered.length}
          </span>{" "}
          of {sorted.length} — {projectCount}{" "}
          {projectCount === 1 ? "project" : "projects"} · {requestCount} open{" "}
          {requestCount === 1 ? "request" : "requests"}
        </p>
        {filtersActive && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setKind("all");
              setSource("all");
              setStatus("all");
              setUnit("all");
              setDestination("all");
            }}
            className="text-xs font-medium text-brand-black hover:underline"
          >
            Clear filters &times;
          </button>
        )}
      </div>

      {/* Table */}
      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-hairline">
              {[
                "Name",
                "Owner / requestor",
                "Unit",
                "Ingestion source",
                "Status",
                "Hosting destination",
              ].map((h) => (
                <th
                  key={h}
                  className="py-2 pr-4 text-[11px] font-semibold uppercase tracking-wider text-ink-subtle"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((a) => (
              <tr key={`${a.kind}:${a.ref}`} className="align-baseline">
                <td className="max-w-72 py-2 pr-4">
                  <Link href={a.href} className={linkCls}>
                    {a.name}
                  </Link>
                </td>
                <td className="py-2 pr-4 text-ink-muted">
                  {a.ownerName ?? <span className="text-ink-subtle">—</span>}
                </td>
                <td className="py-2 pr-4 text-ink-muted">
                  {a.unit ?? <span className="text-ink-subtle">—</span>}
                </td>
                <td className="py-2 pr-4 text-ink-muted">
                  {a.source ? (
                    INGESTION_SOURCE_LABEL[a.source]
                  ) : (
                    <span className="text-ink-subtle">—</span>
                  )}
                </td>
                <td className="py-2 pr-4 text-ink-muted">{a.statusLabel}</td>
                <td className="py-2 text-ink-muted">
                  <DestinationCell activity={a} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-ink-subtle">
            No activity matches these filters.
          </p>
        )}
      </div>
    </div>
  );
}
