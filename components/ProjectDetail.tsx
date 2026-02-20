"use client";

import { useState } from "react";

interface ProjectDetailProps {
  name: string;
  description: string;
  activePeriod: string;
  contributors: string;
  commits: number;
  linesAdded: number;
  linesDeleted: number;
  netNewLines: number;
  filesChanged: number;
  multiplier: string;
}

export default function ProjectDetail({
  name,
  description,
  activePeriod,
  contributors,
  commits,
  linesAdded,
  linesDeleted,
  netNewLines,
  filesChanged,
  multiplier,
}: ProjectDetailProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-4 p-6 text-left"
      >
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-lg font-semibold text-ui-charcoal">{name}</h3>
            <span className="rounded-full bg-ui-gold/15 px-2.5 py-0.5 text-xs font-semibold text-ui-gold-dark">
              {multiplier}
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            {activePeriod} &middot; {commits} commits &middot;{" "}
            {netNewLines.toLocaleString()} net lines
          </p>
        </div>
        <svg
          className={`mt-1 h-5 w-5 shrink-0 text-gray-400 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {expanded && (
        <div className="border-t border-gray-100 px-6 py-5">
          <p className="text-sm leading-relaxed text-gray-700">{description}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-lg font-bold text-ui-charcoal">
                {linesAdded.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Lines Added</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-lg font-bold text-ui-charcoal">
                {linesDeleted.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500">Lines Deleted</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-lg font-bold text-ui-charcoal">
                {filesChanged}
              </p>
              <p className="text-xs text-gray-500">Files Changed</p>
            </div>
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-lg font-bold text-ui-charcoal">{commits}</p>
              <p className="text-xs text-gray-500">Commits</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Contributors: {contributors}
          </p>
        </div>
      )}
    </div>
  );
}
