"use client";

// Tiles | Map segmented control on /explore. State is in the URL
// (?view=tiles|map) so it's shareable and survives navigation.
// Uses ?view=, not a hash, because the map's focused-node state in
// slice 4 already owns the hash (#project-..., #priority-..., etc).
// A complete shareable URL looks like /explore?view=map#project-mindrouter.

import Link from "next/link";

type View = "tiles" | "map";

const PILL_BASE =
  "rounded-full px-4 py-1.5 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-black focus-visible:ring-offset-2";

export default function ExploreViewToggle({ view }: { view: View }) {
  return (
    <div
      role="tablist"
      aria-label="Explore view"
      className="inline-flex items-center gap-1 rounded-full border border-hairline bg-surface-alt p-1"
    >
      <Link
        role="tab"
        aria-selected={view === "tiles"}
        href="/explore"
        scroll={false}
        className={`${PILL_BASE} ${
          view === "tiles"
            ? "bg-brand-black text-white"
            : "text-ink-muted hover:text-brand-black"
        }`}
      >
        Tiles
      </Link>
      <Link
        role="tab"
        aria-selected={view === "map"}
        href="/explore?view=map"
        scroll={false}
        className={`${PILL_BASE} ${
          view === "map"
            ? "bg-brand-black text-white"
            : "text-ink-muted hover:text-brand-black"
        }`}
      >
        Map
      </Link>
    </div>
  );
}
