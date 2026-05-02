import Link from "next/link";
import { Suspense } from "react";
import DataModelHeader from "@/components/DataModelHeader";
import TablesExplorer, {
  type ProjectMeta,
  type TableRow,
} from "@/components/TablesExplorer";
import { projects, tables } from "@/lib/governance/catalog";

export const metadata = {
  title: "Tables — Data Model",
  description:
    "Cross-project index of every table in the IIDS data-governance catalog: canonical UDM tables and per-project extensions.",
};

export default function TablesIndexPage() {
  const projectsBySlug = new Map(projects.map((p) => [p.slug, p]));

  const rows: TableRow[] = tables.map((t) => {
    const proj = projectsBySlug.get(t.project);
    return {
      project: t.project,
      projectApplication: proj?.application ?? t.project,
      domain: proj?.domain ?? "Unassigned",
      name: t.name,
      kind: t.kind,
      classification: t.classification,
      columnCount: t.columns.length,
      relationshipCount: t.relationships.length,
    };
  });

  const projectsList: ProjectMeta[] = projects.map((p) => ({
    slug: p.slug,
    application: p.application,
    domain: p.domain,
  }));

  return (
    <div className="space-y-10">
      <DataModelHeader active="tables" />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-ui-charcoal">
            All tables across the portfolio
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-gray-600">
            Sortable, filterable index spanning all five governed
            applications. Click a table name to see columns, relationships,
            and controlled-vocabulary detection.
          </p>
        </div>

        <Suspense fallback={null}>
          <TablesExplorer rows={rows} projectsList={projectsList} />
        </Suspense>
      </section>

      <p className="text-xs text-ink-subtle">
        <Link href="/standards/data-model#tagging-method">
          Tagging method &rarr;
        </Link>
      </p>
    </div>
  );
}
