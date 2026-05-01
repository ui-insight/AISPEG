// Cross-walk helpers between the vocabulary registry (vocabularies.ts) and
// the table catalog (catalog.ts). A "use" is detected via:
//   1. A column whose `foreignKey` points at "AllowedValues.<group>" (strong
//      signal — explicit FK to the controlled-vocabulary table).
//   2. A column whose normalized name matches the normalized group name —
//      e.g. column `Report_Type` matches group `ReportType` (weaker but
//      covers projects that don't materialize the FK relationship).
//
// The same heuristic backs the Vocab pill on the Table detail page (#56)
// and the "used by" listing on the Vocabulary detail page (#57). Keep
// these helpers as the single source of truth — do not re-derive inline.

import { tables } from "./catalog";
import { vocabularyGroups } from "./vocabularies";
import type { Column, Table, VocabularyGroup } from "./types";

export type MatchReason = "foreign-key" | "column-name";

export interface ColumnUsage {
  project: string; // project slug
  table: string; // table name
  column: string; // column name
  reason: MatchReason;
}

export interface ProjectUsage {
  project: string; // project slug
  /** Distinct (table, column) hits inside this project. */
  columns: ColumnUsage[];
}

/** Strip separators / casing differences so PascalCase, snake_case, and
 * camelCase variants compare equal. Trailing "id" is dropped because UDM
 * tables sometimes use `<group>_ID` for the FK column.
 */
export function normalizeName(s: string): string {
  return s
    .replace(/[_\s-]+/g, "")
    .replace(/id$/i, "")
    .toLowerCase();
}

/** A group's identity inside the registry — the same `<domain>/<group>`
 * pair we use for the detail-page route.
 */
export interface GroupKey {
  domain: string;
  group: string;
}

function fkPointsAtGroup(fk: string | null | undefined, group: string): boolean {
  if (!fk) return false;
  // Either "AllowedValues.<group>" exactly, or "AllowedValues.<group>.<col>".
  if (!fk.startsWith("AllowedValues.")) return false;
  const tail = fk.slice("AllowedValues.".length);
  const head = tail.split(".")[0] ?? "";
  return head === group;
}

function columnMatchesGroup(column: Column, group: VocabularyGroup): MatchReason | null {
  if (fkPointsAtGroup(column.foreignKey, group.group)) return "foreign-key";
  const colN = normalizeName(column.name);
  if (!colN) return null;
  if (colN === normalizeName(group.group)) return "column-name";
  return null;
}

/**
 * Every (project, table, column) that references a given vocabulary group.
 * Order: project slug, then table name, then column name (stable for
 * deterministic rendering).
 */
export function getColumnsReferencingGroup(
  domain: string,
  group: string,
): ColumnUsage[] {
  const target = vocabularyGroups.find(
    (g) => g.domain === domain && g.group === group,
  );
  if (!target) return [];

  const out: ColumnUsage[] = [];
  for (const t of tables) {
    for (const c of t.columns) {
      const reason = columnMatchesGroup(c, target);
      if (reason) {
        out.push({
          project: t.project,
          table: t.name,
          column: c.name,
          reason,
        });
      }
    }
  }
  out.sort(
    (a, b) =>
      a.project.localeCompare(b.project) ||
      a.table.localeCompare(b.table) ||
      a.column.localeCompare(b.column),
  );
  return out;
}

/**
 * Distinct projects using a vocabulary group, with the column hits inside
 * each. A project "uses" a group if at least one of its columns matches.
 */
export function getProjectsUsingGroup(
  domain: string,
  group: string,
): ProjectUsage[] {
  const usages = getColumnsReferencingGroup(domain, group);
  const byProject = new Map<string, ColumnUsage[]>();
  for (const u of usages) {
    const list = byProject.get(u.project) ?? [];
    list.push(u);
    byProject.set(u.project, list);
  }
  return Array.from(byProject.entries())
    .map(([project, columns]) => ({ project, columns }))
    .sort((a, b) => a.project.localeCompare(b.project));
}

/** Convenience: just the count. Avoids walking twice for the index page. */
export function getProjectsUsingGroupCount(
  domain: string,
  group: string,
): number {
  return getProjectsUsingGroup(domain, group).length;
}

/**
 * Resolve which vocabulary group a given column on a given table refers to.
 * Used to hyperlink the "Vocab" pill on the Table detail page.
 *
 * Tie-break order when multiple groups match (e.g. `DocumentType` exists
 * in both `audit` and `research-admin`):
 *   1. FK matches always win over name-only matches.
 *   2. Among matches of the same strength, prefer the group whose
 *      `domain` matches the table's project domain (best heuristic
 *      we have without a project-to-vocab-domain mapping).
 *   3. Then prefer `domain === "shared"` (in case future shared vocabs land).
 *   4. Otherwise return the first hit (deterministic — vocabularyGroups
 *      iterates in domain-then-source-order).
 *
 * Returns null if nothing matches OR if the heuristic is too ambiguous to
 * pick a single destination — the pill stays unlinked rather than 404.
 */
export function resolveVocabularyGroupForColumn(
  table: Table,
  column: Column,
): GroupKey | null {
  type Hit = { reason: MatchReason; group: VocabularyGroup };
  const hits: Hit[] = [];
  for (const g of vocabularyGroups) {
    const reason = columnMatchesGroup(column, g);
    if (reason) hits.push({ reason, group: g });
  }
  if (hits.length === 0) return null;

  const fkHits = hits.filter((h) => h.reason === "foreign-key");
  const pool = fkHits.length > 0 ? fkHits : hits;

  if (pool.length === 1) {
    return { domain: pool[0].group.domain, group: pool[0].group.group };
  }

  // Tie-break: prefer same-domain-as-project. The catalog's project domain
  // (e.g. "Internal Audit") is human-prose; vocabulary domains are slugs
  // ("audit"). Compare via slug-on-application as a coarse alignment.
  const projectSlugLower = table.project.toLowerCase();
  const sameDomain = pool.find((h) => {
    const d = h.group.domain.toLowerCase();
    if (d === projectSlugLower) return true;
    // Slug families: audit-dashboard ↔ audit, ucm-daily-register ↔ communications,
    // etc. We do not have the catalog Project record here, but the slug-prefix
    // overlap is good enough for the common cases.
    if (projectSlugLower.startsWith(d)) return true;
    if (d.startsWith(projectSlugLower)) return true;
    return false;
  });
  if (sameDomain) {
    return { domain: sameDomain.group.domain, group: sameDomain.group.group };
  }

  const shared = pool.find((h) => h.group.domain === "shared");
  if (shared) return { domain: shared.group.domain, group: shared.group.group };

  return { domain: pool[0].group.domain, group: pool[0].group.group };
}
