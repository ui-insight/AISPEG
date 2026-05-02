import Link from "next/link";
import { Suspense } from "react";
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
            All controlled vocabularies
          </h2>
          <p className="mt-1 max-w-3xl text-sm text-gray-600">
            Sortable, filterable index spanning every allowed-value group in
            the AI4RA Unified Data Model and per-project extensions. Click a
            group to see its values, descriptions, and the tables that
            reference it across the portfolio.
          </p>
        </div>

        <Suspense fallback={null}>
          <VocabulariesExplorer
            rows={rows}
            domains={domains}
            applications={applications}
          />
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
