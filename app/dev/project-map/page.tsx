// Temporary preview route for the Project Map scaffold (epic #201,
// slice 2). Removed in slice 5 (#206) once the component is mounted
// behind the Tiles | Map toggle on /explore.

import ProjectMap from "@/components/ProjectMap";

export const metadata = {
  title: "Project Map (preview)",
  robots: { index: false, follow: false },
};

export default function ProjectMapDevPage() {
  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-medium uppercase tracking-wider text-brand-silver">
          Internal preview
        </p>
        <h1 className="mt-2 text-2xl font-black">Project Map (slice 3 preview)</h1>
        <p className="mt-2 max-w-3xl text-sm text-ink-muted">
          Pillar-colored priority arc with hierarchical edge bundling
          via pillar centroids. Right-side links to work categories
          stay neutral. Hover highlight + click-through arrive in
          slice 4; the Tiles | Map toggle on /explore in slice 5, at
          which point this route goes away.
        </p>
      </header>
      <ProjectMap />
    </div>
  );
}
