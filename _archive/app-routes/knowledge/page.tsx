"use client";

import { useState } from "react";
import Link from "next/link";
import { knowledgeArticles, standardDocuments } from "@/lib/data";

function getStandardsForArticle(title: string) {
  return standardDocuments.filter(
    (doc) => doc.relatedKnowledgeTitles?.includes(title)
  );
}

export default function KnowledgePage() {
  const [query, setQuery] = useState("");

  const filtered = knowledgeArticles.filter((a) => {
    const q = query.toLowerCase();
    if (!q) return true;
    return (
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.tags.some((t) => t.includes(q))
    );
  });

  const allTags = Array.from(new Set(knowledgeArticles.flatMap((a) => a.tags)));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-ui-charcoal">Knowledge Base</h1>
        <p className="mt-2 text-gray-600">
          Wiki-style collaborative space for sharing knowledge about agentic AI
          at the university.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
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
          placeholder="Search articles by title, content, or tag..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm focus:border-ui-gold focus:outline-none focus:ring-1 focus:ring-ui-gold"
        />
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setQuery(tag)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
              query === tag
                ? "border-ui-gold bg-ui-gold/15 text-ui-gold-dark"
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            {tag}
          </button>
        ))}
        {query && (
          <button
            onClick={() => setQuery("")}
            className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-400 hover:text-gray-600"
          >
            Clear
          </button>
        )}
      </div>

      {/* Articles */}
      <div className="space-y-4">
        {filtered.map((article, i) => {
          const relatedStandards = getStandardsForArticle(article.title);
          return (
            <div
              key={i}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="inline-block rounded-full bg-ui-mid/10 px-2.5 py-0.5 text-xs font-medium text-ui-mid">
                    {article.category}
                  </span>
                  <h3 className="mt-2 text-base font-semibold text-ui-charcoal">
                    {article.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">{article.summary}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {article.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500"
                  >
                    {tag}
                  </span>
                ))}
                {relatedStandards.map((std) => (
                  <Link
                    key={std.id}
                    href={`/standards/${std.id}`}
                    className="inline-flex items-center gap-1 rounded-full border border-ui-gold/30 bg-ui-gold/10 px-2.5 py-0.5 text-xs font-medium text-ui-gold-dark hover:bg-ui-gold/20"
                  >
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                    {std.title}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">
            No articles found matching &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      <div className="rounded-xl border border-dashed border-gray-300 bg-white/50 p-8 text-center">
        <p className="text-sm text-gray-500">
          Contribute articles by adding entries to{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
            lib/data.ts
          </code>{" "}
          in the knowledgeArticles array
        </p>
      </div>
    </div>
  );
}
