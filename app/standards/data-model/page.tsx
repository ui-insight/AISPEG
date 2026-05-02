import Link from "next/link";
import DataModelHeader from "@/components/DataModelHeader";
import TaggingMethod from "@/components/TaggingMethod";
import { projects } from "@/lib/governance/catalog";

export const metadata = {
  title: "Data Model — Standards",
  description:
    "Interactive explorer for the AI4RA Unified Data Model and per-project extensions across the IIDS portfolio.",
};

function ProjectCard({ project }: { project: (typeof projects)[number] }) {
  return (
    <Link
      href={`/standards/data-model/projects/${project.slug}`}
      className="unstyled group block rounded-lg border border-hairline bg-white p-5 transition-colors hover:border-brand-black"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-brand-clearwater">
        {project.domain}
      </p>
      <h3 className="mt-1 text-lg font-bold tracking-tight text-brand-black group-hover:text-brand-clearwater">
        {project.application}
      </h3>
      <p className="mt-3 text-sm text-ink-muted">
        <span className="font-semibold text-brand-black">{project.tableCount} tables</span>
        {" — "}
        {project.canonicalUdmCount} canonical, {project.projectExtensionCount}{" "}
        project-specific.
      </p>
      {project.runtimeModes && project.runtimeModes.length > 0 && (
        <p className="mt-2 text-xs text-ink-subtle">
          Runtime: {project.runtimeModes.join(" / ")}
        </p>
      )}
    </Link>
  );
}

export default function DataModelIndexPage() {
  return (
    <div className="space-y-10">
      <DataModelHeader active="projects" />

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </section>

      <TaggingMethod />
    </div>
  );
}
