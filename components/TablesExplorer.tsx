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
type ViewMode = "domain" | "flat";

export interface ProjectMeta {
  slug: string;
  application: string;
  domain: string;
}

export interface TableRow {
  project: string; // slug
  projectApplication: string;
  domain: string; // project's domain (institutional axis)
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

// ---- Mobile and desktop row renderers (shared by both views) -------------

function TableRowCard({ r }: { r: TableRow }) {
  return (
    <article className="rounded-lg border border-gray-200 bg-white p-4">
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
  );
}

// ---- By-domain view ------------------------------------------------------

interface DomainGroup {
  domain: string;
  rows: TableRow[];
  canonicalCount: number;
  extensionCount: number;
  projects: { project: string; projectApplication: string; rows: TableRow[] }[];
}

function groupByDomain(rows: TableRow[]): DomainGroup[] {
  const byDomain = new Map<string, TableRow[]>();
  for (const r of rows) {
    const arr = byDomain.get(r.domain) ?? [];
    arr.push(r);
    byDomain.set(r.domain, arr);
  }
  const groups: DomainGroup[] = [];
  for (const [domain, dRows] of byDomain.entries()) {
    const byProject = new Map<string, TableRow[]>();
    for (const r of dRows) {
      const arr = byProject.get(r.project) ?? [];
      arr.push(r);
      byProject.set(r.project, arr);
    }
    const projectsArr = Array.from(byProject.entries())
      .map(([project, rows]) => ({
        project,
        projectApplication: rows[0]?.projectApplication ?? project,
        rows: [...rows].sort((a, b) => a.name.localeCompare(b.name)),
      }))
      .sort((a, b) =>
        a.projectApplication.localeCompare(b.projectApplication),
      );
    groups.push({
      domain,
      rows: dRows,
      canonicalCount: dRows.filter((r) => r.classification === "canonical-udm")
        .length,
      extensionCount: dRows.filter(
        (r) => r.classification === "project-extension",
      ).length,
      projects: projectsArr,
    });
  }
  return groups.sort((a, b) => a.domain.localeCompare(b.domain));
}

function DomainSummary({ group }: { group: DomainGroup }) {
  const total = group.rows.length;
  const { canonicalCount, extensionCount } = group;
  const tableWord = total === 1 ? "table" : "tables";

  if (canonicalCount > 0 && extensionCount > 0) {
    return (
      <p className="mt-1 text-sm text-ink-muted">
        <span className="font-bold text-brand-black">
          {total} {tableWord}
        </span>{" "}
        — {canonicalCount} canonical UDM, {extensionCount} project-specific
      </p>
    );
  }
  if (canonicalCount > 0) {
    return (
      <p className="mt-1 text-sm text-ink-muted">
        <span className="font-bold text-brand-black">
          {total} {tableWord}
        </span>
        , all canonical UDM
      </p>
    );
  }
  return (
    <p className="mt-1 text-sm text-ink-muted">
      <span className="font-bold text-brand-black">
        {total} {tableWord}
      </span>
      , all project-specific
    </p>
  );
}

function DomainView({ groups }: { groups: DomainGroup[] }) {
  if (groups.length === 0) {
    return (
      <p className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-xs text-gray-500">
        No tables match the current filters.
      </p>
    );
  }

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <section key={group.domain} className="space-y-5">
          <header>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-clearwater">
              Domain
            </p>
            <h3 className="mt-1 text-xl font-black tracking-tight text-brand-black">
              {group.domain}
            </h3>
            <DomainSummary group={group} />
          </header>

          <div className="space-y-6">
            {group.projects.map((p) => (
              <div key={p.project} className="space-y-3">
                <h4 className="text-sm font-bold tracking-tight text-brand-black">
                  <Link
                    href={`/standards/data-model/projects/${p.project}`}
                    className="unstyled hover:text-brand-clearwater"
                  >
                    {p.projectApplication}
                  </Link>{" "}
                  <span className="text-xs font-medium text-ink-subtle">
                    · {p.rows.length}{" "}
                    {p.rows.length === 1 ? "table" : "tables"}
                  </span>
                </h4>

                {/* Mobile: card list */}
                <div className="space-y-2 sm:hidden">
                  {p.rows.map((r) => (
                    <TableRowCard key={`${r.kind}-${r.name}`} r={r} />
                  ))}
                </div>

                {/* Tablet+: simple flat list */}
                <ul className="hidden divide-y divide-gray-100 rounded-lg border border-gray-200 bg-white sm:block">
                  {p.rows.map((r) => (
                    <li
                      key={`${r.kind}-${r.name}`}
                      className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2 transition-colors hover:bg-gray-50"
                    >
                      <Link
                        href={`/standards/data-model/tables/${r.project}/${encodeURIComponent(r.name)}`}
                        className="unstyled font-mono text-xs font-semibold text-ui-charcoal hover:text-brand-clearwater"
                      >
                        {r.name}
                      </Link>
                      <ClassificationPill classification={r.classification} />
                      <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
                        {KIND_LABEL[r.kind]}
                      </span>
                      <span className="ml-auto text-xs text-gray-500">
                        <span className="font-mono tabular-nums text-ui-charcoal">
                          {r.columnCount}
                        </span>{" "}
                        {r.columnCount === 1 ? "col" : "cols"}
                        {r.relationshipCount > 0 && (
                          <>
                            <span className="mx-1.5">·</span>
                            <span className="font-mono tabular-nums text-ui-charcoal">
                              {r.relationshipCount}
                            </span>{" "}
                            {r.relationshipCount === 1 ? "rel" : "rels"}
                          </>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

// ---- Flat sortable view (the engineer's lens) ---------------------------

function FlatView({
  rows,
  sortKey,
  sortDir,
  onSort,
}: {
  rows: TableRow[];
  sortKey: SortKey;
  sortDir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  return (
    <>
      {/* Mobile: card list (< sm) */}
      <div className="space-y-2 sm:hidden">
        {rows.map((r) => (
          <TableRowCard key={`${r.project}/${r.name}/${r.kind}`} r={r} />
        ))}
        {rows.length === 0 && (
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
                onSort={onSort}
              />
              <SortHeader
                label="Project"
                sortKey="project"
                activeKey={sortKey}
                activeDir={sortDir}
                onSort={onSort}
              />
              <SortHeader
                label="Type"
                sortKey="classification"
                activeKey={sortKey}
                activeDir={sortDir}
                onSort={onSort}
              />
              <SortHeader
                label="Kind"
                sortKey="kind"
                activeKey={sortKey}
                activeDir={sortDir}
                onSort={onSort}
              />
              <SortHeader
                label="Cols"
                sortKey="columns"
                activeKey={sortKey}
                activeDir={sortDir}
                onSort={onSort}
                numeric
                align="right"
              />
              <SortHeader
                label="Rels"
                sortKey="relationships"
                activeKey={sortKey}
                activeDir={sortDir}
                onSort={onSort}
                numeric
                align="right"
              />
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
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
            {rows.length === 0 && (
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
    </>
  );
}

// ---- Shell: filters, view toggle, URL state ------------------------------

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
  const [view, setView] = useState<ViewMode>(
    searchParams.get("view") === "flat" ? "flat" : "domain",
  );

  // Reflect filter and view state into the URL so views are bookmarkable.
  useEffect(() => {
    const params = new URLSearchParams();
    if (projectFilter !== "all") params.set("project", projectFilter);
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (view !== "domain") params.set("view", view);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [projectFilter, typeFilter, view, pathname, router]);

  const handleSort = (k: SortKey) => {
    if (k === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(k);
      // Default direction: numeric columns desc-first, strings asc-first.
      setSortDir(k === "columns" || k === "relationships" ? "desc" : "asc");
    }
  };

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (projectFilter !== "all" && r.project !== projectFilter) return false;
      if (typeFilter !== "all" && r.classification !== typeFilter) return false;
      return true;
    });
  }, [rows, projectFilter, typeFilter]);

  const flatSorted = useMemo(() => {
    if (view !== "flat") return filtered;
    const dirMul = sortDir === "asc" ? 1 : -1;
    return [...filtered].sort((a, b) => {
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
  }, [filtered, view, sortKey, sortDir]);

  const domainGroups = useMemo(
    () => (view === "domain" ? groupByDomain(filtered) : []),
    [filtered, view],
  );

  return (
    <div className="space-y-6">
      {/* Toolbar: filters + view toggle */}
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

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            View
          </span>
          <div className="flex overflow-hidden rounded border border-gray-300 text-xs">
            {(
              [
                { v: "domain", label: "By domain" },
                { v: "flat", label: "Flat list" },
              ] as { v: ViewMode; label: string }[]
            ).map((opt) => {
              const active = view === opt.v;
              return (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setView(opt.v)}
                  aria-pressed={active}
                  className={`unstyled border-l border-gray-300 px-3 py-1 first:border-l-0 transition-colors ${
                    active
                      ? "bg-ui-charcoal text-white"
                      : "bg-white text-gray-600 hover:text-ui-charcoal"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <p className="ml-auto text-xs text-gray-500">
          Showing{" "}
          <span className="font-bold text-ui-charcoal">{filtered.length}</span>{" "}
          of {rows.length} tables
        </p>
      </div>

      {view === "flat" ? (
        <FlatView
          rows={flatSorted}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
        />
      ) : (
        <DomainView groups={domainGroups} />
      )}
    </div>
  );
}
