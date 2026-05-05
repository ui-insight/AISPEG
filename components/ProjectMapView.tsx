"use client";

// Client wrapper that dynamic-imports ProjectMap with `ssr: false`.
// The d3-shape dependency lives in this chunk only — the parent route's
// initial server-rendered HTML doesn't include it, and routes that don't
// embed this view never load it at all.

import dynamic from "next/dynamic";

const ProjectMap = dynamic(() => import("./ProjectMap"), {
  ssr: false,
  loading: () => (
    <div
      className="hidden md:flex aspect-[1100/900] w-full items-center justify-center text-sm text-ink-muted"
      role="status"
      aria-live="polite"
    >
      Loading map…
    </div>
  ),
});

export default function ProjectMapView() {
  return <ProjectMap />;
}
