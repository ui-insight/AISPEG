import Link from "next/link";
import DataModelHeader from "@/components/DataModelHeader";
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
      className="unstyled group block rounded-lg border border-gray-200 bg-white p-5 transition-colors hover:border-ui-charcoal"
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-ui-gold-dark">
        {project.domain}
      </p>
      <h3 className="mt-1 text-lg font-bold tracking-tight text-ui-charcoal group-hover:text-brand-clearwater">
        {project.application}
      </h3>
      <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-gray-100 pt-4 text-xs">
        <div>
          <dt className="font-medium uppercase tracking-wider text-gray-500">
            Tables
          </dt>
          <dd className="mt-0.5 text-base font-black text-ui-charcoal">
            {project.tableCount}
          </dd>
        </div>
        <div>
          <dt className="font-medium uppercase tracking-wider text-gray-500">
            Canonical
          </dt>
          <dd className="mt-0.5 text-base font-black text-ui-charcoal">
            {project.canonicalUdmCount}
          </dd>
        </div>
        <div>
          <dt className="font-medium uppercase tracking-wider text-gray-500">
            Extensions
          </dt>
          <dd className="mt-0.5 text-base font-black text-ui-charcoal">
            {project.projectExtensionCount}
          </dd>
        </div>
      </dl>
      {project.runtimeModes && project.runtimeModes.length > 0 && (
        <p className="mt-3 text-[11px] text-gray-500">
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
    </div>
  );
}
