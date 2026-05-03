"use client";

import { useState } from "react";

interface PrincipleCardProps {
  title: string;
  summary: string;
  details: string;
  category: string;
}

export default function PrincipleCard({
  title,
  summary,
  details,
  category,
}: PrincipleCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-4 p-6 text-left"
      >
        <div className="flex-1">
          <span className="inline-block rounded-full border border-hairline bg-surface-alt px-2.5 py-0.5 text-xs font-medium text-brand-black">
            {category}
          </span>
          <h3 className="mt-2 text-lg font-semibold text-ui-charcoal">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-600">{summary}</p>
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
        <div className="border-t border-gray-100 px-6 py-4">
          <p className="text-sm leading-relaxed text-gray-700">{details}</p>
        </div>
      )}
    </div>
  );
}
