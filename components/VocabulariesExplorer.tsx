"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type SortKey =
  | "group"
  | "domain"
  | "application"
  | "values"
  | "projects";

type SortDir = "asc" | "desc";

export interface VocabularyRow {
  domain: string;
  group: string;
  application?: string;
  valueCount: number;
  projectsUsing: number;
}

function DomainBadge({ domain }: { domain: string }) {
  return (
    <span className="inline-block rounded bg-brand-huckleberry/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-huckleberry">
      {domain}
    </span>
  );
}

function SortHeader({
  label,
  sortKey,
  activeKey,
  activeDir,
  onSort,
  align = "left",
  numeric = false,
}: {
  label: string;
  sortKey: SortKey;
  activeKey: SortKey;
  activeDir: SortDir;
  onSort: (k: SortKey) => void;
  align?: "left" | "right";
  numeric?: boolean;
}) {
  const isActive = activeKey === sortKey;
  const indicator = isActive ? (activeDir === "asc" ? "↑" : "↓") : "";
  return (
    <th
      scope="col"
      className={`pb-2 ${numeric ? "pl-4" : "pr-4"} text-${align}`}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`unstyled inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider transition-colors ${
          isActive ? "text-ui-charcoal" : "text-gray-500 hover:text-ui-charcoal"
        }`}
      >
        <span>{label}</span>
        <span className="w-3 text-brand-clearwater">{indicator}</span>
      </button>
    </th>
  );
}

export default function VocabulariesExplorer({
  rows,
  domains,
  applications,
}: {
  rows: VocabularyRow[];
  domains: string[];
  applications: string[];
}) {
  const [sortKey, setSortKey] = useState<SortKey>("domain");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [domainFilter, setDomainFilter] = useState<Set<string>>(new Set());
  const [applicationFilter, setApplicationFilter] = useState<string>("all");
  const [minValues, setMinValues] = useState<number>(0);

  const handleSort = (k: SortKey) => {
    if (k === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      // Numeric columns desc-first; strings asc-first.
      setSortDir(k === "values" || k === "projects" ? "desc" : "asc");
    }
  };

  const toggleDomain = (d: string) => {
    setDomainFilter((prev) => {
      const next = new Set(prev);
      if (next.has(d)) next.delete(d);
      else next.add(d);
      return next;
    });
  };

  const filteredSorted = useMemo(() => {
    const filtered = rows.filter((r) => {
      if (domainFilter.size > 0 && !domainFilter.has(r.domain)) return false;
      if (
        applicationFilter !== "all" &&
        (r.application ?? "shared") !== applicationFilter
      )
        return false;
      if (r.valueCount < minValues) return false;
      return true;
    });

    const dirMul = sortDir === "asc" ? 1 : -1;
    const sorted = [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "group":
          return a.group.localeCompare(b.group) * dirMul;
        case "domain":
          return (
            a.domain.localeCompare(b.domain) * dirMul ||
            a.group.localeCompare(b.group)
          );
        case "application":
          return (
            (a.application ?? "shared").localeCompare(
              b.application ?? "shared",
            ) *
              dirMul || a.group.localeCompare(b.group)
          );
        case "values":
          return (a.valueCount - b.valueCount) * dirMul;
        case "projects":
          return (a.projectsUsing - b.projectsUsing) * dirMul;
        default:
          return 0;
      }
    });
    return sorted;
  }, [rows, domainFilter, applicationFilter, minValues, sortKey, sortDir]);

  const visibleCount = filteredSorted.length;

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Domain
          </span>
          <div className="flex flex-wrap overflow-hidden rounded border border-gray-300 text-xs">
            {domains.map((d) => {
              const active = domainFilter.has(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleDomain(d)}
                  aria-pressed={active}
                  className={`unstyled border-l border-gray-300 px-3 py-1 first:border-l-0 transition-colors ${
                    active
                      ? "bg-ui-charcoal text-white"
                      : "bg-white text-gray-600 hover:text-ui-charcoal"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
          {domainFilter.size > 0 && (
            <button
              type="button"
              onClick={() => setDomainFilter(new Set())}
              className="unstyled text-[11px] text-gray-500 hover:text-ui-charcoal"
            >
              clear
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="application-filter"
            className="text-[11px] font-semibold uppercase tracking-wider text-gray-500"
          >
            Application
          </label>
          <select
            id="application-filter"
            value={applicationFilter}
            onChange={(e) => setApplicationFilter(e.target.value)}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-ui-charcoal focus:border-brand-clearwater focus:outline-none"
          >
            <option value="all">All applications</option>
            {applications.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="min-values"
            className="text-[11px] font-semibold uppercase tracking-wider text-gray-500"
          >
            Min values
          </label>
          <input
            id="min-values"
            type="number"
            min={0}
            value={minValues}
            onChange={(e) => setMinValues(Number(e.target.value) || 0)}
            className="w-16 rounded border border-gray-300 bg-white px-2 py-1 text-xs text-ui-charcoal focus:border-brand-clearwater focus:outline-none"
          />
        </div>

        <p className="ml-auto text-xs text-gray-500">
          Showing{" "}
          <span className="font-bold text-ui-charcoal">{visibleCount}</span> of{" "}
          {rows.length} groups
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        <table className="w-full min-w-[760px] text-left">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <SortHeader
                label="Group"
                sortKey="group"
                activeKey={sortKey}
                activeDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Domain"
                sortKey="domain"
                activeKey={sortKey}
                activeDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Application"
                sortKey="application"
                activeKey={sortKey}
                activeDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Values"
                sortKey="values"
                activeKey={sortKey}
                activeDir={sortDir}
                onSort={handleSort}
                numeric
                align="right"
              />
              <SortHeader
                label="Projects using"
                sortKey="projects"
                activeKey={sortKey}
                activeDir={sortDir}
                onSort={handleSort}
                numeric
                align="right"
              />
            </tr>
          </thead>
          <tbody>
            {filteredSorted.map((r) => (
              <tr
                key={`${r.domain}/${r.group}`}
                className="border-t border-gray-100 transition-colors hover:bg-gray-50"
              >
                <td className="py-2 pl-3 pr-4">
                  <Link
                    href={`/standards/data-model/vocabularies/${encodeURIComponent(
                      r.domain,
                    )}/${encodeURIComponent(r.group)}`}
                    className="unstyled font-mono text-xs font-semibold text-ui-charcoal hover:text-brand-clearwater"
                  >
                    {r.group}
                  </Link>
                </td>
                <td className="py-2 pr-4">
                  <DomainBadge domain={r.domain} />
                </td>
                <td className="py-2 pr-4 text-xs text-gray-700">
                  {r.application ?? (
                    <span className="italic text-gray-400">shared</span>
                  )}
                </td>
                <td className="py-2 pl-4 pr-3 text-right font-mono text-xs tabular-nums text-ui-charcoal">
                  {r.valueCount}
                </td>
                <td className="py-2 pl-4 pr-3 text-right font-mono text-xs tabular-nums text-ui-charcoal">
                  {r.projectsUsing}
                </td>
              </tr>
            ))}
            {filteredSorted.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-8 text-center text-xs text-gray-500"
                >
                  No vocabulary groups match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
