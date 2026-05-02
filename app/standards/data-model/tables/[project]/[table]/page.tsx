import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getProject,
  getTablesForProject,
  projects,
  tables,
} from "@/lib/governance/catalog";
import { resolveVocabularyGroupForColumn } from "@/lib/governance/vocabulary-usage";
import { getProjectFraming } from "@/lib/governance/project-framing";
import GlossaryTerm from "@/components/GlossaryTerm";
import Breadcrumbs from "@/components/Breadcrumbs";
import type { Column, Table, TableKind } from "@/lib/governance/types";

export function generateStaticParams() {
  return tables.map((t) => ({
    project: t.project,
    table: t.name,
  }));
}

const KIND_LABEL: Record<TableKind, string> = {
  table: "Table",
  entity: "Entity",
  projection_table: "Projection table",
};

function findTable(projectSlug: string, tableName: string): Table | undefined {
  return getTablesForProject(projectSlug).find((t) => t.name === tableName);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ project: string; table: string }>;
}) {
  const { project: projectSlug, table: tableNameRaw } = await params;
  const tableName = decodeURIComponent(tableNameRaw);
  const project = getProject(projectSlug);
  const table = project ? findTable(projectSlug, tableName) : undefined;

  return {
    title:
      project && table
        ? `${table.name} — ${project.application} — Data Model`
        : "Table — Data Model",
    description:
      table?.description ??
      (project
        ? `Schema for ${tableName} in ${project.application}.`
        : undefined),
  };
}

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

function VocabPill({
  domain,
  group,
}: {
  domain: string;
  group: string;
}) {
  return (
    <Link
      href={`/standards/data-model/vocabularies/${encodeURIComponent(domain)}/${encodeURIComponent(group)}`}
      className="unstyled ml-2 inline-block rounded bg-brand-lupine/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-lupine hover:bg-brand-lupine/20"
      title={`Vocabulary group: ${domain}/${group}`}
    >
      Vocab
    </Link>
  );
}

