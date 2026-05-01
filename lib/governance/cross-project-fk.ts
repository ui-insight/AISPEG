// Cross-project foreign-key / relationship detection across the governance
// catalog. A "cross-project reference" is an FK or declared Relationship on
// table A in project P whose target table name resolves only to project(s)
// other than P.
//
// As of slice #59 the upstream catalog convention does not yet encode
// cross-project lineage explicitly: every FK string and Relationship.target
// is a bare table name, and each project's catalog is parsed in isolation.
// In practice this means `getCrossProjectReferences()` returns an empty
// array today — see the audit findings in PR #59 / issue
// `ui-insight/data-governance#<TBD>` for the proposed catalog convention.
//
// The helper still ships so consumers (the Table detail page, the Tables
// tab) can render lineage automatically once the upstream representation
// lands. Treat the empty case as a useful negative result, not an absence.
//
// Detection mechanics:
//   1. Build a map: tableName -> Set<project> (which projects host a table
//      by this name). Names are matched case-sensitively because the
//      catalog is case-sensitive throughout.
//   2. For each (sourceProject, sourceTable) pair, scan:
//      a. Every column.foreignKey of the form "<TargetTable>.<col>".
//         Resolve <TargetTable> against the map. If hosted in another
//         project AND not in the source project, it's a cross-project FK.
//      b. Every relationships[].target. Same logic, reason
//         "declared-relationship".
//   3. The same target table may live in several other projects (e.g.
//      a hypothetical institutional `Personnel` shared by both
//      `audit-dashboard` and `openera`). The helper emits one
//      CrossProjectRef per resolved (sourceProject, sourceTable, sourceColumn,
//      targetProject, targetTable) tuple — i.e. it fans out across all
//      hosting projects so renderers can link to each destination. If
//      multiple reasons fire on the same column→target pair (FK + a
//      declared relationship to the same target), the FK wins; renderers
//      should not show duplicates.

import { tables } from "./catalog";
import type { Table } from "./types";

export type CrossProjectReason = "foreign-key" | "declared-relationship";

export interface CrossProjectRef {
  sourceProject: string;
  sourceTable: string;
  /** Column name when the reason is "foreign-key"; null for relationships. */
  sourceColumn: string | null;
  targetProject: string;
  targetTable: string;
  reason: CrossProjectReason;
}

/** Build the project-hosting map once per call. Cheap (O(tables)); the
 * catalog is small and the helper is invoked from server components.
 */
function buildTableHostMap(): Map<string, Set<string>> {
  const map = new Map<string, Set<string>>();
  for (const t of tables) {
    let set = map.get(t.name);
    if (!set) {
      set = new Set<string>();
      map.set(t.name, set);
    }
    set.add(t.project);
  }
  return map;
}

function parseForeignKeyTargetTable(fk: string): string | null {
  // Catalog convention: "<TableName>.<column>" — single dot. We tolerate
  // longer forms ("<TableName>.<column>.<sub>") by taking the head segment.
  const idx = fk.indexOf(".");
  if (idx <= 0) return null;
  return fk.slice(0, idx);
}

function refKey(r: CrossProjectRef): string {
  return [
    r.sourceProject,
    r.sourceTable,
    r.sourceColumn ?? "",
    r.targetProject,
    r.targetTable,
    r.reason,
  ].join("");
}

function sortRefs(refs: CrossProjectRef[]): CrossProjectRef[] {
  // Deterministic ordering for stable rendering: source first, then target,
  // then column, with FK reason ahead of declared-relationship when ties
  // remain.
  return refs.sort((a, b) => {
    const cmp =
      a.sourceProject.localeCompare(b.sourceProject) ||
      a.sourceTable.localeCompare(b.sourceTable) ||
      a.targetProject.localeCompare(b.targetProject) ||
      a.targetTable.localeCompare(b.targetTable) ||
      (a.sourceColumn ?? "").localeCompare(b.sourceColumn ?? "");
    if (cmp !== 0) return cmp;
    if (a.reason === b.reason) return 0;
    return a.reason === "foreign-key" ? -1 : 1;
  });
}

function collectForTable(
  source: Table,
  hostMap: Map<string, Set<string>>,
): CrossProjectRef[] {
  const out: CrossProjectRef[] = [];
  const seen = new Set<string>();

  // Foreign-key columns.
  for (const c of source.columns) {
    if (!c.foreignKey) continue;
    const targetTable = parseForeignKeyTargetTable(c.foreignKey);
    if (!targetTable) continue;
    const hosts = hostMap.get(targetTable);
    if (!hosts) continue;
    if (hosts.has(source.project)) continue; // resolves locally — not cross-project
    for (const targetProject of hosts) {
      const ref: CrossProjectRef = {
        sourceProject: source.project,
        sourceTable: source.name,
        sourceColumn: c.name,
        targetProject,
        targetTable,
        reason: "foreign-key",
      };
      const k = refKey(ref);
      if (!seen.has(k)) {
        seen.add(k);
        out.push(ref);
      }
    }
  }

  // Declared relationships.
  for (const r of source.relationships) {
    const hosts = hostMap.get(r.target);
    if (!hosts) continue;
    if (hosts.has(source.project)) continue;
    for (const targetProject of hosts) {
      const ref: CrossProjectRef = {
        sourceProject: source.project,
        sourceTable: source.name,
        sourceColumn: null,
        targetProject,
        targetTable: r.target,
        reason: "declared-relationship",
      };
      const k = refKey(ref);
      // If an FK already covered the same source→target pair on a column,
      // prefer the FK record and drop the relationship duplicate. We do
      // this by checking for any existing FK ref on the same source table
      // pointing at the same target.
      const fkAlreadyCovers = out.some(
        (existing) =>
          existing.reason === "foreign-key" &&
          existing.sourceProject === ref.sourceProject &&
          existing.sourceTable === ref.sourceTable &&
          existing.targetProject === ref.targetProject &&
          existing.targetTable === ref.targetTable,
      );
      if (fkAlreadyCovers) continue;
      if (!seen.has(k)) {
        seen.add(k);
        out.push(ref);
      }
    }
  }

  return out;
}

/** Every cross-project reference detected in the catalog. */
export function getCrossProjectReferences(): CrossProjectRef[] {
  const hostMap = buildTableHostMap();
  const out: CrossProjectRef[] = [];
  for (const t of tables) {
    out.push(...collectForTable(t, hostMap));
  }
  return sortRefs(out);
}

/**
 * References that point INTO (project, table) — i.e. external tables that
 * declare an FK or relationship targeting this table. Use on a Table
 * detail page to render an "Also referenced by" section.
 */
export function getInboundReferencesForTable(
  project: string,
  table: string,
): CrossProjectRef[] {
  return getCrossProjectReferences().filter(
    (r) => r.targetProject === project && r.targetTable === table,
  );
}

/**
 * References that point OUT FROM (project, table) — i.e. FKs or
 * relationships on this table whose target lives only in another project.
 * Use on a Table detail page to render a "References tables in" section.
 */
export function getOutboundReferencesForTable(
  project: string,
  table: string,
): CrossProjectRef[] {
  return getCrossProjectReferences().filter(
    (r) => r.sourceProject === project && r.sourceTable === table,
  );
}
