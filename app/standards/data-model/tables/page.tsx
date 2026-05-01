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

  const rows: TableRow[] = tables.map((t) => ({
    project: t.project,
    projectApplication: projectsBySlug.get(t.project)?.application ?? t.project,
    name: t.name,
    kind: t.kind,
    classification: t.classification,
    columnCount: t.columns.length,
    relationshipCount: t.relationships.length,
  }));

  const projectsList: ProjectMeta[] = projects.map((p) => ({
    slug: p.slug,
    application: p.application,
  }));

  return (
    <div className="space-y-10">
      <DataModelHeader active="tables" />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-ui-charcoal">
            Every table, every project
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-gray-600">
            Sortable, filterable index spanning all five governed
            applications. Click a table name to see columns, relationships,
            and controlled-vocabulary detection.
          </p>
        </div>

        <TablesExplorer rows={rows} projectsList={projectsList} />
      </section>

      <footer className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600">
        Canonical / extension tagging is a v1 heuristic against a
        hand-curated list of research-admin UDM tables. PII flags and
        column-level data classification are not yet captured upstream and
        are tracked at{" "}
        <a
          href="https://github.com/ui-insight/data-governance/issues/9"
          target="_blank"
          rel="noopener noreferrer"
        >
          ui-insight/data-governance#9
        </a>
        ; see{" "}
        <a
          href="https://github.com/ui-insight/AISPEG/issues/53"
          target="_blank"
          rel="noopener noreferrer"
        >
          #53
        </a>{" "}
        for the full epic.
      </footer>
    </div>
  );
}
