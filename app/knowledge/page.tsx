"use client";

import { useState } from "react";

const articles = [
  {
    title: "Shadow AI Applications",
    summary:
      "Shadow AI applications are already emerging. Rapid experimentation outside governance creates risk and opportunity.",
    tags: ["governance", "risk", "adoption"],
    category: "Context",
  },
  {
    title: "Immediate Institutional Reality",
    summary:
      "Fear and uncertainty across technical teams. Institutional structures lag the technology. Connected agent tools to secure on-prem models.",
    tags: ["institutional", "adoption", "security"],
    category: "Context",
  },
  {
    title: "Agent Orchestrator Role Definition",
    summary:
      "Systems thinker with broad generalist understanding. Decomposes processes and explains workflows clearly. Bridges domain experts, infrastructure, and agents.",
    tags: ["roles", "agents", "workforce"],
    category: "Roles",
  },
  {
    title: "Greenfield vs Brownfield Reality",
    summary:
      "Greenfield: AI-native systems, clean APIs, high autonomy. Brownfield: legacy integration, adapters/RPA, high friction. Most universities operate in brownfield reality.",
    tags: ["architecture", "strategy", "implementation"],
    category: "Architecture",
  },
  {
    title: "SaaS Market Implications",
    summary:
      "As custom tool creation accelerates, SaaS value shifts. Vendors must improve dramatically or reduce prices. Institutions gain leverage in contract negotiations.",
    tags: ["market", "strategy", "procurement"],
    category: "Strategy",
  },
  {
    title: "Research Amplification",
    summary:
      "This isn't just automation — it's capability expansion. Solution proliferation and rapid experimentation. Research amplification effects are enormous.",
    tags: ["research", "strategy", "impact"],
    category: "Strategy",
  },
];

export default function KnowledgePage() {
  const [query, setQuery] = useState("");

  const filtered = articles.filter((a) => {
    const q = query.toLowerCase();
    if (!q) return true;
    return (
      a.title.toLowerCase().includes(q) ||
      a.summary.toLowerCase().includes(q) ||
      a.tags.some((t) => t.includes(q))
    );
  });

  const allTags = Array.from(new Set(articles.flatMap((a) => a.tags)));

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
        {filtered.map((article, i) => (
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
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="py-8 text-center text-sm text-gray-400">
            No articles found matching &ldquo;{query}&rdquo;
          </p>
        )}
      </div>

      <div className="rounded-xl border border-dashed border-gray-300 bg-white/50 p-8 text-center">
        <p className="text-sm text-gray-500">
          Contribute articles by adding MDX files to{" "}
          <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs">
            /content/knowledge/
          </code>
        </p>
      </div>
    </div>
  );
}
