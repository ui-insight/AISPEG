import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProject,
  getTablesForProject,
  projects,
} from "@/lib/governance/catalog";
import { getProjectFraming } from "@/lib/governance/project-framing";
import GlossaryTerm from "@/components/GlossaryTerm";
import ExpandAllSchemas from "@/components/ExpandAllSchemas";
import Breadcrumbs from "@/components/Breadcrumbs";
import type { Table, TableKind } from "@/lib/governance/types";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  return {
    title: project
      ? `${project.application} — Data Model`
      : "Project — Data Model",
    description: project
      ? `Tables, columns, and UDM-extension surface for ${project.application}.`
      : undefined,
  };
}

const KIND_LABEL: Record<TableKind, string> = {
  table: "Table",
  entity: "Entity",
  projection_table: "Projection table",
};

function ClassificationBadge({
  classification,
}: {
  classification: Table["classification"];
}) {
  const label =
    classification === "canonical-udm" ? "Canonical UDM" : "Project extension";
  const styles =
    classification === "canonical-udm"
      ? "bg-brand-clearwater/10 text-brand-clearwater"
      : "bg-gray-100 text-gray-700";
  return (
    <span
      className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${styles}`}
    >
      {label}
    </span>
  );
}

function ColumnRow({
  column,
}: {
  column: Table["columns"][number];
}) {
  return (
    <tr className="border-t border-gray-100 align-top">
      <td className="py-2 pr-4 font-mono text-xs text-ui-charcoal">
        {column.name}
        {column.primaryKey && (
          <span className="ml-2 rounded bg-ui-gold/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ui-gold-dark">
            PK
          </span>
        )}
      </td>
      <td className="py-2 pr-4 font-mono text-xs text-gray-600">
        {column.type}
      </td>
      <td className="py-2 pr-4 text-xs text-gray-600">
        {column.nullable === true
          ? "nullable"
          : column.nullable === false
            ? "required"
            : ""}
      </td>
      <td className="py-2 pr-4 font-mono text-xs text-gray-600">
        {column.foreignKey ?? ""}
      </td>
    </tr>
  );
}

function TableCard({
  table,
  defaultOpen = false,
}: {
  table: Table;
  defaultOpen?: boolean;
}) {
  return (
    <article
      data-table-card
      className="rounded-lg border border-gray-200 bg-white p-5"
    >
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-mono text-base font-bold tracking-tight text-ui-charcoal">
              {table.name}
            </h3>
            <ClassificationBadge classification={table.classification} />
            <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
              {KIND_LABEL[table.kind]}
            </span>
          </div>
          {table.description && (
            <p className="mt-2 text-sm leading-relaxed text-gray-700">
              {table.description}
            </p>
          )}
        </div>
        <div className="text-right text-xs text-gray-500">
          <p>
            <span className="font-bold text-ui-charcoal">
              {table.columns.length}
            </span>{" "}
            columns
          </p>
          {table.relationships.length > 0 && (
            <p className="mt-0.5">
              <span className="font-bold text-ui-charcoal">
                {table.relationships.length}
              </span>{" "}
              relationships
            </p>
          )}
        </div>
      </header>

      <details className="mt-4 group" open={defaultOpen}>
        <summary className="cursor-pointer text-xs font-medium text-gray-500 hover:text-ui-charcoal">
          {defaultOpen ? "Hide columns" : "Show columns"}
        </summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-full text-left">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                <th className="pb-2 pr-4">Name</th>
                <th className="pb-2 pr-4">Type</th>
                <th className="pb-2 pr-4">Nullability</th>
                <th className="pb-2 pr-4">Foreign key</th>
              </tr>
            </thead>
            <tbody>
              {table.columns.map((c) => (
                <ColumnRow key={c.name} column={c} />
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </article>
  );
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const allTables = getTablesForProject(project.slug);
  const canonical = allTables.filter(
    (t) => t.classification === "canonical-udm",
  );
  const extension = allTables.filter(
    (t) => t.classification === "project-extension",
  );

  // For projects with a small enough catalog, default-open the column lists
  // so engineers don't have to click through every Show columns disclosure.
  // Above 10 tables (e.g., OpenERA at 32), keep them collapsed by default.
  const defaultOpenColumns = allTables.length <= 10;

  const framing = getProjectFraming(project.slug);

  return (
    <div className="space-y-10">
      <header>
        <Breadcrumbs
          items={[
            { label: "Data Model", href: "/standards/data-model" },
            { label: project.application },
          ]}
        />
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-brand-clearwater">
          {project.domain}
        </p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-brand-black">
          {project.application}
        </h1>

        {framing && (
          <p className="mt-4 max-w-3xl text-base leading-relaxed text-ink-muted">
            {framing.lede}
          </p>
        )}

        <div className="mt-6 grid gap-x-8 gap-y-4 md:grid-cols-[1.5fr_1fr]">
          {/* Left: ownership */}
          <dl className="space-y-3 text-sm">
            {framing && (
              <>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-subtle">
                    Home unit
                  </dt>
                  <dd className="mt-0.5 text-brand-black">{framing.homeUnit}</dd>
                </div>
                <div>
                  <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-subtle">
                    {framing.owners.length === 1 ? "Operational owner" : "Operational owners"}
                  </dt>
                  <dd className="mt-0.5 text-brand-black">
                    {framing.owners.map((o, i) => (
                      <span key={o.name}>
                        {i > 0 && ", "}
                        <span className="font-semibold">{o.name}</span>
                        {o.title && (
                          <span className="text-ink-muted"> · {o.title}</span>
                        )}
                      </span>
                    ))}
                  </dd>
                </div>
              </>
            )}
          </dl>

          {/* Right: facts */}
          <dl className="space-y-3 text-sm md:border-l md:border-hairline md:pl-8">
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-subtle">
                Tables in catalog
              </dt>
              <dd className="mt-0.5 text-brand-black">
                {project.tableCount === 0 ? (
                  "No tables in the catalog yet."
                ) : project.canonicalUdmCount === 0 ? (
                  <>
                    <span className="font-semibold">{project.tableCount}</span> total
                    {" — all project-specific"}
                  </>
                ) : project.projectExtensionCount === 0 ? (
                  <>
                    <span className="font-semibold">{project.tableCount}</span> total
                    {" — all canonical UDM"}
                  </>
                ) : (
                  <>
                    <span className="font-semibold">{project.tableCount}</span> total
                    {" — "}
                    {project.canonicalUdmCount} canonical, {project.projectExtensionCount} project-specific
                  </>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium uppercase tracking-wider text-ink-subtle">
                Repository
              </dt>
              <dd className="mt-0.5">
                <a
                  href={project.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs"
                >
                  {project.repository.replace("https://github.com/", "")}
                </a>
              </dd>
            </div>
          </dl>
        </div>

        {(project.techStack.backend ||
          project.techStack.frontend ||
          project.techStack.database) && (
          <p className="mt-6 max-w-2xl text-xs text-ink-muted">
            <span className="font-semibold text-brand-black">Stack:</span>{" "}
            {[
              project.techStack.backend,
              project.techStack.frontend,
              project.techStack.database,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        {project.runtimeModes && project.runtimeModes.length > 0 && (
          <p className="mt-1 max-w-2xl text-xs text-ink-muted">
            <span className="font-semibold text-brand-black">Runtime:</span>{" "}
            {project.runtimeModes.join(" / ")}
          </p>
        )}
      </header>

      {!defaultOpenColumns && allTables.length > 0 && (
        <div className="-mb-4 flex justify-end">
          <ExpandAllSchemas />
        </div>
      )}

      {canonical.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-ui-charcoal">
              <GlossaryTerm term="Canonical UDM">Canonical UDM</GlossaryTerm> tables
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Adopted from the AI4RA Unified Data Model. Naming and shape
              follow the institutional standard.
            </p>
          </div>
          <div className="space-y-3">
            {canonical.map((t) => (
              <TableCard
                key={`${t.kind}-${t.name}`}
                table={t}
                defaultOpen={defaultOpenColumns}
              />
            ))}
          </div>
        </section>
      )}

      {extension.length > 0 && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-ui-charcoal">
              <GlossaryTerm term="Project extension">Project extensions</GlossaryTerm>
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Tables specific to this project — workflow, tooling, or
              domain-specific entities not part of the canonical UDM.
            </p>
          </div>
          <div className="space-y-3">
            {extension.map((t) => (
              <TableCard
                key={`${t.kind}-${t.name}`}
                table={t}
                defaultOpen={defaultOpenColumns}
              />
            ))}
          </div>
        </section>
      )}

      <p className="text-xs text-ink-subtle">
        <Link href="/standards/data-model#tagging-method">
          Tagging method &rarr;
        </Link>
      </p>
    </div>
  );
}
