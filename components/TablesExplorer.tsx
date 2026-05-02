"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Table, TableKind } from "@/lib/governance/types";

const KIND_LABEL: Record<TableKind, string> = {
  table: "Table",
  entity: "Entity",
  projection_table: "Projection",
};

type SortKey =
  | "name"
  | "project"
  | "classification"
  | "kind"
  | "columns"
  | "relationships";

type SortDir = "asc" | "desc";

type TypeFilter = "all" | "canonical-udm" | "project-extension";

export interface ProjectMeta {
  slug: string;
  application: string;
}

export interface TableRow {
  project: string; // slug
  projectApplication: string;
  name: string;
  kind: TableKind;
  classification: Table["classification"];
  columnCount: number;
  relationshipCount: number;
}

function ClassificationPill({
  classification,
}: {
  classification: Table["classification"];
}) {
  const label =
    classification === "canonical-udm" ? "Canonical UDM" : "Extension";
  const styles =
    classification === "canonical-udm"
      ? "bg-brand-clearwater/10 text-brand-clearwater"
      : "bg-gray-100 text-gray-700";
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles}`}
    >
      {label}
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

export default function TablesExplorer({
  rows,
  projectsList,
}: {
  rows: TableRow[];
  projectsList: ProjectMeta[];
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [sortKey, setSortKey] = useState<SortKey>("project");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [projectFilter, setProjectFilter] = useState<string>(
    searchParams.get("project") ?? "all",
  );
  const [typeFilter, setTypeFilter] = useState<TypeFilter>(
    (searchParams.get("type") as TypeFilter) ?? "all",
  );

  // Reflect filter state into the URL so views are bookmarkable.
  useEffect(() => {
    const params = new URLSearchParams();
    if (projectFilter !== "all") params.set("project", projectFilter);
    if (typeFilter !== "all") params.set("type", typeFilter);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [projectFilter, typeFilter, pathname, router]);

  const handleSort = (k: SortKey) => {
    if (k === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      // Default direction: numeric columns desc-first, strings asc-first.
      setSortDir(k === "columns" || k === "relationships" ? "desc" : "asc");
    }
  };

  const filteredSorted = useMemo(() => {
    const filtered = rows.filter((r) => {
      if (projectFilter !== "all" && r.project !== projectFilter) return false;
      if (typeFilter !== "all" && r.classification !== typeFilter) return false;
      return true;
    });

    const dirMul = sortDir === "asc" ? 1 : -1;
    const sorted = [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "name":
          return a.name.localeCompare(b.name) * dirMul;
        case "project":
          return (
            a.projectApplication.localeCompare(b.projectApplication) * dirMul ||
            a.name.localeCompare(b.name)
          );
        case "classification":
          return a.classification.localeCompare(b.classification) * dirMul;
        case "kind":
          return a.kind.localeCompare(b.kind) * dirMul;
        case "columns":
          return (a.columnCount - b.columnCount) * dirMul;
        case "relationships":
          return (a.relationshipCount - b.relationshipCount) * dirMul;
        default:
          return 0;
      }
    });
    return sorted;
  }, [rows, projectFilter, typeFilter, sortKey, sortDir]);

  const visibleCount = filteredSorted.length;

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div className="flex items-center gap-2">
          <label
            htmlFor="project-filter"
            className="text-[11px] font-semibold uppercase tracking-wider text-gray-500"
          >
            Project
          </label>
          <select
            id="project-filter"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-ui-charcoal focus:border-brand-clearwater focus:outline-none"
          >
            <option value="all">All projects</option>
            {projectsList.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.application}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="type-filter"
            className="text-[11px] font-semibold uppercase tracking-wider text-gray-500"
          >
            Type
          </label>
          <select
            id="type-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="rounded border border-gray-300 bg-white px-2 py-1 text-xs text-ui-charcoal focus:border-brand-clearwater focus:outline-none"
          >
            <option value="all">All</option>
            <option value="canonical-udm">Canonical UDM</option>
            <option value="project-extension">Project extension</option>
          </select>
        </div>

        <p className="ml-auto text-xs text-gray-500">
          Showing <span className="font-bold text-ui-charcoal">{visibleCount}</span> of {rows.length} tables
        </p>
      </div>

      {/* Mobile: card list (< sm) */}
      <div className="space-y-2 sm:hidden">
        {filteredSorted.map((r) => (
          <article
            key={`${r.project}/${r.name}/${r.kind}`}
            className="rounded-lg border border-gray-200 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <Link
                  href={`/standards/data-model/tables/${r.project}/${encodeURIComponent(
                    r.name,
                  )}`}
                  className="unstyled break-all font-mono text-sm font-semibold text-ui-charcoal hover:text-brand-clearwater"
                >
                  {r.name}
                </Link>
                <Link
                  href={`/standards/data-model/projects/${r.project}`}
                  className="unstyled mt-1 block text-xs text-gray-600 hover:text-brand-clearwater"
                >
                  {r.projectApplication}
                </Link>
              </div>
              <ClassificationPill classification={r.classification} />
            </div>
            <p className="mt-3 text-xs text-gray-500">
              <span className="font-medium uppercase tracking-wider">
                {KIND_LABEL[r.kind]}
              </span>
              <span className="mx-1.5">·</span>
              <span className="font-mono tabular-nums text-ui-charcoal">
                {r.columnCount} {r.columnCount === 1 ? "col" : "cols"}
              </span>
              <span className="mx-1.5">·</span>
              <span className="font-mono tabular-nums text-ui-charcoal">
                {r.relationshipCount} {r.relationshipCount === 1 ? "rel" : "rels"}
              </span>
            </p>
          </article>
        ))}
        {filteredSorted.length === 0 && (
          <p className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-xs text-gray-500">
            No tables match the current filters.
          </p>
        )}
      </div>

      {/* Tablet+: sortable table (≥ sm) */}
      <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white sm:block">
        <table className="w-full min-w-[760px] text-left">
          <thead className="border-b border-gray-200 bg-gray-50">
            <tr>
              <SortHeader
                label="Table"
                sortKey="name"
                activeKey={sortKey}
                activeDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Project"
                sortKey="project"
                activeKey={sortKey}
                activeDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Type"
                sortKey="classification"
                activeKey={sortKey}
                activeDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Kind"
                sortKey="kind"
                activeKey={sortKey}
                activeDir={sortDir}
                onSort={handleSort}
              />
              <SortHeader
                label="Cols"
                sortKey="columns"
                activeKey={sortKey}
                activeDir={sortDir}
                onSort={handleSort}
                numeric
                align="right"
              />
              <SortHeader
                label="Rels"
                sortKey="relationships"
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
                key={`${r.project}/${r.name}/${r.kind}`}
                className="border-t border-gray-100 transition-colors hover:bg-gray-50"
              >
                <td className="py-2 pl-3 pr-4">
                  <Link
                    href={`/standards/data-model/tables/${r.project}/${encodeURIComponent(
                      r.name,
                    )}`}
                    className="unstyled font-mono text-xs font-semibold text-ui-charcoal hover:text-brand-clearwater"
                  >
                    {r.name}
                  </Link>
                </td>
                <td className="py-2 pr-4 text-xs text-gray-700">
                  <Link
                    href={`/standards/data-model/projects/${r.project}`}
                    className="unstyled hover:text-brand-clearwater"
                  >
                    {r.projectApplication}
                  </Link>
                </td>
                <td className="py-2 pr-4">
                  <ClassificationPill classification={r.classification} />
                </td>
                <td className="py-2 pr-4 text-[10px] font-medium uppercase tracking-wider text-gray-500">
                  {KIND_LABEL[r.kind]}
                </td>
                <td className="py-2 pl-4 pr-3 text-right font-mono text-xs tabular-nums text-ui-charcoal">
                  {r.columnCount}
                </td>
                <td className="py-2 pl-4 pr-3 text-right font-mono text-xs tabular-nums text-ui-charcoal">
                  {r.relationshipCount}
                </td>
              </tr>
            ))}
            {filteredSorted.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-xs text-gray-500"
                >
                  No tables match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
