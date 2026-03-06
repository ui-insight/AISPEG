"use client";

import { useState } from "react";

interface Project {
  name: string;
  daysActive: number;
  netNewLines: number;
  lowEstimate: string;
  highEstimate: string;
  multiplier: string;
}

interface ProjectTableProps {
  projects: Project[];
  totals: {
    daysActive: number;
    netNewLines: number;
    lowEstimate: string;
    highEstimate: string;
    multiplier: string;
  };
}

type SortKey = "name" | "daysActive" | "netNewLines";

function SortIcon({ column, sortKey, sortAsc }: { column: SortKey; sortKey: SortKey; sortAsc: boolean }) {
  if (sortKey !== column) return null;
  return (
    <svg className="ml-1 inline h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
      {sortAsc ? (
        <path d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z" />
      ) : (
        <path d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z" />
      )}
    </svg>
  );
}

export default function ProjectTable({ projects, totals }: ProjectTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("netNewLines");
  const [sortAsc, setSortAsc] = useState(false);

  const sorted = [...projects].sort((a, b) => {
    const dir = sortAsc ? 1 : -1;
    if (sortKey === "name") return dir * a.name.localeCompare(b.name);
    return dir * (a[sortKey] - b[sortKey]);
  });

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            <th
              className="cursor-pointer px-6 py-3 font-semibold text-gray-700"
              onClick={() => handleSort("name")}
            >
              Repository <SortIcon column="name" sortKey={sortKey} sortAsc={sortAsc} />
            </th>
            <th
              className="cursor-pointer px-6 py-3 text-right font-semibold text-gray-700"
              onClick={() => handleSort("daysActive")}
            >
              Days Active <SortIcon column="daysActive" sortKey={sortKey} sortAsc={sortAsc} />
            </th>
            <th
              className="cursor-pointer px-6 py-3 text-right font-semibold text-gray-700"
              onClick={() => handleSort("netNewLines")}
            >
              Net New Lines <SortIcon column="netNewLines" sortKey={sortKey} sortAsc={sortAsc} />
            </th>
            <th className="px-6 py-3 text-right font-semibold text-gray-700">
              Low Est.
            </th>
            <th className="px-6 py-3 text-right font-semibold text-gray-700">
              High Est.
            </th>
            <th className="px-6 py-3 text-right font-semibold text-gray-700">
              Multiplier
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr key={p.name} className="border-b border-gray-100 hover:bg-gray-50/50">
              <td className="px-6 py-3 font-medium text-ui-charcoal">{p.name}</td>
              <td className="px-6 py-3 text-right text-gray-600">{p.daysActive}</td>
              <td className="px-6 py-3 text-right text-gray-600">
                {p.netNewLines.toLocaleString()}
              </td>
              <td className="px-6 py-3 text-right text-gray-500">{p.lowEstimate}</td>
              <td className="px-6 py-3 text-right text-gray-500">{p.highEstimate}</td>
              <td className="px-6 py-3 text-right font-semibold text-ui-gold-dark">
                {p.multiplier}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
            <td className="px-6 py-3 text-ui-charcoal">TOTALS</td>
            <td className="px-6 py-3 text-right text-gray-700">{totals.daysActive}*</td>
            <td className="px-6 py-3 text-right text-gray-700">
              {totals.netNewLines.toLocaleString()}
            </td>
            <td className="px-6 py-3 text-right text-gray-600">{totals.lowEstimate}</td>
            <td className="px-6 py-3 text-right text-gray-600">{totals.highEstimate}</td>
            <td className="px-6 py-3 text-right text-ui-gold-dark">{totals.multiplier}</td>
          </tr>
        </tfoot>
      </table>
      <p className="px-6 py-2 text-xs text-gray-400">
        *Total reporting period. Days Active = first commit to last commit (inclusive).
        Multiplier = Low/High estimate / Days Active. Working days at 22/month.
      </p>
    </div>
  );
}
