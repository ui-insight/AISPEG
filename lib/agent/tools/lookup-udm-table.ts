// lookup_udm_table — fetch the columns + classification for one table
// in the AI4RA Unified Data Model catalog.

import "server-only";
import { tables as governanceTables } from "@/lib/governance/catalog";
import type { ToolHandler, ToolResult } from "./registry";

function pickString(args: Record<string, unknown>, key: string): string | undefined {
  const v = args[key];
  return typeof v === "string" && v.trim() !== "" ? v : undefined;
}

export const lookupUdmTableTool: ToolHandler = {
  definition: {
    type: "function",
    function: {
      name: "lookup_udm_table",
      description:
        "Fetch a single Unified Data Model table by project slug and table name. Returns columns (name, type, FK), classification (canonical-udm vs project-extension), and the canonical URL. Use when the user asks about specific tables, schemas, or columns in a governed project.",
      parameters: {
        type: "object",
        properties: {
          project: {
            type: "string",
            description:
              "Project slug from list_governance_projects (e.g. 'audit-dashboard', 'openera', 'processmapping').",
          },
          table: {
            type: "string",
            description:
              "Table name (case-insensitive, exact match). Examples: 'AuditReport', 'Observation', 'Project'.",
          },
        },
        required: ["project", "table"],
        additionalProperties: false,
      },
    },
  },
  async execute(rawArgs): Promise<ToolResult> {
    const project = pickString(rawArgs, "project");
    const table = pickString(rawArgs, "table");
    if (!project || !table) {
      return {
        data: { error: "project and table are required" },
        canonicalUrl: "/standards/data-model",
      };
    }
    const wanted = table.toLowerCase();
    const found = governanceTables.find(
      (t) => t.project === project && t.name.toLowerCase() === wanted
    );
    if (!found) {
      return {
        data: { found: false, project, table },
        canonicalUrl: `/standards/data-model/tables`,
      };
    }
    const url = `/standards/data-model/tables/${project}/${found.name}`;
    return {
      data: {
        found: true,
        project,
        name: found.name,
        kind: found.kind,
        classification: found.classification,
        description: found.description ?? null,
        modelClass: found.modelClass ?? null,
        columns: found.columns,
        uniqueConstraints: found.uniqueConstraints,
        relationships: found.relationships,
        url,
      },
      canonicalUrl: url,
    };
  },
};