function ColumnRow({
  column,
  vocabKey,
}: {
  column: Column;
  vocabKey: { domain: string; group: string } | null;
}) {
  return (
    <tr className="border-t border-gray-100 align-top">
      <td className="py-2 pr-4 font-mono text-xs text-ui-charcoal">
        <span>{column.name}</span>
        {column.primaryKey && (
          <span className="ml-2 rounded bg-ui-gold/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ui-gold-dark">
            PK
          </span>
        )}
        {vocabKey && (
          <VocabPill domain={vocabKey.domain} group={vocabKey.group} />
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

export default async function TableDetailPage({
  params,
}: {
  params: Promise<{ project: string; table: string }>;
}) {
  const { project: projectSlug, table: tableNameRaw } = await params;
  const tableName = decodeURIComponent(tableNameRaw);
  const project = getProject(projectSlug);
  if (!project) notFound();
  const table = findTable(projectSlug, tableName);
  if (!table) notFound();

  const vocabKeys = table.columns.map((c) =>
    resolveVocabularyGroupForColumn(table, c),
  );
  const vocabColumnCount = vocabKeys.filter((k) => k !== null).length;

  // Group declared relationships by target.
  const relationshipsByTarget = new Map<string, typeof table.relationships>();
  for (const rel of table.relationships) {
    const arr = relationshipsByTarget.get(rel.target) ?? [];
    arr.push(rel);
    relationshipsByTarget.set(rel.target, arr);
  }

  // Inferred FK relationships fallback.
  const inferredFks = table.columns
    .filter((c) => c.foreignKey)
    .map((c) => ({ column: c.name, target: c.foreignKey as string }));

  const classificationCopy =
    table.classification === "canonical-udm"
      ? "Adopted from the AI4RA Unified Data Model — naming and shape follow the institutional standard."
      : "Specific to this project — workflow, tooling, or domain-specific entities not part of the canonical UDM.";

  const projectFraming = getProjectFraming(project.slug);

  return (
    <div className="space-y-10">
      <header>
        <Breadcrumbs
          items={[
            { label: "Data Model", href: "/standards/data-model" },
            { label: "Tables", href: "/standards/data-model/tables" },
            {
              label: project.application,
              href: `/standards/data-model/projects/${project.slug}`,
            },
            { label: table.name },
          ]}
        />
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-brand-clearwater">
          {project.domain}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-black tracking-tight text-brand-black">
            {table.name}
          </h1>
          <ClassificationBadge classification={table.classification} />
          <span className="text-[10px] font-medium uppercase tracking-wider text-ink-subtle">
            {KIND_LABEL[table.kind]}
          </span>
        </div>

        {projectFraming && (
          <p className="mt-3 text-sm text-ink-muted">
            <span className="font-semibold text-brand-black">{project.application}</span>
            {" "}is operated by{" "}
            <span className="font-semibold text-brand-black">
              {projectFraming.owners.map((o) => o.name).join(", ")}
            </span>
            {" · "}
            {projectFraming.homeUnit}
          </p>
        )}

        <p className="mt-4 max-w-3xl text-base leading-relaxed text-brand-black">
          <span className="font-bold">{table.columns.length}</span>{" "}
          {table.columns.length === 1 ? "column" : "columns"}
          {vocabColumnCount > 0 && (
            <>
              ,{" "}
              <span className="font-bold">{vocabColumnCount}</span>{" "}
              {vocabColumnCount === 1
                ? "drawn from a controlled vocabulary"
                : "drawn from controlled vocabularies"}
            </>
          )}
          {table.relationships.length > 0 ? (
            <>
              ,{" "}
              <span className="font-bold">{table.relationships.length}</span>{" "}
              {table.relationships.length === 1
                ? "declared relationship"
                : "declared relationships"}
              .
            </>
          ) : inferredFks.length > 0 ? (
            <>. No relationships declared; {inferredFks.length} inferred from foreign keys.</>
          ) : (
            <>. No relationships declared in the catalog.</>
          )}
        </p>

        {table.modelClass && (
          <p className="mt-1 max-w-3xl text-xs text-ink-muted">
            <span className="font-semibold text-brand-black">Model class:</span>{" "}
            <code className="rounded bg-surface-alt px-1 py-0.5 font-mono text-brand-black">
              {table.modelClass}
            </code>
          </p>
        )}
      </header>

      <section className="rounded-lg border border-gray-200 bg-white p-5">
        {table.description && (
          <p className="text-sm leading-relaxed text-gray-700">
            {table.description}
          </p>
        )}
        <p
          className={`${
            table.description ? "mt-3 border-t border-gray-100 pt-3" : ""
          } text-xs text-gray-600`}
        >
          {classificationCopy}
        </p>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-ui-charcoal">Columns</h2>
            <p className="mt-1 text-sm text-gray-600">
              Full column list.{" "}
              <GlossaryTerm term="PK">PK</GlossaryTerm> marks primary keys;{" "}
              <GlossaryTerm term="Vocab">Vocab</GlossaryTerm> marks columns
              whose values come from a controlled vocabulary group.{" "}
              <GlossaryTerm term="FK">Foreign keys</GlossaryTerm> reference rows in
              another table.
            </p>
          </div>
          <p className="text-xs text-gray-500">
            <span className="font-bold text-ui-charcoal">
              {table.columns.length}
            </span>{" "}
            columns
            {vocabColumnCount > 0 && (
              <>
                {" "}
                ·{" "}
                <span className="font-bold text-brand-lupine">
                  {vocabColumnCount}
                </span>{" "}
                vocabulary
              </>
            )}
          </p>
        </div>

        {/* Mobile: card list (< sm) */}
        <ul className="space-y-2 sm:hidden">
          {table.columns.map((c, i) => {
            const vocabKey = vocabKeys[i] ?? null;
            const meta = [
              c.type,
              c.nullable === true
                ? "nullable"
                : c.nullable === false
                  ? "required"
                  : null,
              c.foreignKey ? `FK → ${c.foreignKey}` : null,
            ].filter(Boolean);
            return (
              <li
                key={c.name}
                className="rounded-lg border border-gray-200 bg-white p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="break-all font-mono text-sm font-semibold text-ui-charcoal">
                    {c.name}
                  </span>
                  {c.primaryKey && (
                    <span className="rounded bg-ui-gold/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-ui-gold-dark">
                      PK
                    </span>
                  )}
                  {vocabKey && (
                    <VocabPill domain={vocabKey.domain} group={vocabKey.group} />
                  )}
                </div>
                <p className="mt-1.5 break-words font-mono text-xs text-gray-600">
                  {meta.join(" · ")}
                </p>
              </li>
            );
          })}
        </ul>

        {/* Tablet+: schema table (≥ sm) */}
        <div className="hidden overflow-x-auto rounded-lg border border-gray-200 bg-white sm:block">
          <table className="w-full min-w-[720px] text-left">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                <th scope="col" className="px-3 py-2">
                  Name
                </th>
                <th scope="col" className="px-3 py-2">
                  Type
                </th>
                <th scope="col" className="px-3 py-2">
                  Nullability
                </th>
                <th scope="col" className="px-3 py-2">
                  Foreign key
                </th>
              </tr>
            </thead>
            <tbody>
              {table.columns.map((c, i) => (
                <ColumnRow
                  key={c.name}
                  column={c}
                  vocabKey={vocabKeys[i] ?? null}
                />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {table.uniqueConstraints.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xl font-bold text-ui-charcoal">
            Unique constraints
          </h2>
          <ul className="space-y-1 text-xs">
            {table.uniqueConstraints.map((cols, idx) => (
              <li
                key={idx}
                className="rounded border border-gray-200 bg-white px-3 py-1.5 font-mono text-ui-charcoal"
              >
                ({cols.join(", ")})
              </li>
            ))}
          </ul>
        </section>
      )}

      {table.relationships.length > 0 ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-xl font-bold text-ui-charcoal">
              Relationships
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Declared associations grouped by target table.
            </p>
          </div>
          <ul className="space-y-2">
            {Array.from(relationshipsByTarget.entries()).map(([target, rels]) => (
              <li
                key={target}
                className="rounded-lg border border-gray-200 bg-white px-4 py-3"
              >
                <p className="font-mono text-sm font-bold text-ui-charcoal">
                  {target}
                </p>
                <ul className="mt-1 space-y-0.5 text-xs text-gray-600">
                  {rels.map((r) => (
                    <li key={`${r.name}-${r.type}`}>
                      <span className="font-mono text-ui-charcoal">
                        {r.name}
                      </span>{" "}
                      <span className="text-[10px] uppercase tracking-wider text-gray-500">
                        {r.type}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      ) : inferredFks.length > 0 ? (
        <section className="space-y-3">
          <div>
            <h2 className="text-xl font-bold text-ui-charcoal">
              Inferred relationships
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              No relationships are declared in the catalog for this table.
              The following are inferred from foreign-key columns.
            </p>
          </div>
          <ul className="space-y-2">
            {inferredFks.map((fk) => (
              <li
                key={fk.column}
                className="rounded-lg border border-gray-200 bg-white px-4 py-3"
              >
                <p className="font-mono text-sm font-bold text-ui-charcoal">
                  {fk.target}
                </p>
                <p className="mt-0.5 text-xs text-gray-600">
                  via{" "}
                  <span className="font-mono text-ui-charcoal">
                    {fk.column}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <p className="text-xs text-ink-subtle">
        Vocab pills link to the vocabulary detail page when the resolver
        can pick a single destination; ambiguous matches stay unlinked.{" "}
        <Link href="/standards/data-model#tagging-method">
          Tagging method &rarr;
        </Link>
      </p>
    </div>
  );
}
