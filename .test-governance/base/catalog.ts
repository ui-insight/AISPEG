// Stub base catalog for testing governance-pr-summary.ts
import type { Project, Table } from "../../lib/governance/types";

export const projects: Project[] = [
  {
    slug: "openera",
    application: "OpenERA",
    repository: "https://github.com/ui-insight/OpenERA",
    domain: "Research Administration",
    techStack: {},
    tableCount: 1,
    canonicalUdmCount: 0,
    projectExtensionCount: 1,
  },
];

export const tables: Table[] = [
  {
    project: "openera",
    kind: "table",
    name: "removed_table",
    columns: [
      { name: "id", type: "INTEGER", primaryKey: true, foreignKey: null },
      { name: "name", type: "VARCHAR", foreignKey: null },
    ],
    uniqueConstraints: [],
    relationships: [],
    classification: "project-extension",
  },
  {
    project: "openera",
    kind: "table",
    name: "kept_table",
    columns: [
      { name: "id", type: "INTEGER", primaryKey: true, foreignKey: null },
      { name: "old_column", type: "TEXT", foreignKey: null },
    ],
    uniqueConstraints: [],
    relationships: [],
    classification: "project-extension",
  },
];

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getTablesForProject(slug: string): Table[] {
  return tables.filter((t) => t.project === slug);
}
