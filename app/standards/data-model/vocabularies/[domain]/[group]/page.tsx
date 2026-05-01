import { notFound } from "next/navigation";
import Link from "next/link";
import { vocabularyGroups } from "@/lib/governance/vocabularies";
import { getProject } from "@/lib/governance/catalog";
import {
  getProjectsUsingGroup,
  type MatchReason,
} from "@/lib/governance/vocabulary-usage";
import type { VocabularyGroup } from "@/lib/governance/types";

export function generateStaticParams() {
  return vocabularyGroups.map((g) => ({
    domain: g.domain,
    group: g.group,
  }));
}

function findGroup(
  domain: string,
  group: string,
): VocabularyGroup | undefined {
  return vocabularyGroups.find(
    (g) => g.domain === domain && g.group === group,
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ domain: string; group: string }>;
}) {
  const { domain: domainRaw, group: groupRaw } = await params;
  const domain = decodeURIComponent(domainRaw);
  const group = decodeURIComponent(groupRaw);
  const vg = findGroup(domain, group);
  return {
    title: vg
      ? `${vg.group} — ${vg.domain} — Vocabularies`
      : "Vocabulary — Data Model",
    description:
      vg?.description ??
      (vg
        ? `Allowed values for ${vg.group} in the ${vg.domain} domain.`
        : undefined),
  };
}

const REASON_LABEL: Record<MatchReason, string> = {
  "foreign-key": "FK to AllowedValues",
  "column-name": "Column-name match",
};

const REASON_STYLES: Record<MatchReason, string> = {
  "foreign-key":
    "bg-brand-clearwater/10 text-brand-clearwater",
  "column-name": "bg-gray-100 text-gray-600",
};

function ReasonBadge({ reason }: { reason: MatchReason }) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${REASON_STYLES[reason]}`}
    >
      {REASON_LABEL[reason]}
    </span>
  );
}

export default async function VocabularyDetailPage({
  params,
}: {
  params: Promise<{ domain: string; group: string }>;
}) {
  const { domain: domainRaw, group: groupRaw } = await params;
  const domain = decodeURIComponent(domainRaw);
  const group = decodeURIComponent(groupRaw);
  const vg = findGroup(domain, group);
  if (!vg) notFound();

  const usages = getProjectsUsingGroup(vg.domain, vg.group);

  const sortedValues = [...vg.values].sort((a, b) => {
    const aHas = typeof a.displayOrder === "number";
    const bHas = typeof b.displayOrder === "number";
    if (aHas && bHas) return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    if (aHas) return -1;
    if (bHas) return 1;
    return a.code.localeCompare(b.code);
  });

  const totalColumnHits = usages.reduce(
    (sum, u) => sum + u.columns.length,
    0,
  );

  return (
    <div className="space-y-10">
      <header>
        <p className="text-xs">
          <Link href="/standards/data-model/vocabularies">← Vocabularies</Link>
        </p>
        <p className="mt-3 text-[11px] font-semibold uppercase tracking-wider text-ui-gold-dark">
          {vg.domain}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-3xl font-black tracking-tight text-ui-charcoal">
            {vg.group}
          </h1>
          {vg.application && (
            <span className="rounded bg-brand-huckleberry/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-brand-huckleberry">
              {vg.application}
            </span>
          )}
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-3 text-sm md:grid-cols-3">
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
              Allowed values
            </dt>
            <dd className="mt-1 font-bold text-ui-charcoal">
              {vg.values.length}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
              Projects using
            </dt>
            <dd className="mt-1 font-bold text-ui-charcoal">
              {usages.length}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] font-medium uppercase tracking-wider text-gray-500">
              Column references
            </dt>
            <dd className="mt-1 font-bold text-ui-charcoal">
              {totalColumnHits}
            </dd>
          </div>
        </dl>
      </header>

      {vg.description && (
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <p className="text-sm leading-relaxed text-gray-700">
            {vg.description}
          </p>
        </section>
      )}

      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-bold text-ui-charcoal">Allowed values</h2>
          <p className="mt-1 text-sm text-gray-600">
            Codes are the persisted form; labels are the human-readable
            display. Display Order, when set, is the suggested sort order
            for pickers and selects.
          </p>
        </div>

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full min-w-[640px] text-left">
            <thead className="border-b border-gray-200 bg-gray-50">
              <tr className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                <th scope="col" className="px-3 py-2">
                  Code
                </th>
                <th scope="col" className="px-3 py-2">
                  Label
                </th>
                <th scope="col" className="px-3 py-2">
                  Order
                </th>
                <th scope="col" className="px-3 py-2">
                  Description
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedValues.map((v) => (
                <tr
                  key={v.code}
                  className="border-t border-gray-100 align-top"
                >
                  <td className="px-3 py-2 font-mono text-xs text-ui-charcoal">
                    {v.code}
                  </td>
                  <td className="px-3 py-2 text-xs text-ui-charcoal">
                    {v.label}
                  </td>
                  <td className="px-3 py-2 font-mono text-xs text-gray-600">
                    {typeof v.displayOrder === "number" ? v.displayOrder : ""}
                  </td>
                  <td className="px-3 py-2 text-xs text-gray-600">
                    {v.description ?? ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <div>
          <h2 className="text-xl font-bold text-ui-charcoal">Used by</h2>
          <p className="mt-1 text-sm text-gray-600">
            Every project, table, and column in the catalog whose values are
            controlled by this vocabulary group. Match reason is shown so
            the heuristic stays auditable.
          </p>
        </div>

        {usages.length === 0 ? (
          <p className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            No catalog tables reference this group via foreign-key or
            column-name match. The values may still be used outside the
            catalog (e.g., in process maps or workflow extraction tasks).
          </p>
        ) : (
          <ul className="space-y-3">
            {usages.map((u) => {
              const project = getProject(u.project);
              return (
                <li
                  key={u.project}
                  className="rounded-lg border border-gray-200 bg-white p-4"
                >
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-ui-gold-dark">
                    {project?.domain ?? ""}
                  </p>
                  <p className="mt-1">
                    <Link
                      href={`/standards/data-model/projects/${u.project}`}
                      className="text-base font-bold text-ui-charcoal"
                    >
                      {project?.application ?? u.project}
                    </Link>
                  </p>
                  <ul className="mt-3 space-y-1.5 text-xs">
                    {u.columns.map((c) => (
                      <li
                        key={`${c.table}-${c.column}`}
                        className="flex flex-wrap items-center gap-2"
                      >
                        <Link
                          href={`/standards/data-model/tables/${u.project}/${encodeURIComponent(c.table)}`}
                          className="unstyled font-mono text-ui-charcoal hover:text-brand-clearwater"
                        >
                          {c.table}
                        </Link>
                        <span className="text-gray-400">·</span>
                        <span className="font-mono text-gray-700">
                          {c.column}
                        </span>
                        <ReasonBadge reason={c.reason} />
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <footer className="rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-xs text-gray-600">
        Cross-walk is a v1 heuristic — see{" "}
        <span className="font-mono">lib/governance/vocabulary-usage.ts</span>{" "}
        for the matching logic and tie-breaking rules. Source of truth:{" "}
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
