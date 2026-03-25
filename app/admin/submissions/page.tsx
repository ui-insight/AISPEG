"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { DEPARTMENTS } from "@/lib/builder-guide-data";

// ── Types ────────────────────────────────────────────────────

interface SubmissionRow {
  id: string;
  idea_text: string;
  score: number;
  tier: number;
  submitter_name: string | null;
  submitter_email: string | null;
  department: string | null;
  status: string;
  created_at: string;
}

interface ApiResponse {
  rows: SubmissionRow[];
  total: number;
  limit: number;
  offset: number;
}

// ── Constants ────────────────────────────────────────────────

const PAGE_SIZE = 20;

const TIER_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "T1 Static", color: "bg-green-100 text-green-700" },
  2: { label: "T2 Standard", color: "bg-yellow-100 text-yellow-700" },
  3: { label: "T3 Managed", color: "bg-orange-100 text-orange-700" },
  4: { label: "T4 Enterprise", color: "bg-red-100 text-red-700" },
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  reviewed: "bg-purple-100 text-purple-700",
  "in-progress": "bg-green-100 text-green-700",
  archived: "bg-gray-100 text-gray-500",
};

type SortField = "created_at" | "score" | "tier" | "submitter_name" | "department" | "status";
type SortOrder = "asc" | "desc";

// ── Sort Header Component ────────────────────────────────────

