import Link from "next/link";
import { projects } from "@/lib/governance/catalog";
import { vocabularyGroups } from "@/lib/governance/vocabularies";

export const metadata = {
  title: "Data Model — Standards",
  description:
    "Interactive explorer for the AI4RA Unified Data Model and per-project extensions across the IIDS portfolio.",
};

const TAB_ITEMS = [
  { id: "projects" as const, label: "Projects" },
  { id: "tables" as const, label: "Tables" },
  { id: "vocabularies" as const, label: "Vocabularies" },
];

function TabBar({ active }: { active: "projects" | "tables" | "vocabularies" }) {
  return (
    <div className="flex gap-6 border-b border-gray-200">
      {TAB_ITEMS.map((t) => (
        <span
          key={t.id}
          aria-current={t.id === active ? "page" : undefined}
          className={`-mb-px border-b-2 pb-2 text-xs font-semibold uppercase tracking-wider ${
            t.id === active
              ? "border-brand-clearwater text-ui-charcoal"
              : "border-transparent text-gray-400"
          }`}
        >
          {t.label}
          {t.id !== active && (
            <span className="ml-1.5 text-[10px] font-normal normal-case tracking-normal text-gray-400">
              (next)
            </span>
          )}
        </span>
      ))}
    </div>
  );
}

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
  const totalTables = projects.reduce((sum, p) => sum + p.tableCount, 0);
  const totalVocab = vocabularyGroups.length;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-ui-charcoal">
          Data Model
        </h1>
        <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-700">
          The AI4RA Unified Data Model and the per-project extensions
          installed across the IIDS portfolio. Engineers can use this to
          connect to our data; stakeholders can use it to understand the
          definitions and business rules. Source of truth:{" "}
          <a
            href="https://github.com/ui-insight/data-governance"
            target="_blank"
            rel="noopener noreferrer"
          >
            ui-insight/data-governance
          </a>
          .
        </p>
        <dl className="mt-6 grid grid-cols-3 gap-6 text-sm">
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Projects governed
            </dt>
            <dd className="mt-1 text-2xl font-black text-ui-charcoal">
              {projects.length}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Tables across portfolio
            </dt>
            <dd className="mt-1 text-2xl font-black text-ui-charcoal">
              {totalTables}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Vocabulary groups
            </dt>
            <dd className="mt-1 text-2xl font-black text-ui-charcoal">
              {totalVocab}
            </dd>
          </div>
        </dl>
      </header>

      <TabBar active="projects" />

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((p) => (
          <ProjectCard key={p.slug} project={p} />
        ))}
      </section>
    </div>
  );
}
