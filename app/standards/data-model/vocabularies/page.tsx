import DataModelHeader from "@/components/DataModelHeader";
import VocabulariesExplorer, {
  type VocabularyRow,
} from "@/components/VocabulariesExplorer";
import { vocabularyGroups } from "@/lib/governance/vocabularies";
import { getProjectsUsingGroupCount } from "@/lib/governance/vocabulary-usage";

export const metadata = {
  title: "Vocabularies — Data Model",
  description:
    "Cross-project index of every controlled-vocabulary group in the IIDS data-governance catalog: codes, labels, and the projects that reference them.",
};

export default function VocabulariesIndexPage() {
  const rows: VocabularyRow[] = vocabularyGroups.map((g) => ({
    domain: g.domain,
    group: g.group,
    application: g.application,
    valueCount: g.values.length,
    projectsUsing: getProjectsUsingGroupCount(g.domain, g.group),
  }));

  const domains = Array.from(new Set(rows.map((r) => r.domain))).sort();
  const applications = Array.from(
    new Set(rows.map((r) => r.application ?? "shared")),
  ).sort();

  return (
    <div className="space-y-10">
      <DataModelHeader active="vocabularies" />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-ui-charcoal">
            Every controlled vocabulary, every domain
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-gray-600">
            Sortable, filterable index spanning every allowed-value group in
            the AI4RA Unified Data Model and per-project extensions. Click a
            group to see its values, descriptions, and the tables that
            reference it across the portfolio.
          </p>
        </div>

        <VocabulariesExplorer
          rows={rows}
          domains={domains}
          applications={applications}
        />
      </section>

      <footer className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600">
        &ldquo;Projects using&rdquo; is a v1 cross-walk: a project counts as a
        user when one of its tables has either an{" "}
        <span className="font-mono">AllowedValues.&lt;group&gt;</span>{" "}
        foreign key OR a column whose name matches the group name (PascalCase
        / snake_case / camelCase normalized). Source of truth:{" "}
        <a
          href="https://github.com/ui-insight/data-governance"
          target="_blank"
          rel="noopener noreferrer"
        >
          ui-insight/data-governance
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