function SortHeader({
  label,
  field,
  currentSort,
  currentOrder,
  onSort,
  className,
}: {
  label: string;
  field: SortField;
  currentSort: SortField;
  currentOrder: SortOrder;
  onSort: (field: SortField) => void;
  className?: string;
}) {
  const isActive = currentSort === field;
  return (
    <th
      className={`px-4 py-3 cursor-pointer select-none hover:text-ui-gold-dark transition-colors ${className || ""}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        {label}
        {isActive ? (
          <svg className="h-3.5 w-3.5 text-ui-gold" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={currentOrder === "asc" ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
            />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
        )}
      </div>
    </th>
  );
}

// ── Main Component ───────────────────────────────────────────

export default function AdminSubmissionsPage() {
  // Data state
  const [rows, setRows] = useState<SubmissionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  // Sort state
  const [sortField, setSortField] = useState<SortField>("created_at");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Pagination
  const [page, setPage] = useState(0);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0); // Reset to first page on new search
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [statusFilter, tierFilter, departmentFilter]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (statusFilter) params.set("status", statusFilter);
    if (tierFilter) params.set("tier", tierFilter);
    if (departmentFilter) params.set("department", departmentFilter);
    params.set("sort", sortField);
    params.set("order", sortOrder);
    params.set("limit", String(PAGE_SIZE));
    params.set("offset", String(page * PAGE_SIZE));

    try {
      const res = await fetch(`/api/submissions?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch submissions");
      const data: ApiResponse = await res.json();
      setRows(data.rows);
      setTotal(data.total);
    } catch {
      setError("Could not load submissions. Check database connection.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, tierFilter, departmentFilter, sortField, sortOrder, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((o) => (o === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder(field === "created_at" ? "desc" : "asc");
    }
  };

  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Stats (from current filtered total + loaded rows for breakdown)
  const stats = [
    { label: "Total", value: total, color: "text-ui-charcoal" },
    { label: "Showing", value: rows.length, color: "text-blue-600" },
    { label: "Page", value: totalPages > 0 ? `${page + 1} / ${totalPages}` : "—", color: "text-green-600" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">Submissions Explorer</h1>
        <p className="mt-2 text-gray-600">
          Search, filter, and explore App Builder Guide submissions.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{stat.label}</p>
            <p className={`mt-1 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          {/* Search */}
          <div className="flex-1">
            <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
              Search
            </label>
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ideas, names, emails..."
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-10 pr-3 text-sm focus:border-ui-gold focus:outline-none focus:ring-1 focus:ring-ui-gold"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Status Filter */}
          <div className="md:w-40">
            <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm focus:border-ui-gold focus:outline-none focus:ring-1 focus:ring-ui-gold"
            >
              <option value="">All Statuses</option>
              <option value="new">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="in-progress">In Progress</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Tier Filter */}
          <div className="md:w-36">
            <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
              Tier
            </label>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm focus:border-ui-gold focus:outline-none focus:ring-1 focus:ring-ui-gold"
            >
              <option value="">All Tiers</option>
              <option value="1">T1 — Static</option>
              <option value="2">T2 — Standard</option>
              <option value="3">T3 — Managed</option>
              <option value="4">T4 — Enterprise</option>
            </select>
          </div>

          {/* Department Filter */}
          <div className="md:w-52">
            <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
              Department
            </label>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 text-sm focus:border-ui-gold focus:outline-none focus:ring-1 focus:ring-ui-gold"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(search || statusFilter || tierFilter || departmentFilter) && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setTierFilter("");
                setDepartmentFilter("");
              }}
              className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors whitespace-nowrap"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <SortHeader
                label="Date"
                field="created_at"
                currentSort={sortField}
                currentOrder={sortOrder}
                onSort={handleSort}
                className="whitespace-nowrap"
              />
              <th className="px-4 py-3">Idea</th>
              <SortHeader
                label="Submitter"
                field="submitter_name"
                currentSort={sortField}
                currentOrder={sortOrder}
                onSort={handleSort}
                className="whitespace-nowrap"
              />
              <SortHeader
                label="Department"
                field="department"
                currentSort={sortField}
                currentOrder={sortOrder}
                onSort={handleSort}
                className="whitespace-nowrap"
              />
              <SortHeader
                label="Tier"
                field="tier"
                currentSort={sortField}
                currentOrder={sortOrder}
                onSort={handleSort}
                className="whitespace-nowrap"
              />
              <SortHeader
                label="Score"
                field="score"
                currentSort={sortField}
                currentOrder={sortOrder}
                onSort={handleSort}
                className="whitespace-nowrap"
              />
              <SortHeader
                label="Status"
                field="status"
                currentSort={sortField}
                currentOrder={sortOrder}
                onSort={handleSort}
                className="whitespace-nowrap"
              />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && rows.length === 0 ? (
              // Skeleton loading
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3"><div className="h-4 w-20 rounded bg-gray-200" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-48 rounded bg-gray-200" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-24 rounded bg-gray-200" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-28 rounded bg-gray-200" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-gray-200" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-10 rounded bg-gray-200" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-16 rounded bg-gray-200" /></td>
                </tr>
              ))
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center">
                  <div className="text-gray-400">
                    <svg className="mx-auto h-8 w-8 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-medium">No submissions found</p>
                    <p className="mt-1 text-xs">
                      {search || statusFilter || tierFilter || departmentFilter
                        ? "Try adjusting your filters or search terms."
                        : "Submissions will appear here as users complete the Builder Guide."}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const t = TIER_LABELS[row.tier] || TIER_LABELS[1];
                const sc = STATUS_COLORS[row.status] || STATUS_COLORS.new;
                return (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="whitespace-nowrap px-4 py-3 text-gray-500">
                      {new Date(row.created_at).toLocaleDateString()}
                    </td>
                    <td className="max-w-xs px-4 py-3">
                      <Link
                        href={`/admin/submissions/${row.id}`}
                        className="font-medium text-ui-charcoal hover:text-ui-gold-dark line-clamp-1"
                      >
                        {row.idea_text || "(no description)"}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                      {row.submitter_name || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-gray-600 max-w-[180px] truncate">
                      {row.department || "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${t.color}`}>
                        {t.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-gray-600">
                      {row.score}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${sc}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total} submissions
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                page === 0
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-ui-charcoal"
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                page >= totalPages - 1
                  ? "border-gray-200 text-gray-300 cursor-not-allowed"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-ui-charcoal"
              }`}
            >
              Next
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
